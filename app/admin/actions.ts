"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { sendToDiscord } from "@/lib/discord";
import { formatSchedule, formatNews, formatEvent } from "@/lib/announce";

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

// Salva una riga: se il form ha un "id" è una modifica, se no è un inserimento.
export async function saveRow(formData: FormData) {
  await assertAdmin();

  const table = text(formData, "table");
  const fields = FIELDS[table];
  if (!fields) throw new Error("Tabella non valida");

  const id = text(formData, "id");
  const row = Object.fromEntries(fields.map((f) => [f, text(formData, f)]));

  const supabase = await createClient();
  if (id) {
    await supabase.from(table).update(row).eq("id", id);
  } else {
    await supabase.from(table).insert(row);
  }
  refresh();
}

export async function deleteRow(formData: FormData) {
  await assertAdmin();

  const table = text(formData, "table");
  const id = text(formData, "id");
  if (!FIELDS[table] || !id) throw new Error("Richiesta non valida");

  const supabase = await createClient();
  await supabase.from(table).delete().eq("id", id);
  refresh();
}

// --- Annunci Discord -------------------------------------------------------
// Firma adatta a useActionState: (statoPrecedente, formData) => nuovoStato.
export type AnnounceState = { ok: boolean; message: string } | null;

export async function announceSchedule(
  _prev: AnnounceState,
  _formData: FormData,
): Promise<AnnounceState> {
  await assertAdmin();

  const supabase = await createClient();
  const { data } = await supabase
    .from("schedule")
    .select("*")
    .order("data", { ascending: true });

  const content = formatSchedule(data ?? []);
  if (!content) return { ok: false, message: "Schedule vuota: niente da pubblicare." };

  try {
    await sendToDiscord(content);
    return { ok: true, message: "Schedule pubblicata su Discord ✅" };
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
