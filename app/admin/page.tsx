import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { formatSchedule } from "@/lib/announce";
import { longDayIt, ddmm } from "@/lib/schedule";
import {
  normalizeRows,
  diffSchedule,
  changeLine,
  type ScheduleRow,
} from "@/lib/schedule-diff";
import { blowbrush } from "@/app/fonts";
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

type Section = {
  table: string;
  title: string;
  icon: string;
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
    icon: "📰",
    fields: [
      { name: "icona", placeholder: "Icona (es. 🎁)" },
      { name: "titolo", placeholder: "Titolo", required: true },
      { name: "testo", placeholder: "Testo", required: true, type: "textarea" },
    ],
    label: (r) => `${r.icona ?? ""} ${r.titolo}`,
    announce: "news",
  },
  {
    table: "events",
    title: "Eventi",
    icon: "📅",
    fields: [
      { name: "titolo", placeholder: "Titolo", required: true },
      {
        name: "descrizione",
        placeholder: "Descrizione",
        required: true,
        type: "textarea",
      },
      { name: "data", placeholder: "Data", type: "date", required: true },
      {
        name: "solo_abbonati",
        placeholder: "Solo per abbonati al canale",
        type: "checkbox",
      },
    ],
    label: (r) => `${r.solo_abbonati ? "🔒 " : ""}${r.data} · ${r.titolo}`,
    announce: "event",
    orderBy: "data",
  },
  {
    table: "schedule",
    title: "Schedule",
    icon: "🗓️",
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
    icon: "🤝",
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
      `${r.ufficiale ? "⭐ " : ""}${r.name}${r.sconto ? ` · ${r.sconto}` : ""}`,
  },
];

const subBox = "flex flex-col gap-2 rounded-xl bg-brand-fondo/45 p-4";
const subLabel =
  "text-xs font-semibold uppercase tracking-[0.16em] text-brand-lavanda";
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

  return (
    <main className="rise-in safe-top mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 px-4 pb-10">
      <h1
        className={`${blowbrush.className} text-center text-4xl tracking-wide text-brand-crema md:text-5xl`}
      >
        Area Admin
      </h1>
      <p className="text-center text-sm text-brand-lavanda">
        Ogni modifica compare subito sul sito. Apri una sezione per gestirla.
      </p>

      {/* Riepilogo: quante voci per tabella. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SECTIONS.map((section, i) => (
          <div key={section.table} className="panel p-3 text-center">
            <div className="text-2xl font-semibold text-brand-crema">
              {(results[i].data ?? []).length}
            </div>
            <div className="text-[0.7rem] uppercase tracking-[0.12em] text-brand-lavanda">
              {section.title}
            </div>
          </div>
        ))}
      </div>

      {/* Strumenti Discord per la schedule, separati dalla gestione righe. */}
      <Collapsible
        title="Pubblica la schedule"
        subtitle="Invio su Discord + news automatica"
        icon="📢"
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
            <p className="text-sm text-brand-lavanda">
              Nessuna schedule ancora pubblicata: usa il pulsante qui sopra la
              prima volta.
            </p>
          ) : scheduleChanges.length === 0 ? (
            <p className="text-sm text-brand-lavanda">
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
          <p className="text-sm text-brand-lavanda">
            A inizio settimana: svuota la schedule vecchia, poi carica la nuova
            dalla sezione qui sotto.
          </p>
          <AnnounceButton
            action={clearSchedule}
            label="Azzera schedule"
            confirm="Vuoi eliminare tutte le righe della schedule?"
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
            icon={section.icon}
          >
            <Collapsible
              title={`Aggiungi ${section.title.toLowerCase()}`}
              icon="＋"
            >
              <RowForm table={section.table} fields={section.fields} />
            </Collapsible>

            {rows.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {rows.map((row) => (
                  <li
                    key={row.id}
                    className="overflow-hidden rounded-xl bg-brand-fondo/45"
                  >
                    <details className="row group">
                      <summary className="flex cursor-pointer items-center justify-between gap-3 p-3">
                        <span className="min-w-0 truncate text-sm text-brand-crema">
                          {section.label(row)}
                        </span>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="row-chevron shrink-0 text-brand-lavanda"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </summary>
                      <div className="flex flex-col gap-3 border-t border-brand-lavanda/10 p-3">
                        <RowForm
                          table={section.table}
                          fields={section.fields}
                          row={row}
                        />
                        {section.announce === "news" ? (
                          <AnnounceButton
                            action={announceNews}
                            id={row.id}
                            label="Annuncia su Discord"
                          />
                        ) : null}
                        {section.announce === "event" ? (
                          <AnnounceButton
                            action={announceEvent}
                            id={row.id}
                            label="Annuncia su Discord"
                          />
                        ) : null}
                        <DeleteButton
                          table={section.table}
                          id={row.id}
                          label={section.label(row)}
                        />
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-brand-lavanda">Ancora niente qui.</p>
            )}
          </Collapsible>
        );
      })}
    </main>
  );
}
