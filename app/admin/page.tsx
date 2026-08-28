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
      { name: "icona", placeholder: "Icona (es. 🎁)" },
      { name: "titolo", placeholder: "Titolo", required: true },
      { name: "testo", placeholder: "Testo", required: true },
    ],
    label: (r) => `${r.icona ?? ""} ${r.titolo}`,
    announce: "news",
  },
  {
    table: "events",
    title: "Eventi",
    fields: [
      { name: "titolo", placeholder: "Titolo", required: true },
      { name: "descrizione", placeholder: "Descrizione", required: true },
      { name: "data", placeholder: "Data", type: "date", required: true },
    ],
    label: (r) => `${r.data} — ${r.titolo}`,
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
        ? `${longDayIt(r.data)} ${ddmm(r.data)} ${r.orario} — ${r.gioco}`
        : `${r.orario} — ${r.gioco}`,
    announce: "schedule",
    orderBy: "data",
  },
  {
    table: "sponsors",
    title: "Sponsor",
    fields: [
      { name: "name", placeholder: "Nome", required: true },
      { name: "link", placeholder: "Link (https://...)", type: "url", required: true },
      { name: "code", placeholder: "Codice sconto", required: true },
    ],
    label: (r) => `${r.name} — ${r.code}`,
  },
];

const boxClass = "flex flex-col gap-2 rounded-lg p-3";
const boxStyle = { backgroundColor: "#11102e" };
const preClass = "text-sm whitespace-pre-wrap";

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
    <main className="flex flex-col items-center min-h-screen gap-8 px-4 py-8">
      <h1 style={{ fontSize: "2rem", fontWeight: 500 }}>Area Admin</h1>

      {SECTIONS.map((section, i) => {
        const rows = (results[i].data ?? []) as Record<string, string>[];
        return (
          <section
            key={section.table}
            className="flex flex-col gap-3 rounded-xl p-4 bg-brand-darkblu w-full"
          >
            <h2 className="font-semibold" style={{ color: "#F6ECD8" }}>
              {section.title}
            </h2>

            {section.announce === "schedule" ? (
              <div className="flex flex-col gap-3">
                {/* Schedule completa */}
                <div className={boxClass} style={boxStyle}>
                  <p className="text-sm" style={{ color: "#B9A8E6" }}>
                    Schedule completa (per la settimana nuova):
                  </p>
                  <pre className={preClass} style={{ color: "#F6ECD8" }}>
                    {formatSchedule(rows) || "(schedule vuota)"}
                  </pre>
                  <AnnounceButton
                    action={announceSchedule}
                    label="📢 Pubblica schedule completa"
                  />
                </div>

                {/* Solo le modifiche */}
                <div className={boxClass} style={boxStyle}>
                  {previousSchedule.length === 0 ? (
                    <p className="text-sm" style={{ color: "#B9A8E6" }}>
                      Nessuna schedule ancora pubblicata: usa il pulsante qui
                      sopra la prima volta.
                    </p>
                  ) : scheduleChanges.length === 0 ? (
                    <p className="text-sm" style={{ color: "#B9A8E6" }}>
                      Nessuna modifica dall&apos;ultima pubblicazione.
                    </p>
                  ) : (
                    <>
                      <p className="text-sm" style={{ color: "#B9A8E6" }}>
                        Modifiche da annunciare (verrà creata anche una news):
                      </p>
                      <pre className={preClass} style={{ color: "#F6ECD8" }}>
                        {scheduleChanges.map(changeLine).join("\n")}
                      </pre>
                      <AnnounceButton
                        action={announceScheduleChanges}
                        label="📢 Annuncia modifiche"
                      />
                    </>
                  )}
                </div>

                {/* Inizio settimana nuova */}
                <div className={boxClass} style={boxStyle}>
                  <p className="text-sm" style={{ color: "#B9A8E6" }}>
                    A inizio settimana: svuota la schedule vecchia, poi carica la
                    nuova qui sotto.
                  </p>
                  <AnnounceButton
                    action={clearSchedule}
                    label="🗑️ Azzera schedule"
                    confirm="Vuoi eliminare tutte le righe della schedule?"
                  />
                </div>
              </div>
            ) : null}

            <ul className="flex flex-col gap-2">
              {rows.map((row) => (
                <li key={row.id}>
                  <details>
                    <summary className="flex items-center justify-between gap-3 cursor-pointer">
                      <span style={{ color: "#B9A8E6" }}>{section.label(row)}</span>
                      <span style={{ color: "#B9A8E6" }}>modifica ▾</span>
                    </summary>
                    <div className="flex flex-col gap-2 pt-2 pl-2">
                      <RowForm
                        table={section.table}
                        fields={section.fields}
                        row={row}
                      />
                      {section.announce === "news" ? (
                        <AnnounceButton
                          action={announceNews}
                          id={row.id}
                          label="📢 Annuncia su Discord"
                        />
                      ) : null}
                      {section.announce === "event" ? (
                        <AnnounceButton
                          action={announceEvent}
                          id={row.id}
                          label="📢 Annuncia su Discord"
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

            <div className={boxClass} style={boxStyle}>
              <p className="text-sm" style={{ color: "#B9A8E6" }}>
                Aggiungi {section.title.toLowerCase()}
              </p>
              <RowForm table={section.table} fields={section.fields} />
            </div>
          </section>
        );
      })}
    </main>
  );
}
