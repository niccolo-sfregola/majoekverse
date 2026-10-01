"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { dailyZip, gamesDevOpen, playerInfo, romeToday } from "@/lib/games";
import { isSolved, type ZipPuzzle } from "@/lib/zip";

export type ZipStartResult =
  | { ok: true; puzzle: ZipPuzzle; elapsedMs: number }
  | { ok: false; error: "login" | "played" | "server" };

export type ZipFinishResult =
  | { ok: true; timeMs: number | null } // null = prova senza login, non salvata
  | { ok: false; error: "login" | "invalid" | "server" };

// "Inizia": salva l'ora di partenza e SOLO ORA manda il puzzle al browser.
// Se la partita di oggi era già iniziata (pagina ricaricata), la riprende:
// il tempo intanto è andato avanti.
export async function startZip(): Promise<ZipStartResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // Prova in locale senza login: puzzle sì, salvataggio no.
    if (gamesDevOpen()) {
      return { ok: true, puzzle: dailyZip(), elapsedMs: 0 };
    }
    return { ok: false, error: "login" };
  }

  const giorno = romeToday();
  const db = createAdminClient();

  // Proviamo a creare la riga; se c'è già (unique user_id+giorno) non
  // succede niente e la rileggiamo sotto.
  const { error: insertError } = await db.from("zip_games").upsert(
    {
      user_id: user.id,
      giorno,
      started_at: new Date().toISOString(),
      ...playerInfo(user),
    },
    { onConflict: "user_id,giorno", ignoreDuplicates: true },
  );
  if (insertError) return { ok: false, error: "server" };

  const { data: row } = await db
    .from("zip_games")
    .select("started_at, finished_at")
    .eq("user_id", user.id)
    .eq("giorno", giorno)
    .single();
  if (!row) return { ok: false, error: "server" };
  if (row.finished_at) return { ok: false, error: "played" };

  return {
    ok: true,
    puzzle: dailyZip(giorno),
    elapsedMs: Date.now() - new Date(row.started_at).getTime(),
  };
}

// Fine partita: il browser manda il percorso, il server controlla che sia
// davvero una soluzione e calcola il tempo con i SUOI orologi.
export async function finishZip(path: number[]): Promise<ZipFinishResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user && !gamesDevOpen()) return { ok: false, error: "login" };

  // Dal browser può arrivare di tutto: controlliamo che sia un elenco di
  // numeri interi prima di usarlo.
  if (
    !Array.isArray(path) ||
    path.length > 100 ||
    !path.every((c) => Number.isInteger(c))
  ) {
    return { ok: false, error: "invalid" };
  }

  if (!user) {
    // Prova in locale senza login: controlliamo e basta.
    return isSolved(dailyZip(), path)
      ? { ok: true, timeMs: null }
      : { ok: false, error: "invalid" };
  }

  const db = createAdminClient();
  // La partita aperta più recente (di solito quella di oggi; se hai iniziato
  // alle 23:59, quella di ieri: vale il puzzle del giorno in cui hai iniziato).
  const { data: row } = await db
    .from("zip_games")
    .select("id, giorno, started_at")
    .eq("user_id", user.id)
    .is("finished_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!row) return { ok: false, error: "invalid" };

  if (!isSolved(dailyZip(row.giorno), path)) {
    return { ok: false, error: "invalid" };
  }

  const finishedAt = new Date();
  const timeMs = finishedAt.getTime() - new Date(row.started_at).getTime();

  // `.is("finished_at", null)`: se arrivano due richieste insieme, solo la
  // prima scrive il tempo.
  const { error } = await db
    .from("zip_games")
    .update({ finished_at: finishedAt.toISOString(), time_ms: timeMs })
    .eq("id", row.id)
    .is("finished_at", null);
  if (error) return { ok: false, error: "server" };

  revalidatePath("/giochi/zip");
  return { ok: true, timeMs };
}
