import { createClient } from "@supabase/supabase-js";

// Client con privilegi service_role: BYPASSA la RLS. Solo lato server, non deve
// mai finire in un componente "use client". Serve per leggere/scrivere la
// tabella twitch_credentials, che non ha policy.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
