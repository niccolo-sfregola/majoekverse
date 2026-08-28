import { createClient } from "@/lib/supabase/server";

// Vero se l'utente loggato è nella tabella admins (controllo fatto dal
// database tramite la funzione is_admin()). Da usare SEMPRE lato server.
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase.rpc("is_admin");
  return !error && data === true;
}
