// Compresión de fotos en el navegador antes de subirlas.
// Reduce a máx. 1600 px por lado y JPEG calidad 0.8 (≈ 200–600 KB).

export interface CompressedPhoto {
  blob: Blob;
  previewUrl: string;
  originalSize: number;
  size: number;
  width: number;
  height: number;
}

function loadWithImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("decode"));
    };
    img.src = url;
  });
}

export async function compressImage(file: File, maxDim = 1600, quality = 0.8): Promise<CompressedPhoto> {
  if (!file.type.startsWith("image/") && !/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)) {
    throw new Error("Ese archivo no es una foto. Elige una imagen JPG o PNG.");
  }

  let source: CanvasImageSource;
  let w: number;
  let h: number;
  try {
    // createImageBitmap respeta la orientación EXIF de las fotos del celular.
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    source = bmp;
    w = bmp.width;
    h = bmp.height;
  } catch {
    try {
      const img = await loadWithImageElement(file);
      source = img;
      w = img.naturalWidth;
      h = img.naturalHeight;
    } catch {
      throw new Error(
        "No pudimos abrir esa foto. Tómala con el botón «Tomar foto» o elige una imagen JPG o PNG.",
      );
    }
  }

  const scale = Math.min(1, maxDim / Math.max(w, h));
  const width = Math.round(w * scale);
  const height = Math.round(h * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Tu navegador no pudo procesar la foto.");
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0, width, height);
  if ("close" in source && typeof source.close === "function") source.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) throw new Error("Tu navegador no pudo procesar la foto.");

  return {
    blob,
    previewUrl: URL.createObjectURL(blob),
    originalSize: file.size,
    size: blob.size,
    width,
    height,
  };
}
