import { FlaskConical } from "lucide-react";
import { isDemoMode } from "@/lib/store";

/** Aviso visible solo cuando la app corre sin Supabase (modo de prueba local). */
export function DemoBanner() {
  if (!isDemoMode()) return null;
  return (
    <p className="mb-6 flex gap-3 rounded-xl border-2 border-dashed border-grava bg-white p-4 text-[0.95rem] print:hidden">
      <FlaskConical className="mt-0.5 size-5 shrink-0" aria-hidden />
      <span>
        <strong>Modo de prueba.</strong> Los reportes se guardan en la carpeta <code>.data/</code> de este equipo. Agrega las
        variables de Supabase en <code>.env.local</code> para publicarlos.
      </span>
    </p>
  );
}
