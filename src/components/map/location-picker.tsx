"use client";

import type { LeafletEvent, Marker as LeafletMarker } from "leaflet";
import { useEffect, useMemo } from "react";
import { Circle, MapContainer, Marker, useMap, useMapEvents } from "react-leaflet";
import { CITY } from "@/lib/config";
import { BaseLayers, type BaseLayer } from "./layers";
import { pickerIcon } from "./pins";

export interface PickerPoint {
  lat: number;
  lng: number;
}

interface Props {
  value: PickerPoint | null;
  /** Cambia cuando el punto viene del GPS o del buscador, para mover la cámara. */
  flyKey: number;
  accuracy?: number | null;
  layer: BaseLayer;
  onPick: (p: PickerPoint) => void;
}

function ClickToPick({ onPick }: { onPick: Props["onPick"] }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function FlyTo({ value, flyKey }: { value: PickerPoint | null; flyKey: number }) {
  const map = useMap();
  useEffect(() => {
    if (value && flyKey > 0) map.flyTo([value.lat, value.lng], Math.max(map.getZoom(), 18), { duration: 0.8 });
    // Solo reaccionar a flyKey: arrastrar el pin no debe mover la cámara.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyKey]);
  return null;
}

export default function LocationPicker({ value, flyKey, accuracy, layer, onPick }: Props) {
  const handlers = useMemo(
    () => ({
      dragend(e: LeafletEvent) {
        const ll = (e.target as LeafletMarker).getLatLng();
        onPick({ lat: ll.lat, lng: ll.lng });
      },
    }),
    [onPick],
  );

  return (
    <MapContainer
      center={value ? [value.lat, value.lng] : [CITY.center.lat, CITY.center.lng]}
      zoom={value ? 18 : CITY.zoom}
      maxZoom={20}
      className="h-full w-full"
      scrollWheelZoom
    >
      <BaseLayers layer={layer} />
      <ClickToPick onPick={onPick} />
      <FlyTo value={value} flyKey={flyKey} />
      {value && accuracy && accuracy > 15 && (
        <Circle
          center={[value.lat, value.lng]}
          radius={accuracy}
          pathOptions={{ color: "#1b2125", weight: 1.5, fillColor: "#ffc72c", fillOpacity: 0.15 }}
        />
      )}
      {value && (
        <Marker
          position={[value.lat, value.lng]}
          icon={pickerIcon}
          draggable
          eventHandlers={handlers}
          keyboard
          title="Punto del bache (puedes arrastrarlo)"
        />
      )}
    </MapContainer>
  );
}
