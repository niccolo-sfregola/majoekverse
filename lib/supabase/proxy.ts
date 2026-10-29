import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Rinfresca la sessione Supabase a ogni richiesta: legge i cookie in arrivo,
// e se il token va rigenerato riscrive i cookie sulla risposta. Senza questo
// passaggio il login "scadrebbe" e l'utente verrebbe sloggato a caso.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Questa chiamata è ciò che fa il refresh. Non togliere.
  // getClaims e non getUser: controlla il token qui sul server, senza
  // chiedere ogni volta a Supabase (getUser è una chiamata di rete in più
  // prima di OGNI pagina). Se il token sta per scadere, lo rinnova lo stesso.
  await supabase.auth.getClaims();

  return response;
}
