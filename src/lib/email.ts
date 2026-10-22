// Armado y envío del correo formal a las autoridades.
// Proveedores: Resend (si hay RESEND_API_KEY) o SMTP vía Nodemailer.

import { CITY, SITE_URL } from "./config";
import type { EmailStatus, Report } from "./types";
import { URGENCY } from "./urgency";
import { formatCoords, formatDateTime, googleMapsUrl, streetViewUrl } from "./utils";

const PHOTO_CID = "foto-bache";

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function absolute(url: string) {
  return url.startsWith("http") ? url : `${SITE_URL}${url}`;
}

function recipients() {
  const to = (process.env.AUTHORITY_EMAIL || "").trim();
  const cc = (process.env.AUTHORITY_EMAIL_CC || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return { to, cc };
}

export function buildReportEmail(report: Report, photoSrc: string | null) {
  const u = URGENCY[report.urgency];
  const date = formatDateTime(report.created_at);
  const coords = formatCoords(report.lat, report.lng);
  const mapsUrl = googleMapsUrl(report.lat, report.lng);
  const svUrl = streetViewUrl(report.lat, report.lng);
  const reportUrl = `${SITE_URL}/reporte/${report.folio}`;
  const authority = process.env.AUTHORITY_NAME || "Atención Ciudadana";
  const address = report.address || "Dirección no disponible (ver coordenadas)";
  const comment = report.comment?.trim();

  const subject = `[${u.emailTag}] Reporte de bache ${report.folio} — ${report.address ?? coords}`;

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #E3E6E4;color:#5B6468;font-size:13px;width:120px;padding-right:12px;vertical-align:top">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #E3E6E4;color:#1B2125;font-size:15px;vertical-align:top">${value}</td>
    </tr>`;

  const button = (href: string, text: string, primary = false) => `
    <a href="${esc(href)}" style="display:inline-block;margin:0 8px 8px 0;padding:12px 18px;border-radius:6px;font-weight:700;font-size:14px;text-decoration:none;${
      primary
        ? "background:#1B2125;color:#FFFFFF;"
        : "background:#FFFFFF;color:#1B2125;border:2px solid #1B2125;"
    }">${esc(text)}</a>`;

  const html = `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#EEF0EE;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF0EE;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#FFFFFF;border-radius:10px;overflow:hidden;border:1px solid #D5D9D7;">
        <tr><td style="background:#1B2125;padding:20px 28px;">
          <div style="color:#FFC72C;font-size:13px;font-weight:700;letter-spacing:.5px;">REPORTE CIUDADANO DE BACHE</div>
          <div style="color:#FFFFFF;font-size:24px;font-weight:700;margin-top:4px;">Folio ${esc(report.folio)}</div>
        </td></tr>
        <tr><td style="background:${u.color};color:${u.onColor};padding:12px 28px;font-size:16px;font-weight:700;">
          Nivel de urgencia: ${esc(u.label)} — ${esc(u.description)}
        </td></tr>
        <tr><td style="padding:24px 28px 8px;color:#1B2125;font-size:15px;line-height:1.55;">
          <p style="margin:0 0 12px;">Estimado equipo de ${esc(authority)}:</p>
          <p style="margin:0;">Un ciudadano reportó un bache en ${esc(CITY.name)} mediante la plataforma Reporta Bache. Les compartimos los datos para su atención.</p>
        </td></tr>
        <tr><td style="padding:8px 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${row("Fecha y hora", esc(date))}
            ${row("Ubicación", esc(address))}
            ${row("Coordenadas", `<a href="${esc(mapsUrl)}" style="color:#1B2125;">${esc(coords)}</a>`)}
            ${row("Comentario", comment ? esc(comment).replace(/\n/g, "<br>") : "<span style=\"color:#5B6468\">Sin comentario</span>")}
          </table>
        </td></tr>
        <tr><td style="padding:20px 28px 8px;">
          ${button(mapsUrl, "Abrir en Google Maps", true)}
          ${button(svUrl, "Ver en Street View")}
          ${button(reportUrl, "Ver reporte en línea")}
        </td></tr>
        ${
          photoSrc
            ? `<tr><td style="padding:12px 28px 4px;">
          <div style="color:#5B6468;font-size:13px;margin-bottom:8px;">Fotografía de evidencia (también va adjunta):</div>
          <img src="${esc(photoSrc)}" alt="Fotografía del bache ${esc(report.folio)}" width="584" style="display:block;width:100%;max-width:584px;height:auto;border-radius:6px;border:1px solid #D5D9D7;">
        </td></tr>`
            : ""
        }
        <tr><td style="padding:20px 28px 28px;color:#5B6468;font-size:12px;line-height:1.5;">
          Este mensaje se generó automáticamente a partir de un reporte ciudadano. Para dar seguimiento, cite el folio ${esc(report.folio)}.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    `REPORTE CIUDADANO DE BACHE — Folio ${report.folio}`,
    `Urgencia: ${u.label} (${u.description})`,
    `Fecha y hora: ${date}`,
    `Ubicación: ${address}`,
    `Coordenadas: ${coords}`,
    `Comentario: ${comment || "Sin comentario"}`,
    "",
    `Google Maps: ${mapsUrl}`,
    `Street View: ${svUrl}`,
    `Reporte en línea: ${reportUrl}`,
  ].join("\n");

  return { subject, html, text };
}

export interface SendResult {
  status: EmailStatus;
  channel?: "resend" | "smtp";
  detail?: string;
}

export async function sendReportEmail(
  report: Report,
  photo: { buffer: Buffer; contentType: string; ext: string },
): Promise<SendResult> {
  if (process.env.EMAIL_SEND_ENABLED !== "true") return { status: "desactivado" };

  const { to, cc } = recipients();
  const from = process.env.EMAIL_FROM;
  const replyTo = process.env.EMAIL_REPLY_TO || undefined;
  const filename = `${report.folio}.${photo.ext}`;

  if (!to || !from) return { status: "sin_configurar", detail: "Falta AUTHORITY_EMAIL o EMAIL_FROM" };

  // ── Opción A: Resend ──
  if (process.env.RESEND_API_KEY) {
    const photoUrl = report.photo_url ? absolute(report.photo_url) : null;
    const { subject, html, text } = buildReportEmail(report, photoUrl);
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `reporte-${report.id}`,
        },
        body: JSON.stringify({
          from,
          to: [to],
          cc: cc.length ? cc : undefined,
          reply_to: replyTo,
          subject,
          html,
          text,
          attachments: [{ filename, content: photo.buffer.toString("base64") }],
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        return { status: "error", channel: "resend", detail: `${res.status} ${await res.text()}` };
      }
      return { status: "enviado", channel: "resend", detail: await res.text() };
    } catch (err) {
      return { status: "error", channel: "resend", detail: String(err) };
    }
  }

  // ── Opción B: SMTP (Nodemailer) ──
  if (process.env.SMTP_HOST) {
    const { subject, html, text } = buildReportEmail(report, `cid:${PHOTO_CID}`);
    try {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      });
      const info = await transporter.sendMail({
        from,
        to,
        cc: cc.length ? cc : undefined,
        replyTo,
        subject,
        html,
        text,
        attachments: [
          { filename, content: photo.buffer, contentType: photo.contentType, cid: PHOTO_CID },
        ],
      });
      return { status: "enviado", channel: "smtp", detail: info.messageId };
    } catch (err) {
      return { status: "error", channel: "smtp", detail: String(err) };
    }
  }

  return { status: "sin_configurar", detail: "Falta RESEND_API_KEY o SMTP_HOST" };
}
