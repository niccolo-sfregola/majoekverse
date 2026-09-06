"use client";

import { useActionState, useEffect, useRef } from "react";
import { saveRow, type MutateState } from "./actions";

export type Field = {
  name: string;
  placeholder: string;
  type?: string; // "text" (default), "date", "time", "url", "checkbox"
  required?: boolean;
};

const inputClass =
  "w-full rounded-lg border border-brand-lavanda/15 bg-brand-fondo/70 p-2 text-brand-crema outline-none transition placeholder:text-brand-lavanda/50 focus:border-brand-lavanda/40";

// Form usato sia per aggiungere (nessun id) sia per modificare (con id).
// Mostra l'esito del salvataggio sotto al bottone.
export default function RowForm({
  table,
  fields,
  row,
}: {
  table: string;
  fields: Field[];
  row?: Record<string, unknown>;
}) {
  const [state, formAction, pending] = useActionState<MutateState, FormData>(
    saveRow,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Dopo un inserimento riuscito, svuota i campi (solo nel form "aggiungi",
  // non in quello di modifica: lì i valori salvati vanno tenuti).
  const isNew = !row;
  useEffect(() => {
    if (isNew && state?.ok) {
      formRef.current?.reset();
    }
  }, [state, isNew]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="table" value={table} />
      {row ? <input type="hidden" name="id" value={String(row.id)} /> : null}
      {fields.map((f) =>
        f.type === "checkbox" ? (
          <label
            key={f.name}
            className="flex items-center gap-2 text-sm text-brand-crema"
          >
            <input
              type="checkbox"
              name={f.name}
              defaultChecked={row?.[f.name] === true}
              className="h-4 w-4 accent-brand-blu"
            />
            {f.placeholder}
          </label>
        ) : (
          <input
            key={f.name}
            name={f.name}
            type={f.type ?? "text"}
            placeholder={f.placeholder}
            required={f.required}
            defaultValue={String(row?.[f.name] ?? "")}
            className={inputClass}
          />
        ),
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-blu p-2 font-semibold text-brand-crema transition hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
      >
        {pending ? "Salvataggio…" : row ? "Salva modifiche" : "Aggiungi"}
      </button>
      {state ? (
        <span
          className={`text-sm ${state.ok ? "text-brand-lavanda" : "text-brand-corallo"}`}
        >
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
