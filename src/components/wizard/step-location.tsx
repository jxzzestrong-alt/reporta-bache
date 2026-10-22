"use client";

import { Footprints, Hand, LoaderCircle, LocateFixed, MapPin, Search, TriangleAlert } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { CITY } from "@/lib/config";
import type { GeocodeResult } from "@/lib/types";
import { distanceKm, formatCoords } from "@/lib/utils";
import { LayerToggle } from "../map/layer-toggle";
import type { BaseLayer } from "../map/layers";
import { StreetViewDialog } from "../street-view-dialog";
import { Button } from "../ui/button";
import type { LocationDraft } from "./types";

const LocationPicker = dynamic(() => import("../map/location-picker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-banqueta text-grava">
      <LoaderCircle className="mr-2 size-5 animate-spin" aria-hidden /> Cargando mapa…
    </div>
  ),
});

export function isOutsideCity(loc: { lat: number; lng: number }) {
  return distanceKm(CITY.center, loc) > CITY.maxDistanceKm;
}

type SearchState =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "done"; results: GeocodeResult[] }
  | { state: "error"; message: string };

export function StepLocation({
  value,
  onChange,
}: {
  value: LocationDraft | null;
  onChange: (loc: LocationDraft) => void;
}) {
  const [layer, setLayer] = useState<BaseLayer>("calles");
  const [flyKey, setFlyKey] = useState(0);
  const [gps, setGps] = useState<{ loading: boolean; error: string | null }>({ loading: false, error: null });
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<SearchState>({ state: "idle" });
  const [geoError, setGeoError] = useState(false);
  const [svOpen, setSvOpen] = useState(false);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // ── Dirección aproximada (geocodificación inversa) ──
  const needsAddress = value !== null && value.address === null;
  useEffect(() => {
    if (!value || value.address !== null) return;
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setGeoError(false);
      try {
        const res = await fetch(`/api/geocode?lat=${value.lat}&lng=${value.lng}`, { signal: ctrl.signal });
        const data = (await res.json()) as { result?: GeocodeResult | null };
        onChangeRef.current({
          ...value,
          address: data.result?.label ?? "",
          addressDetail: data.result?.detail ?? null,
        });
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setGeoError(true);
        onChangeRef.current({ ...value, address: "", addressDetail: null });
      }
    }, 600);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.lat, value?.lng, needsAddress]);

  // ── GPS ──
  const locateMe = () => {
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setGps({ loading: false, error: "La ubicación automática solo funciona en una conexión segura (https). Busca la dirección o toca el mapa." });
      return;
    }
    if (!("geolocation" in navigator)) {
      setGps({ loading: false, error: "Tu navegador no permite obtener la ubicación. Busca la dirección o toca el mapa." });
      return;
    }
    setGps({ loading: true, error: null });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ loading: false, error: null });
        onChange({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: null,
          addressDetail: null,
          source: "gps",
          accuracy: Math.round(pos.coords.accuracy),
        });
        setFlyKey((k) => k + 1);
      },
      (err) => {
        const message =
          err.code === err.PERMISSION_DENIED
            ? "No se dio permiso para usar tu ubicación. Actívalo en los ajustes del navegador o busca la dirección abajo."
            : err.code === err.TIMEOUT
              ? "Tardó demasiado en encontrar tu ubicación. Intenta de nuevo al aire libre o busca la dirección."
              : "No pudimos obtener tu ubicación. Busca la dirección o toca el mapa.";
        setGps({ loading: false, error: message });
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
    );
  };

  // ── Búsqueda ──
  const runSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 3) {
      setSearch({ state: "error", message: "Escribe al menos el nombre de la calle." });
      return;
    }
    setSearch({ state: "loading" });
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as { results?: GeocodeResult[]; error?: string };
      if (!res.ok) throw new Error(data.error);
      setSearch({ state: "done", results: data.results ?? [] });
    } catch (err) {
      setSearch({
        state: "error",
        message: (err as Error).message || "La búsqueda no respondió. Toca el mapa para marcar el punto.",
      });
    }
  };

  const pickResult = (r: GeocodeResult) => {
    onChange({ lat: r.lat, lng: r.lng, address: r.label, addressDetail: r.detail, source: "search", accuracy: null });
    setFlyKey((k) => k + 1);
    setSearch({ state: "idle" });
  };

  const onPick = useCallback(
    (p: { lat: number; lng: number }) =>
      onChangeRef.current({ ...p, address: null, addressDetail: null, source: "map", accuracy: null }),
    [],
  );

  const outside = value ? isOutsideCity(value) : false;

  return (
    <div className="space-y-5">
      {/* GPS */}
      <div>
        <Button variant="paint" size="xl" className="w-full" onClick={locateMe} disabled={gps.loading}>
          {gps.loading ? <LoaderCircle className="animate-spin" aria-hidden /> : <LocateFixed aria-hidden />}
          {gps.loading ? "Buscando tu ubicación…" : "Usar mi ubicación actual"}
        </Button>
        <p className="mt-2 text-center text-[0.95rem] text-grava">Párate junto al bache y tócalo. Tu celular te pedirá permiso.</p>
        {gps.error && (
          <p role="alert" className="mt-3 flex gap-2 rounded-lg border-2 border-alerta/40 bg-[#FDE8EA] p-3 text-[0.95rem]">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-alerta" aria-hidden />
            {gps.error}
          </p>
        )}
      </div>

      {/* Búsqueda */}
      <div>
        <form onSubmit={runSearch} role="search" className="flex gap-2">
          <label htmlFor="buscar-direccion" className="sr-only">
            Buscar dirección
          </label>
          <input
            id="buscar-direccion"
            type="search"
            enterKeyHint="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="O escribe la calle y colonia"
            className="min-h-14 w-full min-w-0 rounded-[var(--radius-control)] border-2 border-asfalto bg-white px-4 text-lg placeholder:text-grava"
          />
          <Button type="submit" variant="primary" size="lg" className="shrink-0" aria-label="Buscar">
            {search.state === "loading" ? <LoaderCircle className="animate-spin" aria-hidden /> : <Search aria-hidden />}
            <span className="hidden sm:inline">Buscar</span>
          </Button>
        </form>

        <div aria-live="polite">
          {search.state === "error" && <p className="mt-2 text-[0.95rem] text-alerta">{search.message}</p>}
          {search.state === "done" && search.results.length === 0 && (
            <p className="mt-2 text-[0.95rem] text-grava">
              No encontramos esa dirección en {CITY.shortName}. Prueba con el nombre de la calle y la colonia, o toca el mapa.
            </p>
          )}
          {search.state === "done" && search.results.length > 0 && (
            <ul className="mt-2 divide-y-2 divide-linea overflow-hidden rounded-[var(--radius-control)] border-2 border-asfalto bg-white">
              {search.results.map((r, i) => (
                <li key={`${r.lat}-${r.lng}-${i}`}>
                  <button
                    type="button"
                    onClick={() => pickResult(r)}
                    className="flex min-h-14 w-full items-start gap-3 px-4 py-3 text-left hover:bg-banqueta"
                  >
                    <MapPin className="mt-0.5 size-5 shrink-0" aria-hidden />
                    <span>
                      <span className="block font-bold">{r.label}</span>
                      {r.detail && <span className="block text-sm text-grava">{r.detail}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Mapa */}
      <div className="relative h-[340px] overflow-hidden rounded-xl border-2 border-asfalto sm:h-[420px]">
        <LocationPicker value={value} flyKey={flyKey} accuracy={value?.accuracy} layer={layer} onPick={onPick} />
        <LayerToggle value={layer} onChange={setLayer} className="absolute right-3 top-3" />
        {!value && (
          <p className="pointer-events-none absolute inset-x-3 bottom-3 z-[1000] mx-auto flex w-fit items-center gap-2 rounded-full bg-asfalto px-4 py-2 text-[0.95rem] font-semibold text-white shadow-lg">
            <Hand className="size-5 text-pintura" aria-hidden /> Toca el mapa donde está el bache
          </p>
        )}
      </div>

      {/* Punto elegido */}
      {value && (
        <div
          className={`rounded-xl border-2 p-4 ${outside ? "border-alerta bg-[#FDE8EA]" : "border-letrero bg-letrero-suave"}`}
          aria-live="polite"
        >
          <div className="flex gap-3">
            <MapPin className={`mt-1 size-6 shrink-0 ${outside ? "text-alerta" : "text-letrero"}`} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold leading-snug">
                {value.address === null
                  ? "Buscando la dirección…"
                  : value.address || "Punto marcado (sin dirección exacta)"}
              </p>
              {value.addressDetail && <p className="text-grava">{value.addressDetail}</p>}
              <p className="mt-1 text-sm text-grava">
                Coordenadas {formatCoords(value.lat, value.lng)}
                {value.accuracy ? ` · precisión de ±${value.accuracy} m` : ""}
              </p>
              {geoError && (
                <p className="mt-1 text-sm text-grava">No se pudo obtener la dirección; se enviarán las coordenadas exactas.</p>
              )}
              {outside ? (
                <p className="mt-2 font-semibold text-alerta">
                  Este punto queda fuera de {CITY.shortName}. Mueve el pin a una calle del municipio.
                </p>
              ) : (
                <p className="mt-2 text-[0.95rem]">¿No es exacto? Arrastra el pin o toca el lugar correcto en el mapa.</p>
              )}
            </div>
          </div>
          <Button variant="outline" size="lg" className="mt-4 w-full" onClick={() => setSvOpen(true)}>
            <Footprints aria-hidden /> Ver a nivel de calle
          </Button>
          <StreetViewDialog
            open={svOpen}
            onClose={() => setSvOpen(false)}
            lat={value.lat}
            lng={value.lng}
            address={value.address}
          />
        </div>
      )}
    </div>
  );
}
