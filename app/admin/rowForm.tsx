"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { saveRow, type MutateState } from "./actions";
import ImageField from "./imageField";
import { useNotifyScheduleChanged } from "./scheduleAnnounceContext";
import { DISCORD_MAX, discordLength, formatEvent, formatNews } from "@/lib/announce";

export type Field = {
  name: string;
  placeholder: string;
  // "text" (default), "date", "time", "url", "checkbox", "textarea",
  // "image" (logo sponsor), "photo" (foto di news/eventi) o "multi"
  // (una spunta per ogni opzione, se ne possono scegliere più di una).
  type?: string;
  required?: boolean;
  // Solo per "multi": le opzioni e quelle già spuntate in una riga nuova.
  options?: { value: string; label: string }[];
  defaultValues?: string[];
};


// Form usato sia per aggiungere (nessun id) sia per modificare (con id).
// Mostra l'esito del salvataggio sotto al bottone.
export default function RowForm({
  table,
  fields,
  row,
  announce,
}: {
  table: string;
  fields: Field[];
  row?: Record<string, unknown>;
  announce?: "schedule" | "news" | "event";
}) {
  const [state, formAction, pending] = useActionState<MutateState, FormData>(
    saveRow,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const notifyScheduleChanged = useNotifyScheduleChanged();

  // Contatore caratteri per News ed Eventi: misura il messaggio Discord
  // COMPLETO (prefisso + titolo + testo), con le stesse funzioni dell'invio.
  const format =
    announce === "news" ? formatNews : announce === "event" ? formatEvent : null;
  const [length, setLength] = useState(0);
  const measure = useCallback(() => {
    if (!format || !formRef.current) return;
    const values = Object.fromEntries(
      [...new FormData(formRef.current)].map(([k, v]) => [k, String(v)]),
    );
    setLength(discordLength(format(values)));
  }, [format]);
  useEffect(measure, [measure]);

  // Dopo un inserimento riuscito, svuota i campi (solo nel form "aggiungi",
  // non in quello di modifica: lì i valori salvati vanno tenuti).
  const isNew = !row;
  useEffect(() => {
    if (isNew && state?.ok) {
      formRef.current?.reset();
      measure();
    }
  }, [state, isNew, measure]);

  // Avvisa il riquadro "pubblica su Discord" (vedi ScheduleAnnouncePrompt)
  // che è stata salvata una riga della schedule.
  useEffect(() => {
    if (table === "schedule" && state?.ok) notifyScheduleChanged();
  }, [state, table, notifyScheduleChanged]);

  return (
    <form
      ref={formRef}
      action={formAction}
      onInput={format ? measure : undefined}
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="table" value={table} />
      {row ? <input type="hidden" name="id" value={String(row.id)} /> : null}
      {fields.map((f) => {
        if (f.type === "multi") {
          // Stesso name per tutte le spunte: il server le legge con getAll().
          const current = Array.isArray(row?.[f.name])
            ? (row[f.name] as string[])
            : (f.defaultValues ?? []);
          return (
            <fieldset key={f.name} className="flex flex-col gap-2">
              <legend className="mb-2 text-brand-lavanda-chiara">{f.placeholder}</legend>
              <div className="flex flex-wrap gap-2">
                {f.options?.map((o) => (
                  <label
                    key={o.value}
                    className="flex min-h-11 cursor-pointer items-center gap-3 border border-brand-lavanda/40 bg-brand-fondo px-4 text-brand-crema transition-colors has-[:checked]:border-brand-lavanda has-[:checked]:bg-brand-superficie-hover"
                  >
                    <input
                      type="checkbox"
                      name={f.name}
                      value={o.value}
                      defaultChecked={current.includes(o.value)}
                      className="h-5 w-5 accent-[var(--lavanda)]"
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </fieldset>
          );
        }
        if (f.type === "checkbox") {
          return (
            <label
              key={f.name}
              className="flex min-h-11 cursor-pointer items-center justify-between gap-3 border border-brand-lavanda/40 bg-brand-fondo p-3 text-brand-crema"
            >
              <span>{f.placeholder}</span>
              <span className="relative inline-flex shrink-0">
                <input
                  type="checkbox"
                  name={f.name}
                  defaultChecked={row?.[f.name] === true}
                  className="peer sr-only"
                />
                <span className="block h-6 w-11 rounded-full bg-brand-superficie-hover transition-colors peer-checked:bg-brand-lavanda peer-focus-visible:ring-2 peer-focus-visible:ring-brand-crema" />
                <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-brand-crema transition-transform peer-checked:translate-x-5" />
              </span>
            </label>
          );
        }
        if (f.type === "textarea") {
          return (
            <textarea
              key={f.name}
              name={f.name}
              placeholder={f.placeholder}
              required={f.required}
              defaultValue={String(row?.[f.name] ?? "")}
              rows={4}
              className="campo resize-y"
            />
          );
        }
        if (f.type === "image" || f.type === "photo") {
          const photo = f.type === "photo";
          return (
            <ImageField
              key={f.name}
              name={f.name}
              label={f.placeholder}
              bucket={photo ? "content-images" : "sponsor-logos"}
              variant={photo ? "photo" : "logo"}
              current={
                typeof row?.[f.name] === "string"
                  ? (row[f.name] as string)
                  : undefined
              }
            />
          );
        }
        return (
          <input
            key={f.name}
            name={f.name}
            type={f.type ?? "text"}
            placeholder={f.placeholder}
            required={f.required}
            defaultValue={String(row?.[f.name] ?? "")}
            className="campo"
          />
        );
      })}
      {format ? (
        <span
          className={`self-end text-sm tabular-nums ${
            length > DISCORD_MAX ? "text-brand-pesca" : "text-brand-lavanda-chiara"
          }`}
        >
          Discord (italiano + inglese): {length}/{DISCORD_MAX}
          {length > DISCORD_MAX ? " — accorcia il testo per salvare" : ""}
        </span>
      ) : null}
      {/* Azione principale del form: il .btn (senza lampo nell'admin). */}
      <button
        type="submit"
        disabled={pending || length > DISCORD_MAX}
        className="btn lg:self-start"
      >
        {pending ? "Salvataggio…" : row ? "Salva modifiche" : "Aggiungi"}
      </button>
      {state ? (
        <span
          className={`text-sm ${state.ok ? "text-brand-lavanda-chiara" : "text-brand-pesca"}`}
        >
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
