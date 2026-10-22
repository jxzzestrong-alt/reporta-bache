"use client";

import { ExternalLink, Footprints, MapPinned } from "lucide-react";
import { GOOGLE_MAPS_KEY } from "@/lib/config";
import { esriSnapshotUrl, formatCoords, googleMapsUrl, streetViewUrl } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { Dialog } from "./ui/dialog";

interface Props {
  open: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  address?: string | null;
}

/**
 * Vista a nivel de calle del punto.
 * · Con NEXT_PUBLIC_GOOGLE_MAPS_API_KEY → Street View interactivo dentro de la app.
 * · Sin clave → acercamiento satelital (Esri) + botón que abre Street View en Google Maps.
 */
export function StreetViewDialog({ open, onClose, lat, lng, address }: Props) {
  const coords = formatCoords(lat, lng);

  return (
    <Dialog open={open} onClose={onClose} title="Confirma el lugar">
      <p className="mb-4 text-grava">
        {address ? <strong className="text-asfalto">{address}</strong> : null}
        {address ? <br /> : null}
        Coordenadas {coords}
      </p>

      {GOOGLE_MAPS_KEY ? (
        <div className="overflow-hidden rounded-xl border-2 border-asfalto">
          <iframe
            title="Street View del punto seleccionado"
            src={`https://www.google.com/maps/embed/v1/streetview?key=${GOOGLE_MAPS_KEY}&location=${lat},${lng}&fov=90&language=es&region=MX`}
            className="aspect-[4/3] w-full"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : (
        <figure className="relative overflow-hidden rounded-xl border-2 border-asfalto bg-banqueta">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={esriSnapshotUrl(lat, lng)}
            alt="Vista satelital cercana del punto marcado"
            className="aspect-[8/5] w-full object-cover"
          />
          <span
            className="pointer-events-none absolute left-1/2 top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-pintura shadow-[0_0_0_3px_#1b2125]"
            aria-hidden
          />
          <figcaption className="bg-white px-4 py-2 text-sm text-grava">
            Vista satelital de cerca. El círculo amarillo es el punto marcado.
          </figcaption>
        </figure>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <a
          href={streetViewUrl(lat, lng)}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: GOOGLE_MAPS_KEY ? "outline" : "primary", size: "lg" })}
        >
          <Footprints aria-hidden />
          {GOOGLE_MAPS_KEY ? "Street View completo" : "Ver a nivel de calle"}
          <ExternalLink className="!size-4 opacity-70" aria-label="(abre otra pestaña)" />
        </a>
        <a
          href={googleMapsUrl(lat, lng)}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          <MapPinned aria-hidden />
          Ver en Google Maps
          <ExternalLink className="!size-4 opacity-70" aria-label="(abre otra pestaña)" />
        </a>
      </div>
      {!GOOGLE_MAPS_KEY && (
        <p className="mt-3 text-sm text-grava">
          «Ver a nivel de calle» abre Google Street View en otra pestaña. Si la imagen coincide, regresa aquí y continúa.
        </p>
      )}
    </Dialog>
  );
}
