"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { STEPS } from "./types";

/**
 * Barra de avance dibujada como un tramo de carretera:
 * la línea central se "pinta" de amarillo conforme avanzas.
 */
export function RoadProgress({
  step,
  maxReached,
  onJump,
}: {
  step: number;
  maxReached: number;
  onJump: (i: number) => void;
}) {
  const total = STEPS.length;
  const pct = (step / (total - 1)) * 100;

  return (
    <nav aria-label="Avance del reporte">
      <div className="relative h-10 overflow-hidden rounded-full asphalt" aria-hidden>
        <div className="absolute inset-x-5 top-1/2 h-[3px] -translate-y-1/2 bg-white/15" />
        <div
          className="lane-dashes absolute left-5 top-1/2 h-1 -translate-y-1/2 transition-[width] duration-500 ease-out"
          style={{ width: `calc((100% - 2.5rem) * ${pct / 100})` }}
        />
        {STEPS.map((_, i) => (
          <span
            key={i}
            className={cn(
              "absolute top-1/2 flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-sm font-extrabold transition-colors",
              i < step && "border-pintura bg-pintura text-asfalto",
              i === step && "border-white bg-white text-asfalto",
              i > step && "border-white/40 bg-asfalto text-white/70",
            )}
            style={{ left: `calc(1.25rem + (100% - 2.5rem) * ${i / (total - 1)})` }}
          >
            {i < step ? <Check className="size-4" strokeWidth={3} /> : i + 1}
          </span>
        ))}
      </div>

      <ol className="mt-2 grid grid-cols-5 text-center text-[0.8rem] font-semibold leading-tight sm:text-sm">
        {STEPS.map((s, i) => {
          const reachable = i <= maxReached && i !== step;
          return (
            <li key={s.key}>
              <button
                type="button"
                disabled={!reachable}
                onClick={() => onJump(i)}
                aria-current={i === step ? "step" : undefined}
                className={cn(
                  "w-full rounded px-0.5 py-1",
                  i === step ? "text-asfalto" : "text-grava",
                  reachable && "underline decoration-2 underline-offset-4 hover:text-asfalto",
                  !reachable && "cursor-default",
                )}
              >
                {s.short}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
