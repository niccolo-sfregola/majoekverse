"use client";

import { useActionState, useState } from "react";
import type { TitleState } from "@/lib/games";
import { longDay, ddmm } from "@/lib/schedule";
import { useDict, useLang } from "@/app/langProvider";
import { proposeTitle, type ProposeState } from "./actions";

const CHIP: Record<string, string> = {
  pending: "bg-brand-lavanda/20 text-brand-lavanda",
  accepted: "bg-brand-corallo text-brand-crema",
  rejected: "bg-brand-darkblu text-brand-lavanda/70",
};

// Premio del vincitore della settimana scorsa: propone il titolo di una live,
// Joe (o un admin) accetta o rifiuta da /admin. Lo stato arriva dal server.
export default function TitleBox({
  state,
}: {
  state: Extract<TitleState, { kind: "winner" }>;
}) {
  const t = useDict();
  const lang = useLang();
  const tt = t.titolo;
  const [titolo, setTitolo] = useState("");
  const [result, formAction, pending] = useActionState<ProposeState, FormData>(
    async (prev, formData) => {
      const res = await proposeTitle(prev, formData).catch(() => null);
      if (res?.ok) setTitolo("");
      return res ?? { ok: false, message: "server" };
    },
    null,
  );

  const errors: Record<string, string> = {
    length: tt.errorLength,
    notAllowed: tt.errorNotAllowed,
    login: tt.errorServer,
    server: tt.errorServer,
  };

  const status = {
    propose: state.scadenza
      ? tt.canPropose(
          state.rimaste,
          `${longDay(state.scadenza, lang).toLowerCase()} ${ddmm(state.scadenza)}`,
        )
      : "",
    pending: tt.pending,
    accepted: tt.accepted,
    exhausted: tt.exhausted,
    expired: tt.expired,
  }[state.azione];

  return (
    <section className="card-glass flex flex-col gap-3 p-5">
      <h2 className="text-lg font-semibold text-brand-crema">🏆 {tt.heading}</h2>
      <p className="text-sm text-brand-lavanda">{status}</p>

      {state.azione === "propose" ? (
        <form action={formAction} className="flex flex-col gap-2">
          <textarea
            name="titolo"
            value={titolo}
            onChange={(e) => setTitolo(e.target.value)}
            maxLength={140}
            rows={2}
            required
            placeholder={tt.placeholder}
            className="w-full resize-none rounded-xl border border-brand-lavanda/25 bg-brand-fondo/60 p-3 text-brand-crema placeholder:text-brand-lavanda/50 focus:border-brand-lavanda/60 focus:outline-none"
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs tabular-nums text-brand-lavanda">
              {titolo.length}/140
            </span>
            <button
              type="submit"
              disabled={pending || titolo.trim().length === 0}
              className="rounded-xl bg-brand-corallo px-5 py-2 font-semibold text-brand-crema transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
            >
              {pending ? tt.sending : tt.send}
            </button>
          </div>
        </form>
      ) : null}

      {result ? (
        <p
          className={`text-sm ${result.ok ? "text-brand-lavanda" : "text-brand-corallo"}`}
        >
          {result.ok ? tt.sent : (errors[result.message] ?? tt.errorServer)}
        </p>
      ) : null}

      {state.proposte.length > 0 ? (
        <ul className="flex flex-col gap-2 border-t border-brand-lavanda/10 pt-3">
          {state.proposte.map((p) => (
            <li key={p.id} className="flex flex-col gap-1">
              <div className="flex items-start justify-between gap-3">
                <span className="text-brand-crema">“{p.titolo}”</span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide ${CHIP[p.stato]}`}
                >
                  {tt.stati[p.stato]}
                </span>
              </div>
              {p.motivo ? (
                <span className="text-xs text-brand-lavanda">
                  {tt.reason}: {p.motivo}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
