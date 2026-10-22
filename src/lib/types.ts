export type Urgency = "muy_urgente" | "urgente" | "no_urgente";

export type ReportStatus = "recibido" | "en_proceso" | "reparado";

export type EmailStatus =
  | "pendiente"
  | "enviado"
  | "error"
  | "desactivado"
  | "sin_configurar";

export interface Report {
  id: string;
  folio: string;
  created_at: string;
  lat: number;
  lng: number;
  address: string | null;
  urgency: Urgency;
  comment: string | null;
  photo_url: string | null;
  status: ReportStatus;
  email_status: EmailStatus;
}

export const PUBLIC_REPORT_COLUMNS =
  "id, folio, created_at, lat, lng, address, urgency, comment, photo_url, status, email_status";

export interface GeocodeResult {
  lat: number;
  lng: number;
  label: string;
  detail: string;
}
