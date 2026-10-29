"use client";

import { useState } from "react";
import { useDict } from "./langProvider";
import Sheet from "./sheet";

type NewsRow = {
  id: string | number;
  icona: string | null;
  titolo: string;
  testo: string;
  immagine: string | null;
};

// Quante news si vedono prima di "Mostra tutte".
const VISIBILI = 3;

// Elenco news: solo il titolo, tap per aprire una card a schermo intero con
// il testo completo. Si vedono le ultime 3, le altre si aprono col tasto.
export default function NewsList({ items }: { items: NewsRow[] }) {
  const [active, setActive] = useState<NewsRow | null>(null);
  const [espanso, setEspanso] = useState(false);
  const t = useDict();

  if (!items || items.length === 0) {
    return <p className="text-brand-lavanda">{t.news.empty}</p>;
  }

  const altre = items.slice(VISIBILI);

  const riga = (item: NewsRow) => (
    <li key={item.id}>
      <button
        type="button"
        onClick={() => setActive(item)}
        className="flex w-full items-center gap-3 py-2.5 text-left"
      >
        <span className="shrink-0 text-xl leading-none">{item.icona}</span>
        <span className="min-w-0 flex-1 truncate text-brand-crema">
          {item.titolo}
        </span>
        <span aria-hidden className="shrink-0 text-brand-lavanda">
          →
        </span>
      </button>
    </li>
  );

  return (
    <>
      {/* Lista e parte espandibile nello stesso div: da chiusa, la parte
          nascosta non deve prendersi lo spazio (gap) della card. */}
      <div>
        <ul className="flex flex-col divide-y divide-brand-lavanda/10">
          {items.slice(0, VISIBILI).map(riga)}
        </ul>

        {altre.length > 0 ? (
          /* Animazione dell'altezza: una griglia con una riga che passa da
              0fr (alta zero) a 1fr (alta quanto il contenuto). Con height
              non si può, perché "auto" non si anima. inert: da chiusa, le
              news nascoste non si raggiungono neanche col tasto Tab. */
          <div
            id="news-altre"
            inert={!espanso}
            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${
              espanso
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <ul className="flex min-h-0 flex-col divide-y divide-brand-lavanda/10 overflow-hidden border-t border-brand-lavanda/10">
              {altre.map(riga)}
            </ul>
          </div>
        ) : null}
      </div>

      {altre.length > 0 ? (
        <button
          type="button"
          onClick={() => setEspanso((e) => !e)}
          aria-expanded={espanso}
          aria-controls="news-altre"
          className="self-start text-sm text-brand-lavanda transition hover:text-brand-crema"
        >
          {espanso ? t.news.showLess : t.news.showAll(items.length)}
        </button>
      ) : null}

      {active ? (
        <Sheet
          key={active.id}
          label={t.news.title}
          icon={active.icona}
          onClosed={() => setActive(null)}
        >
          {active.immagine ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={active.immagine}
              alt=""
              className="mb-4 max-h-80 w-full rounded-xl object-cover"
            />
          ) : null}
          <h2 className="text-xl font-semibold text-brand-crema">
            {active.titolo}
          </h2>
          <p className="mt-3 whitespace-pre-line text-brand-lavanda">
            {active.testo}
          </p>
        </Sheet>
      ) : null}
    </>
  );
}
