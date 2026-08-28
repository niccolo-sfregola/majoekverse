import { NextResponse } from "next/server";
import { getStreamStatus } from "@/lib/twitch";

// Endpoint che la Home interroga ogni minuto per aggiornare lo stato "live"
// senza ricaricare la pagina.
export async function GET() {
  const status = await getStreamStatus();
  return NextResponse.json(status);
}
