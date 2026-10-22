"use client";

import { CircleCheckBig, FileText, Map as MapIcon, MapPinPlus, TriangleAlert } from "lucide-react";
import Link from "next/link";
import type { Report } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { Button, buttonVariants } from "../ui/button";
import { UrgencyBadge } from "../ui/urgency-badge";

export function ReportSuccess({
  report,
  authorityName,
  onNew,
}: {
  report: Report;
  authorityName: string;
  onNew: () => void;
}) {
  const emailNote = {
    enviado: { ok: true, text: `Enviamos tu reporte por correo a ${authorityName}.` },
    desactivado: {
      ok: false,
      text: "Tu reporte quedó guardado. El envío automático por correo todavía no está activado en esta plataforma.",
    },
    sin_configurar: {
      ok: false,
      text: "Tu reporte quedó guardado. El envío automático por correo todavía no está configurado.",
    },
    error: {
      ok: false,
      text: `Tu reporte quedó guardado, pero el correo a ${authorityName} no salió. Puedes compartir tu comprobante directamente con ellos.`,
    },
    pendiente: { ok: false, text: "Tu reporte quedó guardado." },
  }[report.email_status];

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-asfalto bg-white">
      <div className="bg-letrero px-5 py-6 text-white sm:px-8">
        <CircleCheckBig className="size-12" aria-hidden />
        <h2 className="mt-3 text-3xl font-extrabold leading-tight" tabIndex={-1} id="exito">
          ¡Reporte enviado!
        </h2>
        <p className="mt-1 text-lg">Gracias por cuidar las calles de tu ciudad.</p>
      </div>

      <div className="space-y-5 px-5 py-6 sm:px-8">
        <div>
          <p className="text-sm font-semibold text-grava">Tu folio</p>
          <p className="font-mono text-4xl font-bold tracking-tight sm:text-5xl">#{report.folio}</p>
          <p className="mt-1 text-grava">{formatDateTime(report.created_at)}</p>
          <UrgencyBadge urgency={report.urgency} className="mt-3" />
        </div>

        <p
          className={`flex gap-3 rounded-xl p-4 ${emailNote.ok ? "bg-letrero-suave" : "bg-[#FDF6D8]"}`}
          role="status"
        >
          {emailNote.ok ? (
            <CircleCheckBig className="mt-0.5 size-5 shrink-0 text-letrero" aria-hidden />
          ) : (
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-[#8a6400]" aria-hidden />
          )}
          {emailNote.text}
        </p>

        <p className="text-[0.95rem] text-grava">Guarda tu folio: con él puedes dar seguimiento en Atención Ciudadana.</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link href={`/reporte/${report.folio}`} className={buttonVariants({ variant: "paint", size: "lg" })}>
            <FileText aria-hidden /> Ver y guardar comprobante
          </Link>
          <Link href={`/mapa?folio=${report.folio}`} className={buttonVariants({ variant: "outline", size: "lg" })}>
            <MapIcon aria-hidden /> Verlo en el mapa
          </Link>
        </div>
        <Button variant="ghost" size="lg" className="w-full underline decoration-2 underline-offset-4" onClick={onNew}>
          <MapPinPlus aria-hidden /> Reportar otro bache
        </Button>
      </div>
    </div>
  );
}
