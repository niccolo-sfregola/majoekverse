"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Server Action: avvia il login OAuth con Twitch e manda l'utente alla
// pagina di autorizzazione di Twitch.
export async function signInWithTwitch() {
  const supabase = await createClient();

  const h = await headers();
  const origin = h.get("origin") ?? `http://${h.get("host")}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "twitch",
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error || !data.url) {
    redirect("/profilo?errore=login");
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/profilo");
}
