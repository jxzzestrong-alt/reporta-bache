"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLIC } from "./config";

let client: SupabaseClient | null = null;

/** Cliente público (solo lectura gracias a RLS). Devuelve null en modo de prueba. */
export function supabaseBrowser() {
  if (!SUPABASE_PUBLIC.url || !SUPABASE_PUBLIC.anonKey) return null;
  if (!client) {
    client = createClient(SUPABASE_PUBLIC.url, SUPABASE_PUBLIC.anonKey, {
      auth: { persistSession: false },
    });
  }
  return client;
}
