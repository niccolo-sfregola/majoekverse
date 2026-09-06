import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { saveJoeToken } from "@/lib/twitch-user";
import { getSiteUrl } from "@/lib/site-url";

// Ritorno dell'OAuth avviato da connectTwitchChannel(): scambia il code per la
// sessione e salva il provider_token di Twitch (con gli scope da broadcaster).
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");
  const siteUrl = await getSiteUrl();

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session?.provider_token && (await isAdmin())) {
      await saveJoeToken({
        userId: data.session.user.id,
        accessToken: data.session.provider_token,
        refreshToken: data.session.provider_refresh_token ?? null,
      });
    }
  }

  return NextResponse.redirect(`${siteUrl}/profilo`);
}
