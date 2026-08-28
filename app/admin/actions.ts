"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { sendToDiscord } from "@/lib/discord";
import { formatSchedule, formatNews, formatEvent } from "@/lib/announce";
import {
  normalizeRows,
  diffSchedule,
  formatScheduleChanges,
  scheduleChangesPlainText,
  type ScheduleRow,
} from "@/lib/schedule-diff";

// Le colonne modificabili per ogni tabella. Tutto ciò che non è qui non
// viene toccato (id e created_at restano al database).
const FIELDS: Record<string, string[]> = {
  news: ["icona", "titolo", "testo"],
  events: ["titolo", "descrizione", "data"],
  schedule: ["data", "orario", "gioco"],
  sponsors: ["name", "link", "code"],
};

// Ogni azione ricontrolla is_admin lato server: il database (RLS) lo impone
// comunque, ma così diamo un errore chiaro invece di un fallimento silenzioso.
async function assertAdmin() {
  if (!(await isAdmin())) {
    throw new Error("Non autorizzato");
  }
}

// Rinfresca le pagine pubbliche che mostrano questi dati.
function refresh() {
  revalidatePath("/");
  revalidatePath("/eventi");
  revalidatePath("/universo");
  revalidatePath("/admin");
}

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

// Stato restituito dalle azioni di modifica, per mostrare un esito nell'UI.
export type MutateState = { ok: boolean; message: string } | null;

// Salva una riga: se il form ha un "id" è una modifica, se no è un inserimento.
export async function saveRow(
  _prev: MutateState,
  formData: FormData,
): Promise<MutateState> {
  try {
    await assertAdmin();

    const table = text(formData, "table");
    const fields = FIELDS[table];
    if (!fields) return { ok: false, message: "Tabella non valida." };

    const id = text(formData, "id");
    const row = Object.fromEntries(fields.map((f) => [f, text(formData, f)]));

    const supabase = await createClient();
    const { error } = id
      ? await supabase.from(table).update(row).eq("id", id)
      : await supabase.from(table).insert(row);

    if (error) return { ok: false, message: `Errore: ${error.message}` };

    refresh();
    return { ok: true, message: id ? "Modifica salvata ✅" : "Aggiunto ✅" };
  } catch (e) {
    return { ok: false, message: `Errore: ${(e as Error).message}` };
  }
}

export async function deleteRow(
  _prev: MutateState,
  formData: FormData,
): Promise<MutateState> {
  try {
    await assertAdmin();

    const table = text(formData, "table");
    const id = text(formData, "id");
    if (!FIELDS[table] || !id)
      return { ok: false, message: "Richiesta non valida." };

    const supabase = await createClient();
    const { error } = await supabase.from(table).delete().eq("id", id);

    if (error) return { ok: false, message: `Errore: ${error.message}` };

    refresh();
    return { ok: true, message: "Eliminato." };
  } catch (e) {
    return { ok: false, message: `Errore: ${(e as Error).message}` };
  }
}

// Azzera tutta la schedule (inizio settimana nuova) e resetta lo snapshot
// degli annunci, così la prossima pubblicazione riparte da zero.
export async function clearSchedule(
  _prev: AnnounceState,
  _formData: FormData,
): Promise<AnnounceState> {
  try {
    await assertAdmin();
    const supabase = await createClient();

    const { data: rows } = await supabase.from("schedule").select("id");
    const ids = (rows ?? []).map((r) => r.id);
    if (ids.length > 0) {
      const { error } = await supabase.from("schedule").delete().in("id", ids);
      if (error) return { ok: false, message: `Errore: ${error.message}` };
    }

    await supabase
      .from("schedule_announcement")
      .update({ snapshot: [], announced_at: null })
      .eq("id", 1);

    refresh();
    return { ok: true, message: "Schedule azzerata. Carica la settimana nuova." };
  } catch (e) {
    return { ok: false, message: `Errore: ${(e as Error).message}` };
  }
}

// --- Annunci Discord -------------------------------------------------------
// Firma adatta a useActionState: (statoPrecedente, formData) => nuovoStato.
export type AnnounceState = { ok: boolean; message: string } | null;

// Carica la schedule attuale, già pulita.
async function loadSchedule(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<ScheduleRow[]> {
  const { data } = await supabase
    .from("schedule")
    .select("*")
    .order("data", { ascending: true });
  return normalizeRows(data ?? []);
}

// Salva com'è la schedule adesso, come riferimento per il prossimo diff.
async function saveSnapshot(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rows: ScheduleRow[],
) {
  await supabase
    .from("schedule_announcement")
    .update({ snapshot: rows, announced_at: new Date().toISOString() })
    .eq("id", 1);
}

// Pubblica la schedule COMPLETA (nuova settimana).
export async function announceSchedule(
  _prev: AnnounceState,
  _formData: FormData,
): Promise<AnnounceState> {
  await assertAdmin();

  const supabase = await createClient();
  const rows = await loadSchedule(supabase);

  const content = formatSchedule(rows);
  if (!content) return { ok: false, message: "Schedule vuota: niente da pubblicare." };

  try {
    await sendToDiscord(content);
    await saveSnapshot(supabase, rows);
    return { ok: true, message: "Schedule completa pubblicata su Discord ✅" };
  } catch (e) {
    return { ok: false, message: `Errore: ${(e as Error).message}` };
  }
}

// Annuncia SOLO le modifiche rispetto all'ultima pubblicazione + crea una news.
export async function announceScheduleChanges(
  _prev: AnnounceState,
  _formData: FormData,
): Promise<AnnounceState> {
  await assertAdmin();

  const supabase = await createClient();
  const rows = await loadSchedule(supabase);

  const { data: snap } = await supabase
    .from("schedule_announcement")
    .select("snapshot")
    .eq("id", 1)
    .single();
  const previous = (snap?.snapshot ?? []) as ScheduleRow[];

  if (previous.length === 0) {
    return {
      ok: false,
      message: "Nessuna schedule ancora pubblicata: usa 'Pubblica schedule completa'.",
    };
  }

  const changes = diffSchedule(rows, previous);
  if (changes.length === 0) {
    return { ok: false, message: "Nessuna modifica dall'ultima pubblicazione." };
  }

  try {
    await sendToDiscord(formatScheduleChanges(changes));
    await supabase.from("news").insert({
      icona: "📅",
      titolo: "Modifica alla schedule",
      testo: scheduleChangesPlainText(changes),
    });
    await saveSnapshot(supabase, rows);
    refresh();
    return {
      ok: true,
      message: `Inviate ${changes.length} modifiche + news creata ✅`,
    };
  } catch (e) {
    return { ok: false, message: `Errore: ${(e as Error).message}` };
  }
}

export async function announceNews(
  _prev: AnnounceState,
  formData: FormData,
): Promise<AnnounceState> {
  await assertAdmin();

  const id = text(formData, "id");
  const supabase = await createClient();
  const { data: news } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .single();

  if (!news) return { ok: false, message: "News non trovata." };

  try {
    await sendToDiscord(formatNews(news));
    return { ok: true, message: "News annunciata su Discord ✅" };
  } catch (e) {
    return { ok: false, message: `Errore: ${(e as Error).message}` };
  }
}

export async function announceEvent(
  _prev: AnnounceState,
  formData: FormData,
): Promise<AnnounceState> {
  await assertAdmin();

  const id = text(formData, "id");
  const supabase = await createClient();
  const { data: evento } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!evento) return { ok: false, message: "Evento non trovato." };

  try {
    await sendToDiscord(formatEvent(evento));
    return { ok: true, message: "Evento annunciato su Discord ✅" };
  } catch (e) {
    return { ok: false, message: `Errore: ${(e as Error).message}` };
  }
}
