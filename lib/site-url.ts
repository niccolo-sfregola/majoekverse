import { headers } from "next/headers";

// Indirizzo base del sito: https://majoekverse.vercel.app in produzione,
// http://localhost:3000 in locale.
//
// Serve per costruire l'URL di ritorno del login. Dietro il proxy di Vercel
// non ci si può fidare di `request.url` (a volte è http://), quindi:
//   1. se c'è la env NEXT_PUBLIC_SITE_URL, si usa quella;
//   2. altrimenti si ricostruisce dagli header x-forwarded-*.
export async function getSiteUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");

  return `${proto}://${host}`;
}
