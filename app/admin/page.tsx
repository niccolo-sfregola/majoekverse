import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/auth";
import { formatSchedule } from "@/lib/announce";
import { longDayIt, ddmm } from "@/lib/schedule";
import {
  normalizeRows,
  diffSchedule,
  changeLine,
  type ScheduleRow,
} from "@/lib/schedule-diff";
import TitoloPagina from "@/app/titoloPagina";
import {
  clearSchedule,
  announceSchedule,
  announceScheduleChanges,
  announceNews,
  announceEvent,
} from "./actions";
import AnnounceButton from "./announceButton";
import RowForm, { type Field } from "./rowForm";
import DeleteButton from "./deleteButton";
import Collapsible from "./collapsible";
import AdminRow from "./adminRow";
import { ReviewForm, CopyTitle } from "./titleReview";
import { ScheduleAnnounceProvider } from "./scheduleAnnounceContext";
import ScheduleAnnouncePrompt from "./scheduleAnnouncePrompt";

type Section = {
  table: string;
  title: string;
  fields: Field[];
  label: (row: Record<string, string>) => string;
  announce?: "schedule" | "news" | "event";
  orderBy?: string;
};

// Un blocco di configurazione per tabella: quali campi ha e come si scrive
// la riga nella lista. Tutto il resto della pagina è uguale per tutte.
const SECTIONS: Section[] = [
  {
    table: "news",
    title: "News",
    fields: [
      { name: "titolo", placeholder: "Titolo", required: true },
      { name: "testo", placeholder: "Testo", required: true, type: "textarea" },
      { name: "immagine", placeholder: "Foto (facoltativa)", type: "photo" },
    ],
    label: (r) => r.titolo,
    announce: "news",
  },
  {
    table: "events",
    title: "Eventi",
    fields: [
      { name: "titolo", placeholder: "Titolo", required: true },
      {
        name: "descrizione",
        placeholder: "Descrizione",
        required: true,
        type: "textarea",
      },
      { name: "data", placeholder: "Data", type: "date", required: true },
      { name: "immagine", placeholder: "Foto (facoltativa)", type: "photo" },
      {
        name: "solo_abbonati",
        placeholder: "Solo per abbonati al canale",
        type: "checkbox",
      },
    ],
    label: (r) => `${r.data} · ${r.titolo}${r.solo_abbonati ? " · solo abbonati" : ""}`,
    announce: "event",
    orderBy: "data",
  },
  {
    table: "schedule",
    title: "Schedule",
    fields: [
      { name: "data", placeholder: "Data", type: "date", required: true },
      { name: "orario", placeholder: "Orario", type: "time", required: true },
      { name: "gioco", placeholder: "Gioco", required: true },
    ],
    label: (r) =>
      r.data
        ? `${longDayIt(r.data)} ${ddmm(r.data)} ${r.orario} · ${r.gioco}`
        : `${r.orario} · ${r.gioco}`,
    announce: "schedule",
    orderBy: "data",
  },
  {
    table: "sponsors",
    title: "Sponsor",
    fields: [
      { name: "name", placeholder: "Nome", required: true },
      {
        name: "link",
        placeholder: "Link (https://...)",
        type: "url",
        required: true,
      },
      { name: "code", placeholder: "Codice sconto", required: true },
      { name: "sconto", placeholder: "Sconto (es. 10%)" },
      { name: "logo", placeholder: "Logo", type: "image" },
      {
        name: "ufficiale",
        placeholder: "È uno sponsor vero (non un'affiliazione)",
        type: "checkbox",
      },
    ],
    label: (r) =>
      `${r.name}${r.sconto ? ` · ${r.sconto}` : ""}${r.ufficiale ? " · sponsor ufficiale" : ""}`,
  },
];

const subBox = "flex flex-col gap-3 bg-brand-fondo p-4";
const subLabel = "font-bold text-brand-lavanda";
const preClass = "whitespace-pre-wrap text-sm text-brand-crema";

export default async function Admin() {
  // Doppio controllo: prima login, poi ruolo. Chi non passa non vede la pagina.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/profilo");
  if (!(await isAdmin())) redirect("/");

  // Carico tutte le righe di tutte le tabelle in parallelo.
  const results = await Promise.all(
    SECTIONS.map((s) =>
      supabase
        .from(s.table)
        .select("*")
        .order(s.orderBy ?? "created_at", { ascending: true }),
    ),
  );

  // Schedule: confronto con l'ultima versione annunciata su Discord.
  const scheduleIdx = SECTIONS.findIndex((s) => s.table === "schedule");
  const scheduleRows = normalizeRows(
    (results[scheduleIdx].data ?? []) as Record<string, string>[],
  );
  const { data: snap } = await supabase
    .from("schedule_announcement")
    .select("snapshot")
    .eq("id", 1)
    .single();
  const previousSchedule = (snap?.snapshot ?? []) as ScheduleRow[];
  const scheduleChanges =
    previousSchedule.length > 0
      ? diffSchedule(scheduleRows, previousSchedule)
      : [];

  // Proposte di titolo dei vincitori della classifica settimanale della parola: tutte
  // quelle in attesa + le ultime decise. Tabella senza policy → client admin.
  type Proposta = {
    id: number;
    titolo: string;
    stato: "pending" | "accepted" | "rejected";
    motivo: string | null;
    username: string;
    settimana: string;
  };
  const adminDb = createAdminClient();
  const cols = "id, titolo, stato, motivo, username, settimana";
  const [{ data: inAttesa }, { data: decise }] = await Promise.all([
    adminDb
      .from("title_proposals")
      .select(cols)
      .eq("stato", "pending")
      .order("created_at", { ascending: true }),
    adminDb
      .from("title_proposals")
      .select(cols)
      .neq("stato", "pending")
      .order("reviewed_at", { ascending: false })
      .limit(10),
  ]);
  const pendingTitles = (inAttesa ?? []) as Proposta[];
  const reviewedTitles = (decise ?? []) as Proposta[];

  return (
    <ScheduleAnnounceProvider>
      <main className="pagina max-w-3xl">
        <div>
          <TitoloPagina>Area Admin</TitoloPagina>
          <p className="mt-2 text-brand-lavanda-chiara">
            Ogni modifica compare subito sul sito. Apri una sezione per gestirla.
          </p>
        </div>

        {/* Riepilogo e sezioni entrano a cascata, come nelle altre pagine. */}
        <div className="entra flex flex-col gap-4">

          {/* Riepilogo: quante voci per tabella. */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SECTIONS.map((section, i) => (
              <div key={section.table} className="taglio-piccolo bg-brand-superficie p-3">
                <div className="text-2xl font-bold tabular-nums text-brand-crema">
                  {(results[i].data ?? []).length}
                </div>
                <div className="text-sm text-brand-lavanda-chiara">{section.title}</div>
              </div>
            ))}
          </div>

          {/* Proposte di titolo: aperta da sola se c'è qualcosa da decidere. */}
          <Collapsible
            title="Proposte titolo live"
            subtitle={
              pendingTitles.length > 0
                ? `${pendingTitles.length} in attesa`
                : "Nessuna in attesa"
            }
            defaultOpen={pendingTitles.length > 0}
          >
            {pendingTitles.map((p) => (
              <div key={p.id} className={subBox}>
                <p className={subLabel}>
                  {p.username} · settimana del {ddmm(p.settimana)}
                </p>
                <p className="text-brand-crema">“{p.titolo}”</p>
                <ReviewForm id={p.id} />
              </div>
            ))}
            {reviewedTitles.length > 0 ? (
              <div className={subBox}>
                <p className={subLabel}>Ultime decise</p>
                <ul className="flex flex-col gap-2">
                  {reviewedTitles.map((p) => (
                    <li key={p.id} className="flex items-start gap-3">
                      <span
                        className={`w-20 shrink-0 text-sm font-bold ${
                          p.stato === "accepted" ? "text-brand-pesca" : "text-brand-lavanda-chiara"
                        }`}
                      >
                        {p.stato === "accepted" ? "Accettato" : "Rifiutato"}
                      </span>
                      <span className="min-w-0 flex-1 text-brand-crema">
                        “{p.titolo}”
                        <span className="block text-sm text-brand-lavanda-chiara">
                          {p.username}
                          {p.motivo ? ` · ${p.motivo}` : ""}
                        </span>
                      </span>
                      {p.stato === "accepted" ? (
                        <CopyTitle titolo={p.titolo} />
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : pendingTitles.length === 0 ? (
              <p className="text-brand-lavanda-chiara">
                Ancora nessuna proposta. Arrivano dal vincitore della parola della
                settimana.
              </p>
            ) : null}
          </Collapsible>

          {/* Strumenti Discord per la schedule, separati dalla gestione righe. */}
          <Collapsible
            title="Pubblica la schedule"
            subtitle="Invio su Discord + news automatica"
          >
            <div className={subBox}>
              <p className={subLabel}>Schedule completa (settimana nuova)</p>
              <pre className={preClass}>
                {formatSchedule(scheduleRows) || "(schedule vuota)"}
              </pre>
              <AnnounceButton
                action={announceSchedule}
                label="Pubblica schedule completa"
              />
            </div>

            <div className={subBox}>
              {previousSchedule.length === 0 ? (
                <p className="text-brand-lavanda-chiara">
                  Nessuna schedule ancora pubblicata: usa il pulsante qui sopra la
                  prima volta.
                </p>
              ) : scheduleChanges.length === 0 ? (
                <p className="text-brand-lavanda-chiara">
                  Nessuna modifica dall&apos;ultima pubblicazione.
                </p>
              ) : (
                <>
                  <p className={subLabel}>Modifiche da annunciare</p>
                  <pre className={preClass}>
                    {scheduleChanges.map(changeLine).join("\n")}
                  </pre>
                  <AnnounceButton
                    action={announceScheduleChanges}
                    label="Annuncia modifiche"
                  />
                </>
              )}
            </div>

            <div className={subBox}>
              <p className="text-brand-lavanda-chiara">
                A inizio settimana: svuota la schedule vecchia, poi carica la
                nuova dalla sezione qui sotto.
              </p>
              <AnnounceButton
                action={clearSchedule}
                label="Azzera schedule"
                confirm="Vuoi eliminare tutte le righe della schedule?"
                pericolo
              />
            </div>
          </Collapsible>

          {SECTIONS.map((section, i) => {
            const rows = (results[i].data ?? []) as Record<string, string>[];
            return (
              <Collapsible
                key={section.table}
                title={section.title}
                subtitle={`${rows.length} ${rows.length === 1 ? "voce" : "voci"}`}
              >
                <Collapsible title={`Aggiungi ${section.title.toLowerCase()}`} interno>
                  <RowForm
                    table={section.table}
                    fields={section.fields}
                    announce={section.announce}
                  />
                </Collapsible>

                {rows.length > 0 ? (
                  <ul className="flex flex-col gap-1.5">
                    {rows.map((row) => (
                      <AdminRow key={row.id} label={section.label(row)}>
                        <RowForm
                          table={section.table}
                          fields={section.fields}
                          row={row}
                          announce={section.announce}
                        />
                        {section.announce === "news" ? (
                          <AnnounceButton
                            action={announceNews}
                            id={row.id}
                            label={
                              row.discord_message_id
                                ? "Aggiorna su Discord"
                                : "Annuncia su Discord"
                            }
                          />
                        ) : null}
                        {section.announce === "event" ? (
                          <AnnounceButton
                            action={announceEvent}
                            id={row.id}
                            label={
                              row.discord_message_id
                                ? "Aggiorna su Discord"
                                : "Annuncia su Discord"
                            }
                          />
                        ) : null}
                        <DeleteButton
                          table={section.table}
                          id={row.id}
                          label={section.label(row)}
                        />
                      </AdminRow>
                    ))}
                  </ul>
                ) : (
                  <p className="text-brand-lavanda-chiara">Ancora niente qui.</p>
                )}
                {section.table === "schedule" ? <ScheduleAnnouncePrompt /> : null}
              </Collapsible>
            );
          })}
        </div>
      </main>
    </ScheduleAnnounceProvider>
  );
}
