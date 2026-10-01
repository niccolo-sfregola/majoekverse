"use client";

import { useActionState } from "react";
import { deleteAccount } from "@/app/auth/actions";
import { useDict } from "@/app/langProvider";

// "Elimina account": chiede conferma, poi cancella l'account e tutti i dati
// collegati (vedi deleteAccount). Se va a buon fine si torna alla Home.
export default function DeleteAccountButton({
  className,
}: {
  className?: string;
}) {
  const t = useDict();
  const [state, formAction, pending] = useActionState(
    async () => (await deleteAccount().catch(() => ({ error: true as const }))) ?? null,
    null,
  );

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm(t.profilo.deleteConfirm)) e.preventDefault();
      }}
      className={className}
    >
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl border border-brand-lavanda/25 py-3 font-semibold text-brand-lavanda transition hover:bg-brand-lavanda/10 active:scale-[0.98] disabled:opacity-60 md:px-6"
      >
        {pending ? t.profilo.deleting : t.profilo.deleteAccount}
      </button>
      {state?.error ? (
        <p className="mt-2 text-center text-sm text-brand-corallo">
          {t.profilo.deleteError}
        </p>
      ) : null}
    </form>
  );
}
