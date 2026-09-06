import { createClient } from "@supabase/supabase-js";

// Client con privilegi service_role: BYPASSA la RLS. Solo lato server, non deve
// mai finire in un componente "use client". Serve per leggere/scrivere la
// tabella twitch_credentials, che non ha policy.
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY mancante");
  }
  // Difesa: se per errore qui c'è la anon key, la RLS bloccherebbe tutto in
  // silenzio. La service_role key ha "role":"service_role" nel payload JWT.
  try {
    const payload = JSON.parse(
      Buffer.from(key.split(".")[1] ?? "", "base64").toString(),
    );
    if (payload.role && payload.role !== "service_role") {
      throw new Error(
        `SUPABASE_SERVICE_ROLE_KEY ha role="${payload.role}", serve "service_role"`,
      );
    }
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("SUPABASE_SERVICE_ROLE_KEY"))
      throw e;
    // Nuovo formato sb_secret_... (non è un JWT): lo lasciamo passare.
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
