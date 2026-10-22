import { Phone } from "lucide-react";
import { CITY } from "@/lib/config";

export function SiteFooter() {
  const authority = process.env.AUTHORITY_NAME || "Atención Ciudadana del municipio";
  return (
    <footer className="border-t-2 border-linea bg-white print:hidden">
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 text-[0.95rem] text-grava sm:grid-cols-[1fr_auto] sm:items-center">
        <p className="max-w-2xl">
          Plataforma ciudadana para {CITY.name}. Cada reporte se guarda con folio y se envía a {authority}.
        </p>
        <p className="flex items-center gap-2 font-bold text-asfalto">
          <Phone className="size-5 text-alerta" aria-hidden />
          ¿Hubo un accidente? Llama al 911.
        </p>
      </div>
    </footer>
  );
}
