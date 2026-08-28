import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Dopo il login su Twitch, Supabase rimanda qui con un ?code=...
// Lo scambiamo per una sessione (salvata nei cookie) e torniamo al Profilo.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/profilo`);
    }
  }

  return NextResponse.redirect(`${origin}/profilo?errore=login`);
}
