import { createBrowserClient } from "@supabase/ssr";

// Client Supabase da usare nei componenti con "use client" (browser).
// Non serve ancora: lo useremo alla Fase 3 per il login con Twitch e il Profilo.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
