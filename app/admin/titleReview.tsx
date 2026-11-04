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
        className="campo"
      />
      <div className="flex flex-wrap items-center gap-3">
        {/* Due bottoni nello stesso form: il valore di quello premuto
            arriva alla server action come "decisione". */}
        <button
          type="submit"
          name="decisione"
          value="accepted"
          disabled={pending}
          className="btn w-auto"
        >
          Accetta
        </button>
        <button
          type="submit"
          name="decisione"
          value="rejected"
          disabled={pending}
          className="bottone-secondario bottone-pericolo"
        >
          Rifiuta
        </button>
        {state ? (
          <span
            className={`text-sm ${state.ok ? "text-brand-lavanda-chiara" : "text-brand-pesca"}`}
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
      className="bottone-secondario shrink-0"
    >
      {copied ? "Copiato" : "Copia"}
    </button>
  );
}
