"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isJoe } from "@/lib/auth";
import { JOE_CHANNEL_SCOPES, USER_CHANNEL_SCOPES } from "@/lib/twitch-user";
import { getSiteUrl } from "@/lib/site-url";

// Server Action: avvia il login OAuth con Twitch e manda l'utente alla
// pagina di autorizzazione di Twitch.
export async function signInWithTwitch() {
  const supabase = await createClient();

  const siteUrl = await getSiteUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "twitch",
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
      scopes: USER_CHANNEL_SCOPES,
    },
  });

  if (error || !data.url) {
    redirect("/profilo?errore=login");
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // Alla home: cambio di rotta vero → parte la transizione d'ingresso.
  redirect("/");
}

// Ri-autenticazione di Joe con gli scope extra per leggere follower e abbonati.
// Solo il broadcaster. Il token che ne esce viene salvato in /auth/twitch-connect.
export async function connectTwitchChannel() {
  if (!(await isJoe())) redirect("/profilo");

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "twitch",
    options: {
      redirectTo: `${siteUrl}/auth/twitch-connect`,
      scopes: JOE_CHANNEL_SCOPES,
    },
  });

  if (error || !data.url) {
    redirect("/profilo?errore=twitch");
  }

  redirect(data.url);
}
