"use client";

import { useState, type ReactNode } from "react";
import Pannello from "@/app/pannello";

// Pannello che si apre e si chiude: chiuso mostra titolo + sottotitolo,
// aperto rivela le azioni possibili. Usato per ogni sezione dell'area admin.
// interno: dentro un'altra sezione (es. "Aggiungi…") niente bordo, solo un
// fondo più scuro, così non ci sono riquadri dentro riquadri.
export default function Collapsible({
  title,
  subtitle,
  defaultOpen = false,
  interno = false,
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  interno?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const contenuto = (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex min-h-11 w-full items-center gap-3 text-left ${interno ? "p-3" : "p-4 md:p-5"}`}
      >
        <span className="min-w-0 flex-1">
          <span className={`block font-bold text-brand-crema ${interno ? "" : "text-lg"}`}>
            {title}
          </span>
          {subtitle ? (
            <span className="block text-sm text-brand-lavanda-chiara">{subtitle}</span>
          ) : null}
        </span>
        <svg
          aria-hidden
          width="18"
          height="18"
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
          <div className={`flex flex-col gap-4 ${interno ? "p-3 pt-0" : "p-4 pt-0 md:p-5 md:pt-0"}`}>
            {children}
          </div>
        </div>
      </div>
    </>
  );

  return interno ? <div className="bg-brand-fondo">{contenuto}</div> : <Pannello>{contenuto}</Pannello>;
}
