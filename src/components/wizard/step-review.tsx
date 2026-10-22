"use client";

import { Mail, Pencil } from "lucide-react";
import { formatCoords } from "@/lib/utils";
import { UrgencyBadge } from "../ui/urgency-badge";
import type { ReportDraft } from "./types";

function Row({ label, onEdit, children }: { label: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-4">
      <div className="min-w-0 flex-1">
        <dt className="text-sm font-semibold text-grava">{label}</dt>
        <dd className="mt-1">{children}</dd>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="flex min-h-11 shrink-0 items-center gap-1.5 self-start rounded-lg px-3 font-bold underline decoration-2 underline-offset-4 hover:bg-banqueta"
        aria-label={`Cambiar ${label.toLowerCase()}`}
      >
        <Pencil className="size-4" aria-hidden /> Cambiar
      </button>
    </div>
  );
}

export function StepReview({
  draft,
  goTo,
  authorityName,
  authorityEmail,
}: {
  draft: ReportDraft;
  goTo: (step: number) => void;
  authorityName: string;
  authorityEmail: string;
}) {
  const { location, urgency, photo, comment } = draft;
  return (
    <div className="space-y-5">
      <dl className="divide-y-2 divide-linea rounded-xl border-2 border-linea bg-white px-4">
        <Row label="Ubicación" onEdit={() => goTo(0)}>
          {location && (
            <>
              <p className="text-lg font-bold">{location.address || "Punto marcado en el mapa"}</p>
              <p className="text-sm text-grava">{formatCoords(location.lat, location.lng)}</p>
            </>
          )}
        </Row>
        <Row label="Gravedad" onEdit={() => goTo(1)}>
          {urgency && <UrgencyBadge urgency={urgency} className="text-base" />}
        </Row>
        <Row label="Foto" onEdit={() => goTo(2)}>
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo.previewUrl} alt="Foto del bache" className="h-32 w-auto rounded-lg border-2 border-linea object-cover" />
          )}
        </Row>
        <Row label="Comentario" onEdit={() => goTo(3)}>
          <p className={comment.trim() ? "" : "text-grava"}>{comment.trim() || "Sin comentario"}</p>
        </Row>
      </dl>

      <p className="flex gap-3 rounded-xl bg-letrero-suave p-4 text-[0.95rem]">
        <Mail className="mt-0.5 size-5 shrink-0 text-letrero" aria-hidden />
        <span>
          Al enviar, tu reporte recibe un folio, aparece en el mapa ciudadano y se manda por correo a{" "}
          <strong>{authorityName}</strong>
          {authorityEmail ? ` (${authorityEmail})` : ""}. No pedimos tu nombre ni tus datos.
        </span>
      </p>
    </div>
  );
}
