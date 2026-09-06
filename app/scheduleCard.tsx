"use client";

import { useState } from "react";
import { shortDayIt, timeIt } from "@/lib/schedule";

type ScheduleRow = {
  id: string | number;
  data: string;
  gioco: string | null;
  orario: string;
};

const LABEL = "text-xs font-semibold uppercase tracking-[0.18em] text-brand-lavanda";

export default function ScheduleCard({ items }: { items: ScheduleRow[] }) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) {
    return (
      <div className="card-glass flex flex-col gap-2 p-4 md:p-5">
        <p className={LABEL}>Schedule</p>
        <p className="text-brand-lavanda">Stiamo per caricare la schedule…</p>
      </div>
    );
  }

  const next = items[0];

  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      aria-expanded={open}
      className="card-glass flex w-full flex-col gap-2 p-4 text-left md:p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <span className={LABEL}>Schedule</span>
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
      </div>

      <p className="text-brand-crema">
        <span className="text-brand-lavanda">Prossima · </span>
        {shortDayIt(next.data)} {timeIt(next.orario)}
      </p>

      <div className="reveal" data-open={open}>
        <div>
          <ul className="flex flex-col gap-1 pt-1">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-baseline gap-3 text-brand-crema"
              >
                <span className="shrink-0">{shortDayIt(item.data)}</span>
                <span className="min-w-0 flex-1 truncate text-brand-lavanda">
                  {item.gioco}
                </span>
                <span className="shrink-0">{timeIt(item.orario)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </button>
  );
}
