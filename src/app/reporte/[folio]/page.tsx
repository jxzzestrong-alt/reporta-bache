import { ArrowLeft, Footprints, Map as MapIcon, MapPinned } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { PrintButton } from "@/components/print-button";
import { buttonVariants } from "@/components/ui/button";
import { StatusText } from "@/components/ui/urgency-badge";
import { CITY, SITE_URL } from "@/lib/config";
import { getReportByFolio } from "@/lib/store";
import { URGENCY } from "@/lib/urgency";
import { formatCoords, formatDateTime, googleMapsUrl, streetViewUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ folio: string }> };

function cleanFolio(raw: string) {
  let v = raw;
  try {
    v = decodeURIComponent(raw);
  } catch {
    /* folio mal escrito: se deja tal cual y no se encontrará */
  }
  return v.replace(/^#/, "").trim().toUpperCase();
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { folio } = await params;
  return { title: `Comprobante ${cleanFolio(folio)}` };
}

export default async function ComprobantePage({ params }: Params) {
  const folio = cleanFolio((await params).folio);
  const report = await getReportByFolio(folio);
  if (!report) notFound();

  const u = URGENCY[report.urgency];
  const url = `${SITE_URL}/reporte/${report.folio}`;
  const qr = await QRCode.toString(url, { type: "svg", margin: 0, color: { dark: "#1b2125", light: "#ffffff" } });
  const authority = process.env.AUTHORITY_NAME || "Atención Ciudadana del municipio";
  const emailText: Record<string, string> = {
    enviado: `Enviado por correo a ${authority}`,
    error: "Guardado; el correo automático no salió",
    desactivado: "Guardado; envío por correo pendiente de activar",
    sin_configurar: "Guardado; envío por correo pendiente de configurar",
    pendiente: "Guardado",
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-12 pt-6 print:max-w-none print:p-0">
      <Link
        href="/mapa"
        className="mb-4 inline-flex min-h-11 items-center gap-2 font-bold underline decoration-2 underline-offset-4 print:hidden"
      >
        <ArrowLeft className="size-5" aria-hidden /> Mapa ciudadano
      </Link>

      <article className="overflow-hidden rounded-2xl border-2 border-asfalto bg-white print:rounded-none">
        <header className="asphalt px-6 pb-5 pt-6 text-white print:bg-asfalto [print-color-adjust:exact]">
          <p className="font-semibold text-pintura">Comprobante de reporte · {CITY.name}</p>
          <h1 className="mt-1 font-mono text-[2rem] font-bold leading-none tracking-tight sm:text-[2.5rem]">
            #{report.folio}
          </h1>
          <p className="mt-2 text-white/85">{formatDateTime(report.created_at)}</p>
        </header>
        <div className="lane-dashes h-3 bg-asfalto [print-color-adjust:exact]" aria-hidden />
        <div
          className="px-6 py-3 text-lg font-bold [print-color-adjust:exact]"
          style={{ background: u.color, color: u.onColor }}
        >
          {u.label}: {u.description.toLowerCase()}
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto]">
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-semibold text-grava">Ubicación</dt>
              <dd className="text-lg font-bold leading-snug">{report.address || "Punto marcado en el mapa"}</dd>
              <dd className="text-grava">{formatCoords(report.lat, report.lng)}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-grava">Comentario</dt>
              <dd className={report.comment ? "" : "text-grava"}>{report.comment || "Sin comentario"}</dd>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              <div>
                <dt className="text-sm font-semibold text-grava">Estado</dt>
                <dd className="font-bold">
                  <StatusText status={report.status} />
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-grava">Envío a autoridades</dt>
                <dd className="font-bold">{emailText[report.email_status]}</dd>
              </div>
            </div>
          </dl>
          <figure className="flex flex-col items-center gap-2 self-start">
            <div className="size-32 [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: qr }} />
            <figcaption className="max-w-32 text-center text-xs text-grava">Escanea para ver el reporte en línea</figcaption>
          </figure>
        </div>

        {report.photo_url && (
          <figure className="px-6 pb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={report.photo_url}
              alt={`Fotografía del bache ${report.folio}`}
              className="max-h-[420px] w-full rounded-xl border-2 border-linea bg-banqueta object-contain print:max-h-[90mm]"
            />
          </figure>
        )}

        <footer className="border-t-2 border-linea px-6 py-4 text-sm text-grava">
          Para dar seguimiento, menciona el folio #{report.folio} en {authority}.{" "}
          <span className="hidden print:inline">Consulta en línea: {url}</span>
        </footer>
      </article>

      <div className="mt-6 space-y-3 print:hidden">
        <PrintButton />
        <div className="grid gap-3 sm:grid-cols-3">
          <a
            href={googleMapsUrl(report.lat, report.lng)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline" })}
          >
            <MapPinned aria-hidden /> Google Maps
          </a>
          <a
            href={streetViewUrl(report.lat, report.lng)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline" })}
          >
            <Footprints aria-hidden /> Street View
          </a>
          <Link href={`/mapa?folio=${report.folio}`} className={buttonVariants({ variant: "outline" })}>
            <MapIcon aria-hidden /> En el mapa
          </Link>
        </div>
      </div>
    </div>
  );
}
