"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteRow,
  previewScheduleChanges,
  announceScheduleChanges,
  type MutateState,
} from "./actions";
import { changeLine } from "@/lib/schedule-diff";

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
  const router = useRouter();
  const [discordMsg, setDiscordMsg] = useState<string | null>(null);

  // Dopo aver eliminato una riga della schedule, se cambia qualcosa rispetto
  // all'ultima pubblicazione su Discord chiedo subito se annunciarlo.
  useEffect(() => {
    if (table !== "schedule" || !state?.ok) return;
    let cancelled = false;
    (async () => {
      const changes = await previewScheduleChanges();
      if (cancelled || changes.length === 0) return;

      const dettagli = changes.map(changeLine).join("\n");
      const conferma = window.confirm(
        `📢 Annuncio: cambio schedule\n\n${dettagli}\n\nPubblicare questo annuncio su Discord?`,
      );
      if (!conferma) return;

      const esito = await announceScheduleChanges(null, new FormData());
      if (!cancelled) {
        setDiscordMsg(esito?.message ?? null);
        router.refresh();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [state, table, router]);

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
      {discordMsg ? (
        <span className="text-sm text-brand-lavanda">{discordMsg}</span>
      ) : null}
    </form>
  );
}
