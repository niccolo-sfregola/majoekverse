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
  pericolo = false,
}: {
  action: Action;
  id?: string;
  label: string;
  confirm?: string;
  // Azione distruttiva (es. "Azzera schedule"): testo corallo.
  pericolo?: boolean;
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
        className={`bottone-secondario ${pericolo ? "bottone-pericolo" : ""}`}
      >
        {pending ? "Invio…" : label}
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
