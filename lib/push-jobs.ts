import { createAdminClient } from "./supabase/admin";
import { dictionaries } from "./i18n/dictionaries";
import {
  dayBefore,
  MEDALS,
  mondayOf,
  romeToday,
  wordleAccess,
  zipLeaderboard,
} from "./games";
import { sendToSubscriptions, subscriptionsFor, type SubRow } from "./push";

// Le notifiche a orario. Le chiama /api/cron, che decide QUALE mandare in
// base all'ora italiana (vedi `jobsForNow`).

export type JobName =
  | "zip-morning" // ogni giorno 9:00: Zip online (+ podio di ieri ai primi 3)
  | "zip-reminder" // ogni giorno 20:00: a chi oggi non ha giocato
  | "wordle-online" // lunedì 9:00: parola nuova
  | "wordle-reminder" // giovedì 20:00: a chi non l'ha finita
  | "wordle-last"; // domenica 18:00: ultime ore

export const JOB_NAMES: JobName[] = [
  "zip-morning",
  "zip-reminder",
  "wordle-online",
  "wordle-reminder",
  "wordle-last",
];

// Cosa va mandato adesso? Ora e giorno in ITALIA, così il cambio tra ora
// legale e solare non sposta niente (pg_cron invece ragiona in UTC).
export function jobsForNow(now = new Date()): JobName[] {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Rome",
    weekday: "short",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour")?.value);
  const day = parts.find((p) => p.type === "weekday")?.value; // "Mon"…

  const jobs: JobName[] = [];
  if (hour === 9) jobs.push("zip-morning");
  if (hour === 20) jobs.push("zip-reminder");
  if (day === "Mon" && hour === 9) jobs.push("wordle-online");
  if (day === "Thu" && hour === 20) jobs.push("wordle-reminder");
  if (day === "Sun" && hour === 18) jobs.push("wordle-last");
  return jobs;
}

// Solo gli utenti che possono giocare al Wordle (abbonati + Joe).
// Controllo su Twitch utente per utente: con pochi iscritti va bene.
async function onlyWordlePlayers(subs: SubRow[]): Promise<SubRow[]> {
  const db = createAdminClient();
  const userIds = [...new Set(subs.map((s) => s.user_id))];
  const allowed = new Set<string>();
  await Promise.all(
    userIds.map(async (id) => {
      const { data } = await db.auth.admin.getUserById(id);
      if (data.user && (await wordleAccess(data.user)) === "ok") {
        allowed.add(id);
      }
    }),
  );
  return subs.filter((s) => allowed.has(s.user_id));
}

export async function runJob(job: JobName) {
  const db = createAdminClient();
  const today = romeToday();

  switch (job) {
    case "zip-morning": {
      // A chi è sul podio di ieri un messaggio personale, a tutti gli altri
      // l'avviso normale: una notifica sola a testa.
      const podio = await zipLeaderboard(dayBefore(today), 3);
      const posizione = new Map(podio.map((r, i) => [r.user_id, i]));
      return sendToSubscriptions(await subscriptionsFor("zip"), (lang, userId) => {
        const n = dictionaries[lang].notifiche;
        const pos = posizione.get(userId);
        return {
          title:
            pos === undefined ? n.zipOnline : n.zipPodium(MEDALS[pos], pos + 1),
          body: pos === undefined ? n.zipOnlineBody : n.zipPodiumBody,
          url: "/giochi/zip",
          tag: "zip",
        };
      });
    }

    case "zip-reminder": {
      // Chi ha già una partita oggi (finita o iniziata) non va disturbato.
      const { data } = await db
        .from("zip_games")
        .select("user_id")
        .eq("giorno", today);
      const giocato = new Set((data ?? []).map((r) => r.user_id as string));
      return sendToSubscriptions(await subscriptionsFor("zip"), (lang, userId) => {
        if (giocato.has(userId)) return null;
        const n = dictionaries[lang].notifiche;
        return {
          title: n.zipReminder,
          body: n.zipReminderBody,
          url: "/giochi/zip",
          tag: "zip",
        };
      });
    }

    case "wordle-online": {
      const subs = await onlyWordlePlayers(await subscriptionsFor("wordle"));
      return sendToSubscriptions(subs, (lang) => {
        const n = dictionaries[lang].notifiche;
        return {
          title: n.wordleOnline,
          body: n.wordleOnlineBody,
          url: "/giochi/parola",
          tag: "wordle",
        };
      });
    }

    case "wordle-reminder":
    case "wordle-last": {
      // Chi ha già finito (indovinata o tentativi esauriti) è a posto.
      const { data } = await db
        .from("wordle_games")
        .select("user_id")
        .eq("settimana", mondayOf(today))
        .not("finished_at", "is", null);
      const finito = new Set((data ?? []).map((r) => r.user_id as string));
      const subs = await onlyWordlePlayers(
        (await subscriptionsFor("wordle")).filter((s) => !finito.has(s.user_id)),
      );
      return sendToSubscriptions(subs, (lang) => {
        const n = dictionaries[lang].notifiche;
        const last = job === "wordle-last";
        return {
          title: last ? n.wordleLast : n.wordleReminder,
          body: last ? n.wordleLastBody : n.wordleReminderBody,
          url: "/giochi/parola",
          tag: "wordle",
        };
      });
    }
  }
}
