// Proxy hacia OpenStreetMap Nominatim (gratuito, sin API key).
// Política de uso: máx. 1 solicitud por segundo e identificación con User-Agent.
//   GET /api/geocode?q=texto          → búsqueda de direcciones en el municipio
//   GET /api/geocode?lat=..&lng=..    → dirección aproximada de un punto

import { NextResponse } from "next/server";
import { CITY, SITE_URL } from "@/lib/config";
import type { GeocodeResult } from "@/lib/types";

export const runtime = "nodejs";

const BASE = "https://nominatim.openstreetmap.org";
const HEADERS = {
  "User-Agent": `ReportaBacheObregon/1.0 (${process.env.NOMINATIM_CONTACT_EMAIL || SITE_URL})`,
  "Accept-Language": "es-MX,es",
};

interface NominatimItem {
  lat: string;
  lon: string;
  display_name: string;
  address?: Record<string, string>;
}

function shortAddress(item: NominatimItem): { label: string; detail: string } {
  const a = item.address ?? {};
  const street = a.road || a.pedestrian || a.residential || a.footway || a.path;
  const number = a.house_number;
  const colonia = a.neighbourhood || a.suburb || a.quarter || a.city_district;
  const city = a.city || a.town || a.village || a.municipality;

  const first = street ? `${street}${number ? ` ${number}` : ""}` : item.display_name.split(",")[0];
  const label = [first, colonia ? `Col. ${colonia}` : null].filter(Boolean).join(", ");
  const detail = [city, a.postcode ? `C.P. ${a.postcode}` : null].filter(Boolean).join(", ");
  return { label, detail };
}

async function nominatim(path: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: HEADERS,
    next: { revalidate: 60 * 60 * 24 },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  return res.json();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  try {
    if (q) {
      if (q.length < 3) return NextResponse.json({ results: [] });
      const d = 0.35; // ~35 km alrededor del centro
      const viewbox = [CITY.center.lng - d, CITY.center.lat + d, CITY.center.lng + d, CITY.center.lat - d].join(",");
      const params = new URLSearchParams({
        q: q.slice(0, 200),
        format: "jsonv2",
        addressdetails: "1",
        limit: "6",
        countrycodes: "mx",
        viewbox,
        bounded: "1",
      });
      const items = (await nominatim(`/search?${params}`)) as NominatimItem[];
      const results: GeocodeResult[] = items.map((it) => ({
        lat: Number(it.lat),
        lng: Number(it.lon),
        ...shortAddress(it),
      }));
      return NextResponse.json({ results });
    }

    if (Number.isFinite(lat) && Number.isFinite(lng) && searchParams.has("lat")) {
      const params = new URLSearchParams({
        lat: lat.toFixed(6),
        lon: lng.toFixed(6),
        format: "jsonv2",
        addressdetails: "1",
        zoom: "18",
      });
      const item = (await nominatim(`/reverse?${params}`)) as NominatimItem & { error?: string };
      if (item.error || !item.lat) return NextResponse.json({ result: null });
      const result: GeocodeResult = { lat, lng, ...shortAddress(item) };
      return NextResponse.json({ result });
    }

    return NextResponse.json({ error: "Escribe una dirección o indica lat y lng." }, { status: 400 });
  } catch (err) {
    console.error("[geocode]", err);
    return NextResponse.json(
      { error: "El servicio de direcciones no respondió. Puedes marcar el punto directamente en el mapa." },
      { status: 502 },
    );
  }
}
