import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { saveViewerToken } from "@/lib/twitch-user";
import { getSiteUrl } from "@/lib/site-url";

// Dopo il login su Twitch, Supabase rimanda qui con un ?code=...
// Lo scambiamo per una sessione (salvata nei cookie), salviamo il token Twitch
// dell'utente (serve per "segui da" / "abbonato") e torniamo al Profilo.
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");
  const siteUrl = await getSiteUrl();

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (data.session?.provider_token) {
        try {
          await saveViewerToken({
            userId: data.session.user.id,
            accessToken: data.session.provider_token,
            refreshToken: data.session.provider_refresh_token ?? null,
          });
        } catch (e) {
          // Se lo Storage del token fallisce, il login riesce comunque.
          console.error("[auth/callback] salvataggio token fallito:", e);
        }
      }
      return NextResponse.redirect(`${siteUrl}/profilo`);
    }
  }

  return NextResponse.redirect(`${siteUrl}/profilo?errore=login`);
}
