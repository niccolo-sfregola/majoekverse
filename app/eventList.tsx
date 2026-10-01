"use client";

import { useState } from "react";
import { longDay, ddmm } from "@/lib/schedule";
import { useDict, useLang } from "./langProvider";
import Sheet from "./sheet";

const DISCORD_INVITE = "https://discord.com/invite/4FskPTnBts";
const TWITCH_SUB = "https://www.twitch.tv/subs/majoekoto";

type EventRow = {
  id: string | number;
  titolo: string;
  descrizione: string | null;
  data: string | null;
  solo_abbonati: boolean | null;
};

// Elenco eventi in Home: come le news (tap → card a schermo intero), ma in
// fondo alla card c'è "Partecipa" — o "Abbonati" se l'evento è riservato e
// l'utente non è abbonato. `subscribed` lo calcola il server.
export default function EventList({
  items,
  subscribed,
}: {
  items: EventRow[];
  subscribed: boolean;
}) {
  const [active, setActive] = useState<EventRow | null>(null);
  const t = useDict();
  const lang = useLang();

  const when = (data: string) => `${longDay(data, lang)} ${ddmm(data)}`;
  const locked = active?.solo_abbonati && !subscribed;

  return (
    <>
      <ul className="flex flex-col divide-y divide-brand-lavanda/10">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setActive(item)}
              className="flex w-full items-center gap-3 py-2.5 text-left"
            >
              {item.data ? (
                <span className="shrink-0 rounded-lg bg-brand-blu/40 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-crema">
                  {ddmm(item.data)}
                </span>
              ) : null}
              <span className="min-w-0 flex-1 truncate text-brand-crema">
                {item.titolo}
              </span>
              {item.solo_abbonati ? (
                <span aria-label={t.eventi.subsOnly} className="shrink-0">
                  🔒
                </span>
              ) : null}
              <span aria-hidden className="shrink-0 text-brand-lavanda">
                →
              </span>
            </button>
          </li>
        ))}
      </ul>

      {active ? (
        <Sheet
          key={active.id}
          label={t.eventi.title}
          icon="📅"
          onClosed={() => setActive(null)}
          action={
            locked ? (
              <a
                href={TWITCH_SUB}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-brand-corallo/50 py-3 text-center font-semibold text-brand-corallo transition active:scale-[0.98]"
              >
                {t.eventi.subscribe}
              </a>
            ) : (
              <a
                href={DISCORD_INVITE}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-brand-blu py-3 text-center font-semibold text-brand-crema transition active:scale-[0.98]"
              >
                {t.eventi.join}
              </a>
            )
          }
        >
          <div className="flex flex-wrap items-center gap-2">
            {active.data ? (
              <span className="inline-flex items-center rounded-lg bg-brand-blu/40 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-brand-crema">
                {when(active.data)}
              </span>
            ) : null}
            {active.solo_abbonati ? (
              <span className="inline-flex items-center gap-1 rounded-lg bg-brand-corallo/20 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-brand-corallo">
                {t.eventi.subsOnly}
              </span>
            ) : null}
          </div>
          <h2 className="mt-3 text-xl font-semibold text-brand-crema">
            {active.titolo}
          </h2>
          <p className="mt-3 whitespace-pre-line text-brand-lavanda">
            {active.descrizione}
          </p>
        </Sheet>
      ) : null}
    </>
  );
}
