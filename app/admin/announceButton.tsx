"use client";

import { useActionState } from "react";
import type { AnnounceState } from "./actions";

type Action = (prev: AnnounceState, formData: FormData) => Promise<AnnounceState>;

// Bottone che chiama una Server Action e mostra l'esito accanto a sé.
// useActionState tiene lo stato restituito dall'azione e il flag "pending".
export default function AnnounceButton({
  action,
  id,
  label,
  confirm: confirmText,
}: {
  action: Action;
  id?: string;
  label: string;
  confirm?: string;
}) {
  const [state, formAction, pending] = useActionState<AnnounceState, FormData>(
    action,
    null,
  );

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (confirmText && !window.confirm(confirmText)) e.preventDefault();
      }}
      className="flex items-center gap-2 flex-wrap"
    >
      {id ? <input type="hidden" name="id" value={id} /> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-blu px-3 py-1.5 text-sm font-semibold text-brand-crema transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
      >
        {pending ? "Invio…" : label}
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
