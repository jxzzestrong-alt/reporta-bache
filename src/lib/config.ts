// Configuración pública (disponible en navegador y servidor).
// Las variables NEXT_PUBLIC_* se incrustan al compilar.

function num(value: string | undefined, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && value !== undefined && value !== "" ? n : fallback;
}

export const CITY = {
  name: process.env.NEXT_PUBLIC_CITY_NAME || "Ciudad Obregón, Sonora",
  shortName: "Ciudad Obregón",
  center: {
    lat: num(process.env.NEXT_PUBLIC_MAP_CENTER_LAT, 27.4833),
    lng: num(process.env.NEXT_PUBLIC_MAP_CENTER_LNG, -109.9333),
  },
  zoom: num(process.env.NEXT_PUBLIC_MAP_ZOOM, 13),
  /** Radio máximo (km) desde el centro para aceptar reportes */
  maxDistanceKm: num(process.env.NEXT_PUBLIC_REPORT_MAX_DISTANCE_KM, 40),
  timeZone: "America/Hermosillo",
};

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export const SUPABASE_PUBLIC = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  // Acepta el nombre clásico (anon) o el nuevo (publishable) que usa la integración de Vercel.
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
};

export const COMMENT_MAX = 500;
