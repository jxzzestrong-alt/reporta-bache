import type { Urgency } from "@/lib/types";
import { URGENCY } from "@/lib/urgency";
import { cn } from "@/lib/utils";

export function UrgencyBadge({ urgency, className }: { urgency: Urgency; className?: string }) {
  const u = URGENCY[urgency];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold", className)}
      style={{ background: u.color, color: u.onColor }}
    >
      <span className="size-2 rounded-full" style={{ background: u.onColor }} aria-hidden />
      {u.label}
    </span>
  );
}

export function StatusText({ status }: { status: string }) {
  const map: Record<string, string> = {
    recibido: "Recibido",
    en_proceso: "En reparación",
    reparado: "Reparado",
  };
  return <>{map[status] ?? status}</>;
}
