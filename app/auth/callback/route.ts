import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";

// Dopo il login su Twitch, Supabase rimanda qui con un ?code=...
// Lo scambiamo per una sessione (salvata nei cookie) e torniamo al Profilo.
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");
  const siteUrl = await getSiteUrl();

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${siteUrl}/profilo`);
    }
  }

  return NextResponse.redirect(`${siteUrl}/profilo?errore=login`);
}
