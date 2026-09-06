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

// Login Twitch del canale (Joe / broadcaster).
export const JOE_TWITCH_LOGIN = "majoekoto";

// Vero se l'utente loggato È Joe (in base allo username Twitch). Serve per il
// collegamento del canale, che solo il broadcaster può fare — non è una cosa
// da "admin" ma da proprietario del canale.
export async function isJoe(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const login = (
    user?.user_metadata?.preferred_username ??
    user?.user_metadata?.nickname ??
    ""
  ).toLowerCase();
  return login === JOE_TWITCH_LOGIN;
}
