"use client";

import { LoaderCircle, MapPinPlus, Search } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { Report, Urgency } from "@/lib/types";
import { URGENCY, URGENCY_ORDER } from "@/lib/urgency";
import { cn, formatDateShort } from "@/lib/utils";
import { LayerToggle } from "./map/layer-toggle";
import type { BaseLayer } from "./map/layers";
import { StreetViewDialog } from "./street-view-dialog";
import { buttonVariants } from "./ui/button";

const ReportsMap = dynamic(() => import("./map/reports-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-banqueta text-grava">
      <LoaderCircle className="mr-2 size-5 animate-spin" aria-hidden /> Cargando mapa…
    </div>
  ),
});

type Live = "conectando" | "en-vivo" | "cada-30s";

export function CitizenMap({ initialReports, initialFolio }: { initialReports: Report[]; initialFolio?: string }) {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [active, setActive] = useState<Set<Urgency>>(new Set(URGENCY_ORDER));
  const [text, setText] = useState("");
  const [layer, setLayer] = useState<BaseLayer>("calles");
  const [selectedId, setSelectedId] = useState<string | null>(
    () => initialReports.find((r) => r.folio === initialFolio)?.id ?? null,
  );
  const [sv, setSv] = useState<Report | null>(null);
  const [live, setLive] = useState<Live>("conectando");

  const upsert = useCallback((r: Report) => {
    setReports((list) => {
      const i = list.findIndex((x) => x.id === r.id);
      if (i === -1) return [r, ...list];
      const copy = list.slice();
      copy[i] = { ...copy[i], ...r };
      return copy;
    });
  }, []);

  // ── Actualización en tiempo real ──
  useEffect(() => {
    const sb = supabaseBrowser();
    if (sb) {
      const channel = sb
        .channel("reportes-en-vivo")
        .on("postgres_changes", { event: "*", schema: "public", table: "reports" }, (payload) => {
          if (payload.eventType === "DELETE") {
            const id = (payload.old as unknown as { id?: string }).id;
            setReports((list) => list.filter((r) => r.id !== id));
          } else {
            upsert(payload.new as unknown as Report);
          }
        })
        .subscribe((status) => setLive(String(status) === "SUBSCRIBED" ? "en-vivo" : "conectando"));
      return () => {
        void sb.removeChannel(channel);
      };
    }

    // Modo de prueba: consulta periódica.
    setLive("cada-30s");
    const refresh = async () => {
      try {
        const res = await fetch("/api/reports", { cache: "no-store" });
        const data = (await res.json()) as { reports?: Report[] };
        if (data.reports) setReports(data.reports);
      } catch {
        /* se reintenta en la siguiente vuelta */
      }
    };
    const t = setInterval(refresh, 30000);
    return () => clearInterval(t);
  }, [upsert]);

  const counts = useMemo(() => {
    const c: Record<Urgency, number> = { muy_urgente: 0, urgente: 0, no_urgente: 0 };
    for (const r of reports) c[r.urgency]++;
    return c;
  }, [reports]);

  const visible = useMemo(() => {
    const q = text.trim().toLowerCase();
    return reports
      .filter((r) => active.has(r.urgency))
      .filter(
        (r) =>
          !q ||
          r.folio.toLowerCase().includes(q) ||
          (r.address ?? "").toLowerCase().includes(q) ||
          (r.comment ?? "").toLowerCase().includes(q),
      )
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [reports, active, text]);

  const toggle = (u: Urgency) =>
    setActive((s) => {
      const n = new Set(s);
      if (n.has(u)) n.delete(u);
      else n.add(u);
      return n.size === 0 ? new Set(URGENCY_ORDER) : n;
    });

  return (
    <div className="flex flex-col lg:grid lg:h-[calc(100dvh_-_6.75rem)] lg:grid-cols-[400px_1fr]">
      {/* Mapa (arriba en celular, a la derecha en escritorio) */}
      <div className="relative h-[58dvh] min-h-[340px] border-b-2 border-asfalto lg:order-2 lg:h-full lg:border-b-0 lg:border-l-2">
        <ReportsMap
          reports={visible}
          layer={layer}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onStreetView={setSv}
        />
        <LayerToggle value={layer} onChange={setLayer} className="absolute right-3 top-3" />
        <p
          className="pointer-events-none absolute bottom-6 left-3 z-[1000] flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-sm font-bold shadow-md"
          role="status"
        >
          <span
            className={cn(
              "size-2.5 rounded-full",
              live === "en-vivo" ? "animate-pulse bg-letrero" : live === "cada-30s" ? "bg-pintura-oscura" : "bg-grava",
            )}
            aria-hidden
          />
          {live === "en-vivo" ? "En vivo" : live === "cada-30s" ? "Se actualiza cada 30 s" : "Conectando…"}
        </p>
      </div>

      {/* Panel de reportes */}
      <aside className="flex min-h-0 flex-col bg-white lg:order-1">
        <div className="space-y-4 border-b-2 border-linea p-4">
          <div>
            <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-tight">Mapa ciudadano</h1>
            <p className="text-grava">
              {reports.length === 1 ? "1 bache reportado" : `${reports.length} baches reportados`} por vecinos. Toca un pin o
              un reporte para ver su foto.
            </p>
          </div>

          <fieldset>
            <legend className="sr-only">Mostrar por urgencia</legend>
            <div className="flex flex-wrap gap-2">
              {URGENCY_ORDER.map((u) => {
                const info = URGENCY[u];
                const on = active.has(u);
                return (
                  <button
                    key={u}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(u)}
                    className={cn(
                      "flex min-h-11 items-center gap-2 rounded-full border-2 px-3 text-[0.95rem] font-bold",
                      on ? "border-asfalto bg-white" : "border-linea bg-banqueta text-grava line-through",
                    )}
                  >
                    <span
                      className="size-3.5 rounded-full border border-asfalto/40"
                      style={{ background: on ? info.color : "transparent" }}
                      aria-hidden
                    />
                    {info.label}
                    <span className="rounded-full bg-banqueta px-2 text-sm">{counts[u]}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-grava" aria-hidden />
            <label htmlFor="filtro" className="sr-only">
              Buscar por calle, colonia o folio
            </label>
            <input
              id="filtro"
              type="search"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Buscar por calle, colonia o folio"
              className="min-h-12 w-full rounded-[var(--radius-control)] border-2 border-asfalto bg-white pl-11 pr-3 text-base placeholder:text-grava"
            />
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="text-lg font-bold">
              {reports.length === 0 ? "Todavía no hay baches reportados." : "Ningún reporte coincide con tu búsqueda."}
            </p>
            {reports.length === 0 && (
              <Link href="/" className={buttonVariants({ variant: "paint", size: "lg" })}>
                <MapPinPlus aria-hidden /> Reportar el primero
              </Link>
            )}
          </div>
        ) : (
          <ul className="flex-1 divide-y-2 divide-linea overflow-y-auto" aria-label="Reportes">
            {visible.map((r) => {
              const u = URGENCY[r.urgency];
              const sel = r.id === selectedId;
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(r.id);
                      if (window.matchMedia("(max-width: 1023px)").matches) {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    aria-current={sel ? "true" : undefined}
                    className={cn(
                      "flex w-full gap-3 p-4 text-left transition-colors",
                      sel ? "bg-pintura/25" : "hover:bg-banqueta",
                    )}
                  >
                    <span className="w-1.5 shrink-0 self-stretch rounded-full" style={{ background: u.color }} aria-hidden />
                    {r.photo_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.photo_url}
                        alt=""
                        loading="lazy"
                        className="size-20 shrink-0 rounded-lg border border-linea bg-banqueta object-cover"
                      />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-bold" style={{ color: u.value === "no_urgente" ? "#7a5c00" : u.color }}>
                          {u.label}
                        </span>
                        <span className="shrink-0 text-sm text-grava">{formatDateShort(r.created_at)}</span>
                      </span>
                      <span className="mt-0.5 block font-bold leading-snug">{r.address || "Ubicación marcada en el mapa"}</span>
                      {r.comment && <span className="mt-0.5 line-clamp-2 block text-[0.95rem] text-grava">{r.comment}</span>}
                      <span className="mt-1 block font-mono text-xs text-grava">#{r.folio}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      {sv && (
        <StreetViewDialog open onClose={() => setSv(null)} lat={sv.lat} lng={sv.lng} address={sv.address} />
      )}
    </div>
  );
}
