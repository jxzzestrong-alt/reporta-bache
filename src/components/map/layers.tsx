"use client";

import { TileLayer } from "react-leaflet";

export type BaseLayer = "calles" | "satelite";

/** Capas base gratuitas: OpenStreetMap (calles) y Esri World Imagery (satélite + nombres de calles). */
export function BaseLayers({ layer }: { layer: BaseLayer }) {
  if (layer === "satelite") {
    return (
      <>
        <TileLayer
          key="esri-imagery"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Imágenes &copy; Esri, Maxar, Earthstar Geographics"
          maxNativeZoom={19}
          maxZoom={20}
        />
        <TileLayer
          key="esri-roads"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
          maxNativeZoom={19}
          maxZoom={20}
          opacity={0.9}
        />
        <TileLayer
          key="esri-labels"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          maxNativeZoom={19}
          maxZoom={20}
        />
      </>
    );
  }
  return (
    <TileLayer
      key="osm"
      url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      maxNativeZoom={19}
      maxZoom={20}
    />
  );
}
