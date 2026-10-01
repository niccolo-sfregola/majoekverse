"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  mondayOf,
  playerInfo,
  titleState,
  weeklyWord,
  wordleAccess,
} from "@/lib/games";
import { AMMESSE } from "@/lib/wordle-words";
import { sendToAdmins } from "@/lib/push";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { LUNGHEZZA, MAX_TENTATIVI, valuta, type Riga } from "@/lib/wordle";

export type GuessResult =
  | {
      ok: true;
      righe: Riga[];
      stato: "playing" | "won" | "lost";
      timeMs: number | null;
    }
  | {
      ok: false;
      error:
        | "login"
        | "notSub"
        | "noToken"
        | "notWord"
        | "finished"
        | "server";
    };

// Un tentativo. La parola segreta non lascia mai il server: al browser
// tornano solo i colori di ogni riga.
export async function guessWordle(input: string): Promise<GuessResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "login" };

  const parola = String(input ?? "").trim().toLowerCase();
  if (parola.length !== LUNGHEZZA || !AMMESSE.has(parola)) {
    return { ok: false, error: "notWord" };
  }

  const settimana = mondayOf();
  const segreta = weeklyWord(settimana);

  const db = createAdminClient();

  let { data: row } = await db
    .from("wordle_games")
    .select("id, guesses, started_at, finished_at")
    .eq("user_id", user.id)
    .eq("settimana", settimana)
    .maybeSingle();

  // Primo tentativo della settimana: controlliamo l'abbonamento (una volta
  // sola, non a ogni parola) e creiamo la riga. Il tempo parte da qui.
  if (!row) {
    const access = await wordleAccess(user);
    if (access !== "ok") return { ok: false, error: access };

    const { data: created, error } = await db
      .from("wordle_games")
      .insert({
        user_id: user.id,
        settimana,
        started_at: new Date().toISOString(),
        ...playerInfo(user),
      })
      .select("id, guesses, started_at, finished_at")
      .single();
    if (error || !created) return { ok: false, error: "server" };
    row = created;
  }

  if (row.finished_at) return { ok: false, error: "finished" };

  const guesses: string[] = [...row.guesses, parola];
  const won = parola === segreta;
  const lost = !won && guesses.length >= MAX_TENTATIVI;
  const now = new Date();
  const timeMs = won ? now.getTime() - new Date(row.started_at).getTime() : null;

  // `.eq("guesses", row.guesses)`: se arrivano due tentativi insieme, il
  // secondo non trova più la riga com'era e non scrive niente.
  const { data: saved, error } = await db
    .from("wordle_games")
    .update({
      guesses,
      solved: won,
      finished_at: won || lost ? now.toISOString() : null,
      attempts: won ? guesses.length : null,
      time_ms: timeMs,
    })
    .eq("id", row.id)
    .eq("guesses", `{${row.guesses.join(",")}}`)
    .select("id");
  if (error || !saved?.length) return { ok: false, error: "server" };

  if (won || lost) revalidatePath("/giochi/parola");

  return {
    ok: true,
    righe: guesses.map((g) => ({ parola: g, esiti: valuta(g, segreta) })),
    stato: won ? "won" : lost ? "lost" : "playing",
    timeMs,
  };
}

export type ProposeState = { ok: boolean; message: string } | null;

// Il vincitore della settimana scorsa propone un titolo. Tutte le regole
// (è davvero il vincitore? ha ancora proposte? è nei tempi?) le ricontrolla
// titleState qui sul server: il form nel browser non decide niente.
export async function proposeTitle(
  _prev: ProposeState,
  formData: FormData,
): Promise<ProposeState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "login" };

  const titolo = String(formData.get("titolo") ?? "").trim();
  if (titolo.length < 1 || titolo.length > 140) {
    return { ok: false, message: "length" };
  }

  const state = await titleState(user.id);
  if (state.kind !== "winner" || state.azione !== "propose") {
    return { ok: false, message: "notAllowed" };
  }

  const { error } = await createAdminClient()
    .from("title_proposals")
    .insert({
      user_id: user.id,
      settimana: state.settimana,
      titolo,
      username: playerInfo(user).username,
    });
  if (error) return { ok: false, message: "server" };

  // Avvisa gli admin DOPO aver risposto: la proposta è già salvata, e se
  // l'invio delle notifiche fallisce non cambia niente per il vincitore.
  const username = playerInfo(user).username;
  after(async () => {
    try {
      await sendToAdmins((lang) => ({
        title: dictionaries[lang].notifiche.newProposal,
        body: `${username}: “${titolo}”`,
        url: "/admin",
      }));
    } catch (e) {
      console.error("Notifica proposta non inviata:", e);
    }
  });

  revalidatePath("/giochi/parola");
  revalidatePath("/admin");
  return { ok: true, message: "sent" };
}
