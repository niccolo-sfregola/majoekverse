"use client";

import { useActionState, useState } from "react";
import type { TitleState } from "@/lib/games";
import { longDay, ddmm } from "@/lib/schedule";
import { useDict, useLang } from "@/app/langProvider";
import { proposeTitle, type ProposeState } from "./actions";
import Pannello from "@/app/pannello";
import Button from "@/app/button";

// Stato di ogni proposta: solo colore del testo, niente etichette a pillola.
const STATO_COLORE: Record<string, string> = {
  pending: "text-brand-lavanda",
  accepted: "text-brand-pesca",
  rejected: "text-brand-lavanda-chiara/70",
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
    <Pannello className="flex flex-col gap-3 p-[18px] lg:p-[26px]">
      <h2 className="titolo-sezione">{tt.heading}</h2>
      <p className="text-brand-lavanda-chiara">{status}</p>

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
            className="w-full resize-none border border-brand-lavanda/40 bg-brand-fondo p-3 text-brand-crema placeholder:text-brand-lavanda-chiara/60 focus:border-brand-lavanda focus:outline-none"
          />
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <span className="text-sm tabular-nums text-brand-lavanda-chiara">
              {titolo.length}/140
            </span>
            <Button type="submit" disabled={pending || titolo.trim().length === 0}>
              {pending ? tt.sending : tt.send}
            </Button>
          </div>
        </form>
      ) : null}

      {result ? (
        <p
          className={result.ok ? "text-brand-lavanda-chiara" : "text-brand-pesca"}
        >
          {result.ok ? tt.sent : (errors[result.message] ?? tt.errorServer)}
        </p>
      ) : null}

      {state.proposte.length > 0 ? (
        <ul className="flex flex-col gap-1.5 pt-1">
          {state.proposte.map((p) => (
            <li key={p.id} className="flex flex-col gap-1 bg-brand-fondo p-3">
              <div className="flex items-start justify-between gap-3">
                <span className="text-brand-crema">“{p.titolo}”</span>
                <span className={`shrink-0 text-sm font-bold ${STATO_COLORE[p.stato]}`}>
                  {tt.stati[p.stato]}
                </span>
              </div>
              {p.motivo ? (
                <span className="text-sm text-brand-lavanda-chiara">
                  {tt.reason}: {p.motivo}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </Pannello>
  );
}
