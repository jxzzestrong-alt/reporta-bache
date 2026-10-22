import { Map as MapIcon, MapPinPlus } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-3xl font-extrabold">No encontramos ese reporte</h1>
      <p className="mt-3 text-lg text-grava">
        Revisa que el folio esté completo, por ejemplo BACHE-2026-001, o búscalo en el mapa ciudadano.
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link href="/mapa" className={buttonVariants({ variant: "outline", size: "lg" })}>
          <MapIcon aria-hidden /> Ir al mapa ciudadano
        </Link>
        <Link href="/" className={buttonVariants({ variant: "paint", size: "lg" })}>
          <MapPinPlus aria-hidden /> Reportar un bache
        </Link>
      </div>
    </div>
  );
}
