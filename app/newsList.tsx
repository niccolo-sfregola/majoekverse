"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type NewsRow = {
  id: string | number;
  icona: string | null;
  titolo: string;
  testo: string;
};

function CloseIcon({ size = 22 }: { size?: number }) {
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

// Elenco news: solo il titolo, tap per aprire una card a schermo intero con
// il testo completo (portata sul <body> per uscire dallo stacking context
// della griglia, come la schedule mobile).
export default function NewsList({ items }: { items: NewsRow[] }) {
  const [active, setActive] = useState<NewsRow | null>(null);
  const [closing, setClosing] = useState(false);

  function open(item: NewsRow) {
    setActive(item);
    setClosing(false);
  }

  // Avvia solo l'animazione di uscita: lo smontaggio vero avviene
  // sull'evento animationend più sotto, non qui.
  function close() {
    setClosing(true);
  }

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active]);

  if (!items || items.length === 0) {
    return <p className="text-brand-lavanda">Nessuna news al momento.</p>;
  }

  return (
    <>
      <ul className="flex flex-col divide-y divide-brand-lavanda/10">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => open(item)}
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

      {active && typeof document !== "undefined"
        ? createPortal(
            <div
              className={`fixed inset-0 z-[70] flex flex-col bg-brand-fondo/95 backdrop-blur-md ${
                closing ? "overlay-fade-out" : "overlay-fade-in"
              }`}
              onAnimationEnd={(e) => {
                // Solo l'animazione del fondo (non quella, più corta, del
                // testo dentro) segna la fine della chiusura.
                if (closing && e.target === e.currentTarget) setActive(null);
              }}
            >
              <div
                className="flex items-center justify-between gap-3 px-5 py-4"
                style={{ paddingTop: "calc(env(safe-area-inset-top) + 1rem)" }}
              >
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-lavanda">
                  {active.icona ? (
                    <span className="text-base leading-none">
                      {active.icona}
                    </span>
                  ) : null}
                  News
                </span>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Chiudi"
                  className="-mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-fondo/60 text-brand-crema transition-transform active:scale-90"
                >
                  <CloseIcon />
                </button>
              </div>

              <div
                className={`flex-1 overflow-y-auto px-5 pb-4 ${
                  closing ? "sheet-out" : "sheet-in"
                }`}
              >
                <h2 className="text-xl font-semibold text-brand-crema">
                  {active.titolo}
                </h2>
                <p className="mt-3 whitespace-pre-line text-brand-lavanda">
                  {active.testo}
                </p>
              </div>

              <button
                type="button"
                onClick={close}
                className="mx-5 rounded-xl bg-brand-blu py-3 text-center font-semibold text-brand-crema transition active:scale-[0.98]"
                style={{
                  marginBottom: "calc(env(safe-area-inset-bottom) + 1rem)",
                }}
              >
                Chiudi
              </button>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
