// Capa de datos del servidor.
// · Con variables de Supabase → base de datos + Storage en la nube.
// · Sin ellas → "modo de prueba": guarda en .data/ (solo para desarrollo local).

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { CITY } from "./config";
import { PUBLIC_REPORT_COLUMNS, type EmailStatus, type Report, type Urgency } from "./types";

export interface NewReportInput {
  lat: number;
  lng: number;
  address: string | null;
  urgency: Urgency;
  comment: string | null;
  photo: { buffer: Buffer; contentType: string; ext: string };
}

const BUCKET = process.env.SUPABASE_BUCKET || "fotos-baches";

export function isDemoMode() {
  return !(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

let admin: SupabaseClient | null = null;
function supabaseAdmin() {
  if (!admin) {
    admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return admin;
}

// ─────────────────────────── Supabase ───────────────────────────

async function sbCreate(input: NewReportInput): Promise<Report> {
  const sb = supabaseAdmin();
  const id = randomUUID();
  const year = new Date().getFullYear();
  const photoPath = `${year}/${id}.${input.photo.ext}`;

  const upload = await sb.storage.from(BUCKET).upload(photoPath, input.photo.buffer, {
    contentType: input.photo.contentType,
    cacheControl: "31536000",
    upsert: false,
  });
  if (upload.error) throw new Error(`No se pudo guardar la foto: ${upload.error.message}`);

  const photoUrl = sb.storage.from(BUCKET).getPublicUrl(photoPath).data.publicUrl;

  const { data, error } = await sb
    .from("reports")
    .insert({
      id,
      lat: input.lat,
      lng: input.lng,
      address: input.address,
      urgency: input.urgency,
      comment: input.comment,
      photo_url: photoUrl,
      photo_path: photoPath,
    })
    .select(PUBLIC_REPORT_COLUMNS)
    .single();

  if (error || !data) {
    await sb.storage.from(BUCKET).remove([photoPath]);
    throw new Error(`No se pudo guardar el reporte: ${error?.message ?? "sin respuesta"}`);
  }
  return data as unknown as Report;
}

async function sbList(limit: number): Promise<Report[]> {
  const { data, error } = await supabaseAdmin()
    .from("reports")
    .select(PUBLIC_REPORT_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Report[];
}

async function sbGetByFolio(folio: string): Promise<Report | null> {
  const { data, error } = await supabaseAdmin()
    .from("reports")
    .select(PUBLIC_REPORT_COLUMNS)
    .eq("folio", folio)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as unknown as Report) ?? null;
}

async function sbSetEmailStatus(id: string, status: EmailStatus, log?: { channel: string; detail?: string }) {
  const sb = supabaseAdmin();
  await sb.from("reports").update({ email_status: status }).eq("id", id);
  if (log) {
    await sb.from("report_notifications").insert({
      report_id: id,
      channel: log.channel,
      status,
      detail: log.detail?.slice(0, 2000) ?? null,
    });
  }
}

// ───────────────────────── Modo de prueba ─────────────────────────

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "reports.json");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

let queue: Promise<unknown> = Promise.resolve();
function locked<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

async function readLocal(): Promise<Report[]> {
  try {
    return JSON.parse(await fs.readFile(DATA_FILE, "utf8")) as Report[];
  } catch {
    return [];
  }
}

async function writeLocal(reports: Report[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(reports, null, 2));
}

function currentYear() {
  return Number(
    new Intl.DateTimeFormat("en-US", { timeZone: CITY.timeZone, year: "numeric" }).format(new Date()),
  );
}

async function localCreate(input: NewReportInput): Promise<Report> {
  return locked(async () => {
    const reports = await readLocal();
    const year = currentYear();
    const prefix = `BACHE-${year}-`;
    const last = reports
      .filter((r) => r.folio.startsWith(prefix))
      .reduce((max, r) => Math.max(max, Number(r.folio.slice(prefix.length)) || 0), 0);
    const n = last + 1;
    const folio = prefix + (n < 1000 ? String(n).padStart(3, "0") : String(n));

    const id = randomUUID();
    const fileName = `${id}.${input.photo.ext}`;
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, fileName), input.photo.buffer);

    const report: Report = {
      id,
      folio,
      created_at: new Date().toISOString(),
      lat: input.lat,
      lng: input.lng,
      address: input.address,
      urgency: input.urgency,
      comment: input.comment,
      photo_url: `/api/uploads/${fileName}`,
      status: "recibido",
      email_status: "pendiente",
    };
    reports.unshift(report);
    await writeLocal(reports);
    return report;
  });
}

async function localSetEmailStatus(id: string, status: EmailStatus) {
  await locked(async () => {
    const reports = await readLocal();
    const r = reports.find((x) => x.id === id);
    if (r) {
      r.email_status = status;
      await writeLocal(reports);
    }
  });
}

// ─────────────────────────── API pública ───────────────────────────

export function createReport(input: NewReportInput) {
  return isDemoMode() ? localCreate(input) : sbCreate(input);
}

export async function listReports(limit = 1000): Promise<Report[]> {
  if (isDemoMode()) return (await readLocal()).slice(0, limit);
  return sbList(limit);
}

export async function getReportByFolio(folio: string): Promise<Report | null> {
  if (!/^BACHE-\d{4}-\d{3,}$/.test(folio)) return null;
  if (isDemoMode()) return (await readLocal()).find((r) => r.folio === folio) ?? null;
  return sbGetByFolio(folio);
}

export async function setEmailStatus(
  id: string,
  status: EmailStatus,
  log?: { channel: string; detail?: string },
) {
  try {
    if (isDemoMode()) await localSetEmailStatus(id, status);
    else await sbSetEmailStatus(id, status, log);
  } catch (err) {
    console.error("[store] No se pudo actualizar email_status", err);
  }
}
