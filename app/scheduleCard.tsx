"use client";

import { useEffect, useState } from "react";
import { shortDayIt, longDayIt, ddmm, timeIt } from "@/lib/schedule";

type ScheduleRow = {
  id: string | number;
  data: string;
  gioco: string | null;
  orario: string;
};

const LABEL =
  "text-xs font-semibold uppercase tracking-[0.18em] text-brand-lavanda";

function CloseIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export default function ScheduleCard({ items }: { items: ScheduleRow[] }) {
  const [open, setOpen] = useState(false);

  // Su mobile la schedule si apre a schermo intero: blocco lo scroll dietro
  // e chiudo con Esc. Su desktop resta l'espansione in linea.
  useEffect(() => {
    if (!open) return;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    if (isMobile) document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

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
    <>
      <div className="card-glass flex w-full flex-col gap-2 p-4 md:p-5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full flex-col gap-2 text-left"
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
        </button>

        {/* Desktop: espansione in linea, con "Chiudi" in fondo. */}
        <div className="hidden md:block">
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
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-lavanda transition-colors hover:text-brand-crema"
              >
                <CloseIcon size={14} />
                Chiudi
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: schermata intera, titoli dei giochi per esteso. */}
      {open ? (
        <div className="page-enter fixed inset-0 z-50 flex flex-col bg-brand-fondo/95 backdrop-blur-md md:hidden">
          <div
            className="flex items-center justify-between gap-3 px-5 py-4"
            style={{ paddingTop: "calc(env(safe-area-inset-top) + 1rem)" }}
          >
            <span className={LABEL}>Schedule della settimana</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Chiudi"
              className="-mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-fondo/60 text-brand-crema transition-transform active:scale-90"
            >
              <CloseIcon size={22} />
            </button>
          </div>

          <ul className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 pb-4">
            {items.map((item) => (
              <li
                key={item.id}
                className="border-b border-brand-lavanda/10 pb-3 last:border-0"
              >
                <p className="text-xs uppercase tracking-[0.12em] text-brand-lavanda">
                  {longDayIt(item.data)} {ddmm(item.data)} ·{" "}
                  {timeIt(item.orario)}
                </p>
                <p className="mt-0.5 text-base font-semibold text-brand-crema">
                  {item.gioco || "Gioco da definire"}
                </p>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mx-5 rounded-xl bg-brand-blu py-3 text-center font-semibold text-brand-crema transition active:scale-[0.98]"
            style={{ marginBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
          >
            Chiudi
          </button>
        </div>
      ) : null}
    </>
  );
}
