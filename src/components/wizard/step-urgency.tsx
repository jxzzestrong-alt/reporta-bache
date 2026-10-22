"use client";

import { Check, Info, OctagonAlert, TriangleAlert } from "lucide-react";
import type { Urgency } from "@/lib/types";
import { URGENCY, URGENCY_ORDER } from "@/lib/urgency";
import { cn } from "@/lib/utils";

const ICONS = { muy_urgente: OctagonAlert, urgente: TriangleAlert, no_urgente: Info };

export function StepUrgency({ value, onChange }: { value: Urgency | null; onChange: (u: Urgency) => void }) {
  return (
    <fieldset>
      <legend className="sr-only">Nivel de urgencia</legend>
      <div className="grid gap-3">
        {URGENCY_ORDER.map((key) => {
          const u = URGENCY[key];
          const Icon = ICONS[key];
          const selected = value === key;
          return (
            <label
              key={key}
              className={cn(
                "group relative flex min-h-24 cursor-pointer overflow-hidden rounded-xl border-2 bg-white transition-shadow has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-asfalto",
                selected ? "border-asfalto shadow-[0_0_0_3px_var(--color-asfalto)]" : "border-linea hover:border-grava",
              )}
            >
              <input
                type="radio"
                name="urgency"
                value={key}
                checked={selected}
                onChange={() => onChange(key)}
                className="sr-only"
              />
              <span
                className="flex w-20 shrink-0 items-center justify-center sm:w-24"
                style={{ background: u.color, color: u.onColor }}
                aria-hidden
              >
                <Icon className="size-9" strokeWidth={2.25} />
              </span>
              <span className="flex flex-1 flex-col justify-center px-4 py-3" style={{ background: selected ? u.soft : undefined }}>
                <span className="text-xl font-extrabold">{u.label}</span>
                <span className="text-[0.95rem] leading-snug text-grava">{u.description}</span>
              </span>
              <span
                className={cn(
                  "mr-4 flex size-8 shrink-0 items-center justify-center self-center rounded-full border-2",
                  selected ? "border-asfalto bg-asfalto text-white" : "border-linea bg-white",
                )}
                aria-hidden
              >
                {selected && <Check className="size-5" strokeWidth={3} />}
              </span>
            </label>
          );
        })}
      </div>
      <p className="mt-4 text-[0.95rem] text-grava">
        Si el bache ya causó un accidente o hay alguien herido, llama primero al 911.
      </p>
    </fieldset>
  );
}
