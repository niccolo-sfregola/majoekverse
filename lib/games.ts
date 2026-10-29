import { createHmac } from "node:crypto";
import type { User } from "@supabase/supabase-js";
import { createClient } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";
import { generateZip, seededRandom, type ZipPuzzle } from "./zip";
import { SOLUZIONI } from "./wordle-words";
import { isJoeUser } from "./auth";
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

// --- Parola del giorno ------------------------------------------------------

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

// Primo giorno da cui contiamo le parole giornaliere.
const WORDLE_EPOCH = "2026-10-19";

// La parola segreta di un giorno. Le soluzioni vengono mescolate UNA volta
// (con il segreto) e poi si va avanti di una al giorno: così non si ripete
// finché la lista non è finita, e nessuno può prevederla.
export function dailyWord(date = romeToday()): string {
  const rand = seededRandom(seedFor("wordle-daily-order"));
  const order = [...SOLUZIONI];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const days = Math.round(
    (Date.parse(date) - Date.parse(WORDLE_EPOCH)) / 86_400_000,
  );
  const idx = ((days % order.length) + order.length) % order.length;
  return order[idx];
}

export type WordleRow = {
  user_id: string;
  username: string;
  avatar_url: string | null;
  attempts: number;
  time_ms: number;
};

// Classifica di un giorno: chi l'ha indovinata, prima per numero di
// tentativi e poi per tempo. Si legge col client admin perché la tabella non
// è pubblica (contiene i tentativi, che svelerebbero la parola).
export async function wordleLeaderboard(
  giorno: string,
  limit = 50,
): Promise<WordleRow[]> {
  const { data } = await createAdminClient()
    .from("wordle_games")
    .select("user_id, username, avatar_url, attempts, time_ms")
    .eq("giorno", giorno)
    .eq("solved", true)
    .order("attempts", { ascending: true })
    .order("time_ms", { ascending: true })
    .limit(limit);
  return (data ?? []) as WordleRow[];
}

// --- Punti ---------------------------------------------------------------------
// Ogni giorno: indovinata in 1 tentativo = 6 punti, in 2 = 5, … in 6 = 1
// (persa o saltata = 0). In più i 3 più veloci del giorno, tra chi l'ha
// indovinata, prendono un bonus. Vince la settimana chi somma più punti.

export const BONUS_VELOCITA = [3, 2, 1];

export function puntiTentativi(attempts: number): number {
  return Math.max(0, 7 - attempts);
}

// Punti di ogni partita vinta, dato l'elenco COMPLETO delle partite vinte
// di UN giorno. Restituisce una mappa user_id → punti (tentativi + bonus).
export function puntiDelGiorno(partite: WordleRow[]): Map<string, number> {
  const punti = new Map(
    partite.map((p) => [p.user_id, puntiTentativi(p.attempts)]),
  );
  [...partite]
    .sort((a, b) => a.time_ms - b.time_ms)
    .slice(0, BONUS_VELOCITA.length)
    .forEach((p, i) => {
      punti.set(p.user_id, (punti.get(p.user_id) ?? 0) + BONUS_VELOCITA[i]);
    });
  return punti;
}

export type WeeklyRow = {
  user_id: string;
  username: string;
  avatar_url: string | null;
  punti: number;
  giorni: number; // giorni in cui l'ha indovinata
  time_ms: number; // tempo totale, per gli spareggi
};

// Classifica di una settimana: somma dei punti di ogni giorno. A parità di
// punti, vince chi ci ha messo meno in totale.
export async function weeklyLeaderboard(
  monday: string,
  limit = 50,
): Promise<WeeklyRow[]> {
  const { data } = await createAdminClient()
    .from("wordle_games")
    .select("user_id, username, avatar_url, attempts, time_ms, giorno")
    .eq("settimana", monday)
    .eq("solved", true);
  const partite = (data ?? []) as (WordleRow & { giorno: string })[];

  // Raggruppa per giorno: il bonus velocità si decide giorno per giorno.
  const perGiorno = new Map<string, WordleRow[]>();
  for (const p of partite) {
    perGiorno.set(p.giorno, [...(perGiorno.get(p.giorno) ?? []), p]);
  }

  const totali = new Map<string, WeeklyRow>();
  for (const giorno of perGiorno.values()) {
    const punti = puntiDelGiorno(giorno);
    for (const p of giorno) {
      const tot = totali.get(p.user_id) ?? {
        user_id: p.user_id,
        username: p.username,
        avatar_url: p.avatar_url,
        punti: 0,
        giorni: 0,
        time_ms: 0,
      };
      tot.punti += punti.get(p.user_id) ?? 0;
      tot.giorni += 1;
      tot.time_ms += p.time_ms;
      totali.set(p.user_id, tot);
    }
  }

  return [...totali.values()]
    .sort((a, b) => b.punti - a.punti || a.time_ms - b.time_ms)
    .slice(0, limit);
}

// Può giocare al Wordle? Solo abbonati, più Joe (che non può abbonarsi a se
// stesso). "noToken" = non abbiamo il permesso Twitch per controllarlo:
// l'utente deve aggiornare i permessi dal Profilo.
export async function wordleAccess(
  user: User,
): Promise<"ok" | "notSub" | "noToken"> {
  if (isJoeUser(user)) return "ok";

  const channel = await getChannelInfo();
  if (!channel.id) return "noToken";
  const rel = await getUserChannelRelation(user.id, channel.id);
  if (!rel.connected) return "noToken";
  return rel.subscribed ? "ok" : "notSub";
}

// --- Proposte di titolo -------------------------------------------------------

export const MAX_PROPOSTE = 3;
// Giorni per proporre: da lunedì (o dal giorno del rifiuto) compreso.
const GIORNI_PROPOSTA = 3;

export type Proposta = {
  id: number;
  titolo: string;
  stato: "pending" | "accepted" | "rejected";
  motivo: string | null;
  created_at: string;
  reviewed_at: string | null;
};

export type TitleState =
  | { kind: "none" } // non è il vincitore della settimana scorsa
  | {
      kind: "winner";
      settimana: string; // settimana vinta
      proposte: Proposta[];
      // Cosa può fare adesso:
      // propose = può scrivere (fino a `scadenza` compresa), pending = attende
      // Joe, accepted = premio usato, exhausted = 3 proposte rifiutate,
      // expired = tempo scaduto.
      azione: "propose" | "pending" | "accepted" | "exhausted" | "expired";
      scadenza: string | null; // ultimo giorno utile, "AAAA-MM-GG"
      rimaste: number;
    };

// Il vincitore è Joe? Allora quella settimana il premio non si assegna:
// Joe non propone titoli a sé stesso, e nessun altro lo eredita.
export async function isJoeUserId(userId: string): Promise<boolean> {
  const { data } = await createAdminClient().auth.admin.getUserById(userId);
  return isJoeUser(data.user);
}

// --- Premio della settimana ----------------------------------------------------
// Il titolo lo propone il primo in classifica, MA chi aveva già avuto il
// premio la settimana prima viene saltato: si scende in classifica finché
// non si trova qualcun altro. Se il primo è stato saltato resta comunque il
// vincitore, e si prende la corona 👑. Se il primo è Joe, il premio non si
// assegna (Joe non propone titoli a sé stesso, e nessuno lo eredita).

export type Premio = {
  vincitore: WeeklyRow | null; // primo in classifica
  premiato: WeeklyRow | null; // chi propone il titolo
  corona: boolean; // il vincitore è stato saltato: aveva già il premio
  vintaDaJoe: boolean;
};

export async function premioSettimana(settimana: string): Promise<Premio> {
  const [classifica, giaPremiato] = await Promise.all([
    weeklyLeaderboard(settimana),
    premiatoDi(addDays(settimana, -7)),
  ]);
  const vincitore = classifica[0] ?? null;
  const nessuno = { vincitore, premiato: null, corona: false, vintaDaJoe: false };
  if (!vincitore) return nessuno;
  if (await isJoeUserId(vincitore.user_id)) {
    return { ...nessuno, vintaDaJoe: true };
  }

  const corona = vincitore.user_id === giaPremiato;
  for (const row of classifica) {
    if (row.user_id === giaPremiato) continue;
    if (await isJoeUserId(row.user_id)) continue;
    return { vincitore, premiato: row, corona, vintaDaJoe: false };
  }
  // Nessun altro in classifica: niente titolo questa volta.
  return { ...nessuno, corona };
}

// Chi ha avuto il premio in una settimana (user_id, o null se nessuno).
// Dipende dalla settimana prima, che dipende da quella prima ancora… Per
// non ricalcolare tutto ogni volta, le settimane CHIUSE le salviamo in
// wordle_premi: lì il risultato non può più cambiare.
async function premiatoDi(settimana: string): Promise<string | null> {
  if (settimana < WORDLE_EPOCH) return null;

  const db = createAdminClient();
  const { data } = await db
    .from("wordle_premi")
    .select("user_id")
    .eq("settimana", settimana)
    .maybeSingle();
  if (data) return data.user_id;

  const { premiato } = await premioSettimana(settimana);
  const user_id = premiato?.user_id ?? null;
  if (settimana < mondayOf()) {
    // ignoreDuplicates: se due richieste lo calcolano insieme, il risultato
    // è lo stesso e vince la prima.
    const { error } = await db
      .from("wordle_premi")
      .upsert({ settimana, user_id }, { ignoreDuplicates: true });
    if (error) console.error("[parola] premio non salvato", error);
  }
  return user_id;
}

// Situazione del premio per questo utente (calcolata sempre dal server).
export async function titleState(userId: string): Promise<TitleState> {
  const settimana = addDays(mondayOf(), -7);
  if ((await premiatoDi(settimana)) !== userId) return { kind: "none" };

  const { data } = await createAdminClient()
    .from("title_proposals")
    .select("id, titolo, stato, motivo, created_at, reviewed_at")
    .eq("user_id", userId)
    .eq("settimana", settimana)
    .order("created_at", { ascending: true });
  const proposte = (data ?? []) as Proposta[];
  const ultima = proposte[proposte.length - 1];
  const rimaste = MAX_PROPOSTE - proposte.length;
  const base = { kind: "winner" as const, settimana, proposte, rimaste };

  if (proposte.some((p) => p.stato === "accepted")) {
    return { ...base, azione: "accepted", scadenza: null };
  }
  if (ultima?.stato === "pending") {
    return { ...base, azione: "pending", scadenza: null };
  }
  if (rimaste <= 0) return { ...base, azione: "exhausted", scadenza: null };

  // I giorni partono da lunedì, o dal giorno dell'ultimo rifiuto.
  const inizio = ultima?.reviewed_at
    ? romeToday(new Date(ultima.reviewed_at))
    : mondayOf();
  const scadenza = addDays(inizio, GIORNI_PROPOSTA - 1);
  return {
    ...base,
    azione: romeToday() <= scadenza ? "propose" : "expired",
    scadenza,
  };
}
