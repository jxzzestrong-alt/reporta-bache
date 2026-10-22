"use client";

import { Camera, ImagePlus, LoaderCircle, RefreshCw, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { compressImage, type CompressedPhoto } from "@/lib/image";
import { cn, formatBytes } from "@/lib/utils";
import { Button } from "../ui/button";

export function StepPhoto({
  value,
  onChange,
  onProcessing,
}: {
  value: CompressedPhoto | null;
  onChange: (p: CompressedPhoto | null) => void;
  onProcessing: (busy: boolean) => void;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setBusy(true);
    onProcessing(true);
    try {
      const photo = await compressImage(file);
      if (value) URL.revokeObjectURL(value.previewUrl);
      onChange(photo);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
      onProcessing(false);
    }
  };

  const inputs = (
    <>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </>
  );

  if (value && !busy) {
    return (
      <div className="space-y-4">
        {inputs}
        <figure className="overflow-hidden rounded-xl border-2 border-asfalto bg-asfalto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value.previewUrl} alt="Vista previa de la foto del bache" className="max-h-[420px] w-full object-contain" />
          <figcaption className="bg-white px-4 py-2 text-sm text-grava">
            Foto lista · optimizada de {formatBytes(value.originalSize)} a {formatBytes(value.size)} para que se envíe rápido
          </figcaption>
        </figure>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button variant="outline" size="lg" onClick={() => cameraRef.current?.click()}>
            <RefreshCw aria-hidden /> Tomar otra foto
          </Button>
          <Button variant="outline" size="lg" onClick={() => galleryRef.current?.click()}>
            <ImagePlus aria-hidden /> Elegir otra de la galería
          </Button>
        </div>
        {error && (
          <p role="alert" className="text-alerta">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {inputs}
      <Button variant="paint" size="xl" className="w-full" onClick={() => cameraRef.current?.click()} disabled={busy}>
        <Camera aria-hidden /> Tomar foto
      </Button>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
          dragging ? "border-asfalto bg-pintura/25" : "border-grava bg-white",
        )}
      >
        {busy ? (
          <>
            <LoaderCircle className="size-10 animate-spin text-grava" aria-hidden />
            <p className="text-lg font-bold" role="status">
              Preparando la foto…
            </p>
          </>
        ) : (
          <>
            <Upload className="size-10 text-grava" aria-hidden />
            <p className="text-lg font-bold">
              <span className="hidden sm:inline">Arrastra la foto aquí o </span>
              <span className="sm:hidden">¿Ya tienes la foto? </span>
            </p>
            <Button variant="outline" size="lg" onClick={() => galleryRef.current?.click()}>
              <ImagePlus aria-hidden /> Elegir de la galería
            </Button>
          </>
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-lg border-2 border-alerta/40 bg-[#FDE8EA] p-3">
          {error}
        </p>
      )}

      <p className="text-[0.95rem] text-grava">
        Consejo: toma la foto de modo que se vea el bache completo y algo de la calle alrededor. Pon atención al tráfico.
      </p>
    </div>
  );
}
