"use client";

import { useState } from "react";

type NewsRow = {
  id: string | number;
  icona: string | null;
  titolo: string;
  testo: string;
};

// Elenco news: solo il titolo, tap per aprire e leggere il testo intero.
// Più news possono restare aperte insieme, sono indipendenti tra loro.
export default function NewsList({ items }: { items: NewsRow[] }) {
  const [openIds, setOpenIds] = useState<Set<string | number>>(new Set());

  function toggle(id: string | number) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (!items || items.length === 0) {
    return <p className="text-brand-lavanda">Nessuna news al momento.</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-brand-lavanda/10">
      {items.map((item) => {
        const open = openIds.has(item.id);
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-expanded={open}
              className="flex w-full items-center gap-3 py-2.5 text-left"
            >
              <span className="shrink-0 text-xl leading-none">
                {item.icona}
              </span>
              <span className="min-w-0 flex-1 truncate text-brand-crema">
                {item.titolo}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`shrink-0 text-brand-lavanda transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <div className="reveal" data-open={open}>
              <div>
                <p className="whitespace-pre-line pb-3 pl-9 pr-2 text-brand-lavanda">
                  {item.testo}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
