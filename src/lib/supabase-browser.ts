"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface PublicSupabaseConfig {
  url: string;
  key: string;
}

let client: SupabaseClient | null = null;

/** Cliente público (solo lectura gracias a RLS). Devuelve null en modo de prueba. */
export function supabaseBrowser(config: PublicSupabaseConfig | null) {
  if (!config?.url || !config.key) return null;
  if (!client) {
    client = createClient(config.url, config.key, { auth: { persistSession: false } });
  }
  return client;
}
