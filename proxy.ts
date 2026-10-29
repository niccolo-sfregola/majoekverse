import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// In Next.js 16 il "middleware" si chiama proxy. Gira prima di ogni richiesta.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Gira su tutte le pagine tranne file statici e immagini. Esclusi anche
  // /api/live (il blocco live lo chiama ogni minuto e non usa il login), il
  // service worker e il manifest.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/live|sw.js|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
