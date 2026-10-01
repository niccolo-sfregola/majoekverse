"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useDict } from "./langProvider";

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

// Card a schermo intero (news, eventi), portata sul <body> per uscire dallo
// stacking context della griglia. Chi la usa la monta solo quando c'è
// qualcosa da mostrare; l'animazione di chiusura la gestisce lei, e a fine
// animazione chiama onClosed così il genitore può smontarla.
// `action` = bottone in fondo; se manca c'è un semplice "Chiudi".
export default function Sheet({
  label,
  icon,
  onClosed,
  action,
  children,
}: {
  label: string;
  icon?: string | null;
  onClosed: () => void;
  action?: ReactNode;
  children: ReactNode;
}) {
  const [closing, setClosing] = useState(false);
  const t = useDict();

  // Avvia solo l'animazione di uscita: lo smontaggio vero avviene
  // sull'evento animationend più sotto, non qui.
  function close() {
    setClosing(true);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setClosing(true);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[70] flex flex-col bg-brand-fondo/95 backdrop-blur-md ${
        closing ? "overlay-fade-out" : "overlay-fade-in"
      }`}
      onAnimationEnd={(e) => {
        // Solo l'animazione del fondo (non quella, più corta, del
        // testo dentro) segna la fine della chiusura.
        if (closing && e.target === e.currentTarget) onClosed();
      }}
    >
      <div
        className="flex items-center justify-between gap-3 px-5 py-4"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 1rem)" }}
      >
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-lavanda">
          {icon ? <span className="text-base leading-none">{icon}</span> : null}
          {label}
        </span>
        <button
          type="button"
          onClick={close}
          aria-label={t.common.close}
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
        {children}
      </div>

      <div
        className="mx-5 flex flex-col"
        style={{ marginBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
      >
        {action ?? (
          <button
            type="button"
            onClick={close}
            className="rounded-xl bg-brand-blu py-3 text-center font-semibold text-brand-crema transition active:scale-[0.98]"
          >
            {t.common.close}
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}
