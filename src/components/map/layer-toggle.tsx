"use client";

import { Map as MapIcon, Satellite } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BaseLayer } from "./layers";

/** Interruptor Mapa / Satélite que flota sobre el mapa. */
export function LayerToggle({
  value,
  onChange,
  className,
}: {
  value: BaseLayer;
  onChange: (v: BaseLayer) => void;
  className?: string;
}) {
  const options = [
    { v: "calles" as const, label: "Mapa", icon: MapIcon },
    { v: "satelite" as const, label: "Satélite", icon: Satellite },
  ];
  return (
    <div
      role="radiogroup"
      aria-label="Tipo de mapa"
      className={cn(
        "z-[1000] inline-flex overflow-hidden rounded-[var(--radius-control)] border-2 border-asfalto bg-white shadow-md",
        className,
      )}
    >
      {options.map(({ v, label, icon: Icon }) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={cn(
            "flex min-h-11 items-center gap-1.5 px-3 text-[0.95rem] font-bold",
            value === v ? "bg-asfalto text-white" : "bg-white text-asfalto hover:bg-banqueta",
          )}
        >
          <Icon className="size-4" aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}
