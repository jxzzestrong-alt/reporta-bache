import type { CompressedPhoto } from "@/lib/image";
import type { Urgency } from "@/lib/types";

export interface LocationDraft {
  lat: number;
  lng: number;
  /** null = buscando dirección · "" = no se encontró */
  address: string | null;
  addressDetail: string | null;
  source: "gps" | "search" | "map";
  accuracy: number | null;
}

export interface ReportDraft {
  location: LocationDraft | null;
  urgency: Urgency | null;
  photo: CompressedPhoto | null;
  comment: string;
}

export const STEPS = [
  { key: "ubicacion", short: "Ubicación", title: "¿Dónde está el bache?" },
  { key: "gravedad", short: "Gravedad", title: "¿Qué tan grave es?" },
  { key: "foto", short: "Foto", title: "Muestra el bache en una foto" },
  { key: "detalles", short: "Detalles", title: "¿Algo más que ayude a encontrarlo?" },
  { key: "revisar", short: "Enviar", title: "Revisa y envía tu reporte" },
] as const;
