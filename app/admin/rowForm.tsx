"use client";

import { useActionState } from "react";
import { saveRow, type MutateState } from "./actions";

export type Field = {
  name: string;
  placeholder: string;
  type?: string;
  required?: boolean;
};

const inputClass = "rounded-lg p-2 w-full";
const inputStyle = { backgroundColor: "#11102e", color: "#F6ECD8" };

// Form usato sia per aggiungere (nessun id) sia per modificare (con id).
// Mostra l'esito del salvataggio sotto al bottone.
export default function RowForm({
  table,
  fields,
  row,
}: {
  table: string;
  fields: Field[];
  row?: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState<MutateState, FormData>(
    saveRow,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
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
        disabled={pending}
        className="rounded-lg p-2 bg-brand-blu disabled:opacity-50"
        style={{ color: "#F6ECD8" }}
      >
        {pending ? "Salvataggio…" : row ? "Salva modifiche" : "Aggiungi"}
      </button>
      {state ? (
        <span
          className="text-sm"
          style={{ color: state.ok ? "#B9A8E6" : "#EF6C4E" }}
        >
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
