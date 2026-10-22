"use client";

import { Plus } from "lucide-react";
import { COMMENT_MAX } from "@/lib/config";

const QUICK = [
  "Carril derecho",
  "Carril izquierdo",
  "En el crucero",
  "Frente a una escuela",
  "Se llena de agua",
  "Ya ha dañado autos",
];

export function StepDetails({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const add = (text: string) => {
    const base = value.trim();
    const next = base ? `${base.replace(/[.,;]$/, "")}, ${text.toLowerCase()}` : text;
    onChange(next.slice(0, COMMENT_MAX));
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="comentario" className="mb-2 block text-lg font-bold">
          Referencias o comentarios <span className="font-normal text-grava">(opcional)</span>
        </label>
        <textarea
          id="comentario"
          value={value}
          maxLength={COMMENT_MAX}
          rows={5}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ej. Frente a la escuela primaria, carril derecho. Tiene como 30 cm de hondo."
          className="w-full rounded-[var(--radius-control)] border-2 border-asfalto bg-white px-4 py-3 text-lg leading-relaxed placeholder:text-grava"
          aria-describedby="comentario-ayuda"
        />
        <p id="comentario-ayuda" className="mt-1 text-right text-sm text-grava">
          {value.length} de {COMMENT_MAX} caracteres
        </p>
      </div>

      <div>
        <p className="mb-2 font-bold">Agregar con un toque</p>
        <div className="flex flex-wrap gap-2">
          {QUICK.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => add(q)}
              className="flex min-h-11 items-center gap-1.5 rounded-full border-2 border-asfalto bg-white px-4 text-[0.95rem] font-semibold hover:bg-pintura"
            >
              <Plus className="size-4" aria-hidden /> {q}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[0.95rem] text-grava">
        Tu comentario aparecerá en el mapa ciudadano. No escribas nombres, teléfonos ni placas.
      </p>
    </div>
  );
}
