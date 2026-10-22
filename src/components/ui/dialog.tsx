"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

/** Modal accesible basado en <dialog> nativo (atrapa el foco y cierra con Esc). */
export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="dialog-title"
      className={cn(
        "m-auto w-[min(100vw_-_1.5rem,44rem)] max-h-[calc(100dvh_-_1.5rem)] overflow-auto rounded-2xl border-2 border-asfalto bg-white p-0 text-asfalto shadow-2xl backdrop:bg-asfalto/70",
        className,
      )}
    >
      {open && (
        <div>
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b-2 border-linea bg-white px-5 py-3">
            <h2 id="dialog-title" className="text-xl font-extrabold">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="flex size-12 items-center justify-center rounded-full hover:bg-banqueta"
              aria-label="Cerrar"
            >
              <X className="size-6" />
            </button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      )}
    </dialog>
  );
}
