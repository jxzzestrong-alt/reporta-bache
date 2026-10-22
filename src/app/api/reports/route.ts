import { NextResponse } from "next/server";
import { CITY } from "@/lib/config";
import { sendReportEmail } from "@/lib/email";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { createReport, listReports, setEmailStatus } from "@/lib/store";
import { isUrgency } from "@/lib/urgency";
import { distanceKm } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Identifica el formato real de la imagen por sus primeros bytes. */
function sniffImage(buf: Buffer): { contentType: string; ext: string } | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { contentType: "image/jpeg", ext: "jpg" };
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return { contentType: "image/png", ext: "png" };
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP")
    return { contentType: "image/webp", ext: "webp" };
  return null;
}

export async function GET() {
  try {
    const reports = await listReports();
    return NextResponse.json({ reports }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[GET /api/reports]", err);
    return fail("No pudimos cargar los reportes. Intenta de nuevo en un momento.", 500);
  }
}

export async function POST(req: Request) {
  const limit = rateLimit(clientIp(req.headers));
  if (!limit.ok) {
    return fail(
      `Ya enviaste varios reportes seguidos. Podrás enviar otro en ${limit.retryInMinutes} min.`,
      429,
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("El formulario llegó incompleto. Revisa tu conexión e intenta de nuevo.");
  }

  // Campo trampa: los humanos no lo ven; los bots suelen llenarlo.
  if (String(form.get("website") ?? "").trim() !== "") return fail("Solicitud no válida.");

  const lat = Number(form.get("lat"));
  const lng = Number(form.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return fail("Falta la ubicación del bache. Vuelve al paso 1 y marca el punto en el mapa.");
  }
  if (distanceKm(CITY.center, { lat, lng }) > CITY.maxDistanceKm) {
    return fail(`La ubicación está fuera de ${CITY.name}. Marca un punto dentro del municipio.`);
  }

  const urgency = form.get("urgency");
  if (!isUrgency(urgency)) return fail("Elige qué tan grave es el bache (paso 2).");

  const address = String(form.get("address") ?? "").trim().slice(0, 300) || null;
  const comment = String(form.get("comment") ?? "").trim().slice(0, 1000) || null;

  const photoFile = form.get("photo");
  if (!(photoFile instanceof File) || photoFile.size === 0) {
    return fail("Falta la fotografía del bache (paso 3).");
  }
  if (photoFile.size > MAX_PHOTO_BYTES) {
    return fail("La foto pesa más de 5 MB. Toma otra foto o elige una más ligera.");
  }
  const buffer = Buffer.from(await photoFile.arrayBuffer());
  const kind = sniffImage(buffer);
  if (!kind) return fail("El archivo no es una foto válida. Usa una imagen JPG, PNG o WebP.");

  const photo = { buffer, ...kind };

  let report;
  try {
    report = await createReport({ lat, lng, address, urgency, comment, photo });
  } catch (err) {
    console.error("[POST /api/reports] guardar", err);
    return fail("No pudimos guardar tu reporte. Intenta de nuevo en unos minutos.", 500);
  }

  // Envío automático a las autoridades (se espera para que no se corte en servidores sin estado).
  const sent = await sendReportEmail(report, photo);
  if (sent.status === "error") console.error("[POST /api/reports] correo", sent.detail);
  await setEmailStatus(report.id, sent.status, sent.channel ? { channel: sent.channel, detail: sent.detail } : undefined);
  report.email_status = sent.status;

  return NextResponse.json({ report }, { status: 201 });
}
