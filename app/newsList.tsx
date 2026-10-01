"use client";

import { useState } from "react";
import { useDict } from "./langProvider";
import Sheet from "./sheet";

type NewsRow = {
  id: string | number;
  icona: string | null;
  titolo: string;
  testo: string;
};

// Elenco news: solo il titolo, tap per aprire una card a schermo intero con
// il testo completo.
export default function NewsList({ items }: { items: NewsRow[] }) {
  const [active, setActive] = useState<NewsRow | null>(null);
  const t = useDict();

  if (!items || items.length === 0) {
    return <p className="text-brand-lavanda">{t.news.empty}</p>;
  }

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
              <span className="shrink-0 text-xl leading-none">
                {item.icona}
              </span>
              <span className="min-w-0 flex-1 truncate text-brand-crema">
                {item.titolo}
              </span>
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
          label={t.news.title}
          icon={active.icona}
          onClosed={() => setActive(null)}
        >
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
