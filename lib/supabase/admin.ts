import { createClient } from "@supabase/supabase-js";

// Client con privilegi service_role: BYPASSA la RLS. Solo lato server, non deve
// mai finire in un componente "use client". Serve per leggere/scrivere la
// tabella twitch_credentials, che non ha policy.
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY mancante");
  }

  // Nuovo formato Supabase: sb_secret_..., va bene così.
  // Formato classico: deve essere un JWT con role "service_role". Se qui c'è la
  // anon key (o un JWT troncato), la RLS/permission blocca tutto in silenzio.
  if (!key.startsWith("sb_secret_")) {
    let role: string | undefined;
    try {
      const payload = key.split(".")[1] ?? "";
      role = JSON.parse(Buffer.from(payload, "base64").toString()).role;
    } catch {
      throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY non è un JWT valido (probabilmente troncata o incollata male)",
      );
    }
    if (role !== "service_role") {
      throw new Error(
        `SUPABASE_SERVICE_ROLE_KEY ha role="${role}", serve la chiave "service_role"`,
      );
    }
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
