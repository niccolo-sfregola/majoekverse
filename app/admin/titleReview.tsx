"use client";

import { useActionState, useState } from "react";
import { reviewTitle, type MutateState } from "./actions";

// Accetta / Rifiuta una proposta di titolo. Il motivo è facoltativo e
// arriva al vincitore solo in caso di rifiuto.
export function ReviewForm({ id }: { id: number }) {
  const [state, formAction, pending] = useActionState<MutateState, FormData>(
    reviewTitle,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={id} />
      <input
        name="motivo"
        placeholder="Motivo del rifiuto (facoltativo)"
        maxLength={200}
        className="rounded-lg border border-brand-lavanda/25 bg-brand-fondo/60 px-3 py-2 text-sm text-brand-crema placeholder:text-brand-lavanda/50 focus:border-brand-lavanda/60 focus:outline-none"
      />
      <div className="flex flex-wrap items-center gap-2">
        {/* Due bottoni nello stesso form: il valore di quello premuto
            arriva alla server action come "decisione". */}
        <button
          type="submit"
          name="decisione"
          value="accepted"
          disabled={pending}
          className="rounded-lg bg-brand-blu px-3 py-1.5 text-sm font-semibold text-brand-crema transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
        >
          Accetta
        </button>
        <button
          type="submit"
          name="decisione"
          value="rejected"
          disabled={pending}
          className="rounded-lg border border-brand-corallo/50 px-3 py-1.5 text-sm font-semibold text-brand-corallo transition hover:bg-brand-corallo/10 active:scale-[0.98] disabled:opacity-50"
        >
          Rifiuta
        </button>
        {state ? (
          <span
            className={`text-sm ${state.ok ? "text-brand-lavanda" : "text-brand-corallo"}`}
          >
            {state.message}
          </span>
        ) : null}
      </div>
    </form>
  );
}

// Copia il titolo accettato, da incollare su Twitch.
export function CopyTitle({ titolo }: { titolo: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(titolo);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {}
      }}
      className="shrink-0 rounded-lg border border-brand-lavanda/30 px-2.5 py-1 text-xs font-semibold text-brand-lavanda transition hover:bg-brand-lavanda/10 active:scale-[0.98]"
    >
      {copied ? "Copiato ✓" : "Copia"}
    </button>
  );
}
