import { createHmac } from "node:crypto";
import type { User } from "@supabase/supabase-js";
import { createClient } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";
import { generateZip, seededRandom, type ZipPuzzle } from "./zip";
import { SOLUZIONI } from "./wordle-words";
import { JOE_TWITCH_LOGIN } from "./auth";
import { getChannelInfo } from "./twitch";
import { getUserChannelRelation } from "./twitch-user";

// Roba comune ai giochi, SOLO lato server (usa il segreto e node:crypto).

// "Oggi" in Italia, come "2026-10-01". Il giorno dei giochi cambia a
// mezzanotte italiana, non a quella del server (Vercel gira in UTC).
export function romeToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
  }).format(now);
}

// Seme numerico da un'etichetta ("zip:2026-10-01"). Mescoliamo un segreto
// che sta solo nelle variabili d'ambiente: senza, chiunque legga il codice
// potrebbe calcolarsi in anticipo il puzzle (o la parola) di domani.
function seedFor(label: string): number {
  const secret = process.env.GAMES_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("GAMES_SECRET mancante");
  }
  const hash = createHmac("sha256", secret ?? "dev-secret")
    .update(label)
    .digest();
  return hash.readUInt32BE(0);
}

// Lo Zip del giorno: uguale per tutti, cambia a mezzanotte.
// La griglia è 6×6 o 7×7, a seconda del giorno.
export function dailyZip(date = romeToday()): ZipPuzzle {
  const seed = seedFor(`zip:${date}`);
  const size = seed % 3 === 0 ? 7 : 6;
  return generateZip(seed, size);
}

// Il giorno prima, sempre in formato "AAAA-MM-GG".
export function dayBefore(date: string): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

// Nome e avatar Twitch da mostrare in classifica (stessi campi del Profilo).
export function playerInfo(user: User): {
  username: string;
  avatar_url: string | null;
} {
  const m = user.user_metadata ?? {};
  return {
    username: m.nickname ?? m.name ?? m.preferred_username ?? "Anonimo",
    avatar_url: m.avatar_url ?? m.picture ?? null,
  };
}

export type ZipRow = {
  user_id: string;
  username: string;
  avatar_url: string | null;
  time_ms: number;
};

// Classifica di un giorno: solo partite finite, dal tempo più basso.
export async function zipLeaderboard(
  giorno: string,
  limit = 50,
): Promise<ZipRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("zip_games")
    .select("user_id, username, avatar_url, time_ms")
    .eq("giorno", giorno)
    .not("time_ms", "is", null)
    .order("time_ms", { ascending: true })
    .order("finished_at", { ascending: true })
    .limit(limit);
  return (data ?? []) as ZipRow[];
}

export const MEDALS = ["🥇", "🥈", "🥉"];

// I primi 3 di ieri: hanno il badge per tutta la giornata di oggi.
// Mappa user_id → medaglia.
export async function zipBadges(today = romeToday()): Promise<Map<string, string>> {
  const podium = await zipLeaderboard(dayBefore(today), 3);
  return new Map(podium.map((row, i) => [row.user_id, MEDALS[i]]));
}

// --- Parola della settimana -------------------------------------------------

// Lunedì della settimana di `date` ("AAAA-MM-GG"): identifica la settimana.
export function mondayOf(date = romeToday()): string {
  const d = new Date(`${date}T12:00:00Z`);
  const daysSinceMonday = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - daysSinceMonday);
  return d.toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Primo lunedì da cui contiamo le settimane.
const WORDLE_EPOCH = "2026-01-05";

// La parola segreta di una settimana. Le soluzioni vengono mescolate UNA
// volta (con il segreto) e poi si va avanti di una ogni settimana: così non
// si ripete finché la lista non è finita, e nessuno può prevederla.
export function weeklyWord(monday = mondayOf()): string {
  const rand = seededRandom(seedFor("wordle-order"));
  const order = [...SOLUZIONI];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const weeks = Math.round(
    (Date.parse(monday) - Date.parse(WORDLE_EPOCH)) / (7 * 86_400_000),
  );
  const idx = ((weeks % order.length) + order.length) % order.length;
  return order[idx];
}

export type WordleRow = {
  user_id: string;
  username: string;
  avatar_url: string | null;
  attempts: number;
  time_ms: number;
};

// Classifica di una settimana: chi l'ha indovinata, prima per numero di
// tentativi e poi per tempo. Si legge col client admin perché la tabella non
// è pubblica (contiene i tentativi, che svelerebbero la parola).
export async function wordleLeaderboard(
  monday: string,
  limit = 50,
): Promise<WordleRow[]> {
  const { data } = await createAdminClient()
    .from("wordle_games")
    .select("user_id, username, avatar_url, attempts, time_ms")
    .eq("settimana", monday)
    .eq("solved", true)
    .order("attempts", { ascending: true })
    .order("time_ms", { ascending: true })
    .limit(limit);
  return (data ?? []) as WordleRow[];
}

// Può giocare al Wordle? Solo abbonati, più Joe (che non può abbonarsi a se
// stesso). "noToken" = non abbiamo il permesso Twitch per controllarlo:
// l'utente deve aggiornare i permessi dal Profilo.
export async function wordleAccess(
  user: User,
): Promise<"ok" | "notSub" | "noToken"> {
  const login = String(
    user.user_metadata?.preferred_username ?? user.user_metadata?.nickname ?? "",
  ).toLowerCase();
  if (login === JOE_TWITCH_LOGIN) return "ok";

  const channel = await getChannelInfo();
  if (!channel.id) return "noToken";
  const rel = await getUserChannelRelation(user.id, channel.id);
  if (!rel.connected) return "noToken";
  return rel.subscribed ? "ok" : "notSub";
}

// SOLO PER PROVE IN LOCALE: con GAMES_DEV_OPEN=1 in .env.local si gioca anche
// senza login (partita non salvata) e il Wordle non controlla l'abbonamento.
// Vale solo con `npm run dev`: in produzione è sempre false.
export function gamesDevOpen(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.GAMES_DEV_OPEN === "1"
  );
}
