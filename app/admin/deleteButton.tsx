"use client";

import { useActionState } from "react";
import { deleteRow, type MutateState } from "./actions";

// Bottone "Elimina" con conferma. Se va storto mostra l'errore;
// se va bene la riga sparisce (la pagina si ricarica) e non serve messaggio.
export default function DeleteButton({
  table,
  id,
  label,
}: {
  table: string;
  id: string;
  label: string;
}) {
  const [state, formAction, pending] = useActionState<MutateState, FormData>(
    deleteRow,
    null,
  );

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm(`Eliminare "${label}"?`)) e.preventDefault();
      }}
      className="flex items-center gap-2 flex-wrap"
    >
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg px-2 py-1 text-sm bg-brand-corallo disabled:opacity-50"
        style={{ color: "#F6ECD8" }}
      >
        {pending ? "…" : "Elimina"}
      </button>
      {state && !state.ok ? (
        <span className="text-sm" style={{ color: "#EF6C4E" }}>
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
