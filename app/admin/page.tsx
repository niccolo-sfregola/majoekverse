import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { formatSchedule } from "@/lib/announce";
import { longDayIt, ddmm } from "@/lib/schedule";
import {
  saveRow,
  deleteRow,
  announceSchedule,
  announceNews,
  announceEvent,
} from "./actions";
import AnnounceButton from "./announceButton";

type Field = {
  name: string;
  placeholder: string;
  type?: string;
  required?: boolean;
};

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

const inputClass = "rounded-lg p-2 w-full";
const inputStyle = { backgroundColor: "#11102e", color: "#F6ECD8" };

// Form usato sia per aggiungere (nessun id) sia per modificare (con id).
function RowForm({
  table,
  fields,
  row,
}: {
  table: string;
  fields: Field[];
  row?: Record<string, string>;
}) {
  return (
    <form action={saveRow} className="flex flex-col gap-2">
      <input type="hidden" name="table" value={table} />
      {row ? <input type="hidden" name="id" value={row.id} /> : null}
      {fields.map((f) => (
        <input
          key={f.name}
          name={f.name}
          type={f.type ?? "text"}
          placeholder={f.placeholder}
          required={f.required}
          defaultValue={row?.[f.name] ?? ""}
          className={inputClass}
          style={inputStyle}
        />
      ))}
      <button
        type="submit"
        className="rounded-lg p-2 bg-brand-blu"
        style={{ color: "#F6ECD8" }}
      >
        {row ? "Salva modifiche" : "Aggiungi"}
      </button>
    </form>
  );
}

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
              <div
                className="flex flex-col gap-2 rounded-lg p-3"
                style={{ backgroundColor: "#11102e" }}
              >
                <p className="text-sm" style={{ color: "#B9A8E6" }}>
                  Anteprima messaggio Discord:
                </p>
                <pre
                  className="text-sm whitespace-pre-wrap"
                  style={{ color: "#F6ECD8" }}
                >
                  {formatSchedule(rows) || "(schedule vuota)"}
                </pre>
                <AnnounceButton
                  action={announceSchedule}
                  label="📢 Pubblica schedule su Discord"
                />
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
                      <form action={deleteRow}>
                        <input type="hidden" name="table" value={section.table} />
                        <input type="hidden" name="id" value={row.id} />
                        <button
                          type="submit"
                          className="rounded-lg px-2 py-1 text-sm bg-brand-corallo"
                          style={{ color: "#F6ECD8" }}
                        >
                          Elimina
                        </button>
                      </form>
                    </div>
                  </details>
                </li>
              ))}
            </ul>

            <div
              className="flex flex-col gap-2 rounded-lg p-3"
              style={{ backgroundColor: "#11102e" }}
            >
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
