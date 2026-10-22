// Solo para el modo de prueba (sin Supabase): sirve las fotos guardadas en .data/uploads.
import { promises as fs } from "node:fs";
import path from "node:path";
import { isDemoMode, UPLOAD_DIR } from "@/lib/store";

export const runtime = "nodejs";

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

export async function GET(_req: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;
  const match = /^[a-f0-9-]{36}\.(jpg|png|webp)$/.exec(file);
  if (!isDemoMode() || !match) return new Response("No encontrado", { status: 404 });

  try {
    const data = await fs.readFile(path.join(UPLOAD_DIR, file));
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": TYPES[match[1]], "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("No encontrado", { status: 404 });
  }
}
