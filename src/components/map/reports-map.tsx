"use client";

import type { Marker as LeafletMarker } from "leaflet";
import { Footprints, MapPinned } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { MapContainer, Marker, Popup, useMap } from "react-leaflet";
import { CITY } from "@/lib/config";
import type { Report } from "@/lib/types";
import { formatDateShort, googleMapsUrl } from "@/lib/utils";
import { StatusText, UrgencyBadge } from "../ui/urgency-badge";
import { BaseLayers, type BaseLayer } from "./layers";
import { urgencyIcon } from "./pins";

interface Props {
  reports: Report[];
  layer: BaseLayer;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onStreetView: (r: Report) => void;
}

function FocusSelected({
  selected,
  markers,
}: {
  selected: Report | null;
  markers: React.RefObject<Map<string, LeafletMarker>>;
}) {
  const map = useMap();
  useEffect(() => {
    if (!selected) return;
    map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 17), { duration: 0.7 });
    const t = setTimeout(() => markers.current?.get(selected.id)?.openPopup(), 750);
    return () => clearTimeout(t);
    // Solo al cambiar la selección: un reporte nuevo en vivo no debe mover la cámara.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);
  return null;
}

export default function ReportsMap({ reports, layer, selectedId, onSelect, onStreetView }: Props) {
  const markers = useRef(new Map<string, LeafletMarker>());
  const selected = reports.find((r) => r.id === selectedId) ?? null;

  return (
    <MapContainer center={[CITY.center.lat, CITY.center.lng]} zoom={CITY.zoom} maxZoom={20} className="h-full w-full">
      <BaseLayers layer={layer} />
      <FocusSelected selected={selected} markers={markers} />
      {reports.map((r) => (
        <Marker
          key={r.id}
          position={[r.lat, r.lng]}
          icon={urgencyIcon(r.urgency, r.id === selectedId)}
          zIndexOffset={r.id === selectedId ? 1000 : r.urgency === "muy_urgente" ? 200 : r.urgency === "urgente" ? 100 : 0}
          title={`${r.folio}: ${r.address ?? "bache reportado"}`}
          ref={(m) => {
            if (m) markers.current.set(r.id, m);
            else markers.current.delete(r.id);
          }}
          eventHandlers={{ click: () => onSelect(r.id) }}
        >
          <Popup>
            <article>
              {r.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.photo_url}
                  alt={`Foto del bache ${r.folio}`}
                  className="h-36 w-full rounded-t-[10px] bg-asfalto object-cover"
                  loading="lazy"
                />
              )}
              <div className="space-y-2 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <UrgencyBadge urgency={r.urgency} className="px-2.5 py-0.5 text-[13px]" />
                  <span className="font-mono text-[13px] font-bold">#{r.folio}</span>
                </div>
                <p className="font-bold leading-snug">{r.address || "Ubicación marcada en el mapa"}</p>
                {r.comment && <p className="text-[14px] text-grava">“{r.comment}”</p>}
                <p className="text-[13px] text-grava">
                  {formatDateShort(r.created_at)} · <StatusText status={r.status} />
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onStreetView(r)}
                    className="flex min-h-10 items-center justify-center gap-1 rounded-lg border-2 border-asfalto text-[13px] font-bold"
                  >
                    <Footprints className="size-4" aria-hidden /> Nivel calle
                  </button>
                  <a
                    href={googleMapsUrl(r.lat, r.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-10 items-center justify-center gap-1 rounded-lg border-2 border-asfalto text-[13px] font-bold !text-asfalto"
                  >
                    <MapPinned className="size-4" aria-hidden /> Google Maps
                  </a>
                </div>
                <Link
                  href={`/reporte/${r.folio}`}
                  className="block pt-1 text-center text-[13px] font-bold !text-asfalto underline underline-offset-2"
                >
                  Ver reporte completo
                </Link>
              </div>
            </article>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
