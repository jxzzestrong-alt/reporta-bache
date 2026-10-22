import { Map as MapIcon, MapPinPlus, Phone } from "lucide-react";
import Link from "next/link";
import { CITY } from "@/lib/config";

export function SiteFooter() {
  const authority = process.env.AUTHORITY_NAME || "Atención Ciudadana del municipio";
  return (
    <footer className="asphalt mt-auto text-white print:hidden">
      <div className="lane-dashes h-4" aria-hidden />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-xl font-extrabold">Reporta Bache</p>
          <p className="mt-2 max-w-[42ch] text-white/75">
            Plataforma ciudadana para {CITY.name}. Cada reporte se guarda con folio y se envía a {authority}.
          </p>
        </div>

        <nav aria-label="Enlaces del pie de página">
          <p className="font-bold text-pintura">Secciones</p>
          <ul className="mt-3 space-y-1">
            <li>
              <Link href="/#reportar" className="inline-flex min-h-11 items-center gap-2 text-white/85 hover:text-white hover:underline">
                <MapPinPlus className="size-5" aria-hidden /> Reportar un bache
              </Link>
            </li>
            <li>
              <Link href="/mapa" className="inline-flex min-h-11 items-center gap-2 text-white/85 hover:text-white hover:underline">
                <MapIcon className="size-5" aria-hidden /> Mapa ciudadano
              </Link>
            </li>
          </ul>
        </nav>

        <div className="self-start rounded-xl border-2 border-white/80 p-4">
          <p className="flex items-center gap-2 text-lg font-extrabold">
            <Phone className="size-5 text-pintura" aria-hidden /> ¿Hubo un accidente?
          </p>
          <p className="mt-1 text-white/80">Si hay heridos o peligro inmediato, llama primero al</p>
          <a href="tel:911" className="mt-1 inline-block text-3xl font-extrabold text-pintura hover:underline">
            911
          </a>
        </div>
      </div>
    </footer>
  );
}
