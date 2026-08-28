import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// In Next.js 16 il "middleware" si chiama proxy. Gira prima di ogni richiesta.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Gira su tutte le pagine tranne file statici e immagini.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
