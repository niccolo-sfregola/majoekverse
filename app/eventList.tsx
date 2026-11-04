"use client";

import { useState } from "react";
import { longDay, ddmm } from "@/lib/schedule";
import { useDict, useLang } from "./langProvider";
import Sheet from "./sheet";
import Button from "./button";

const DISCORD_INVITE = "https://discord.com/invite/4FskPTnBts";
const TWITCH_SUB = "https://www.twitch.tv/subs/majoekoto";

type EventRow = {
  id: string | number;
  titolo: string;
  descrizione: string | null;
  data: string | null;
  solo_abbonati: boolean | null;
  immagine: string | null;
};

// Elenco eventi in Home: come le news (tap → card a schermo intero), ma in
// fondo alla card c'è "Partecipa" — o "Abbonati" se l'evento è riservato e
// l'utente non è abbonato. `subscribed` lo calcola il server.
// I riservati agli abbonati sono segnati in corallo (niente lucchetto emoji).
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
      <ul className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setActive(item)}
              className="riga grid grid-cols-[auto_minmax(0,1fr)_auto] gap-x-3"
            >
              <span className="font-bold tabular-nums text-brand-lavanda">
                {item.data ? ddmm(item.data) : ""}
              </span>
              <span className="min-w-0 truncate text-brand-crema">{item.titolo}</span>
              {item.solo_abbonati ? (
                <span className="text-sm font-semibold text-brand-corallo">
                  {t.eventi.subsOnly}
                </span>
              ) : (
                <span />
              )}
            </button>
          </li>
        ))}
      </ul>

      {active ? (
        <Sheet
          key={active.id}
          label={t.eventi.title}
          onClosed={() => setActive(null)}
          action={
            <Button href={locked ? TWITCH_SUB : DISCORD_INVITE}>
              {locked ? t.eventi.subscribe : t.eventi.join}
            </Button>
          }
        >
          {active.immagine ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={active.immagine}
              alt=""
              className="taglio mb-4 max-h-80 w-full object-cover"
            />
          ) : null}
          <p className="flex flex-wrap gap-x-3 font-semibold">
            {active.data ? (
              <span className="text-brand-lavanda">{when(active.data)}</span>
            ) : null}
            {active.solo_abbonati ? (
              <span className="text-brand-corallo">{t.eventi.subsOnly}</span>
            ) : null}
          </p>
          <h2 className="mt-2 text-xl font-bold text-brand-crema">
            {active.titolo}
          </h2>
          <p className="mt-3 whitespace-pre-line text-brand-lavanda-chiara">
            {active.descrizione}
          </p>
        </Sheet>
      ) : null}
    </>
  );
}
