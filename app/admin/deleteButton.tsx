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
        className="rounded-lg border border-brand-corallo/50 px-3 py-1.5 text-sm font-semibold text-brand-corallo transition hover:bg-brand-corallo/10 active:scale-[0.98] disabled:opacity-50"
      >
        {pending ? "…" : "Elimina"}
      </button>
      {state && !state.ok ? (
        <span className="text-sm text-brand-corallo">{state.message}</span>
      ) : null}
    </form>
  );
}
