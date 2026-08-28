import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Client Supabase da usare nei Server Component, nelle pagine e nelle
// Server Action. Legge/scrive i cookie della richiesta: per ora serve solo
// per le letture pubbliche, ma è la stessa base che useremo per il login (Fase 3).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Chiamato da un Server Component: si può ignorare se il refresh
            // della sessione è gestito altrove (lo vedremo alla Fase 3).
          }
        },
      },
    },
  );
}
