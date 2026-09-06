"use client";

import { useState, type ReactNode } from "react";

// Pannello che si apre e si chiude: chiuso mostra titolo + sottotitolo,
// aperto rivela le azioni possibili. Usato per ogni sezione dell'area admin.
export default function Collapsible({
  title,
  subtitle,
  icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="panel">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-4 text-left md:p-5"
      >
        {icon ? <span className="text-xl leading-none">{icon}</span> : null}
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-brand-crema">{title}</span>
          {subtitle ? (
            <span className="block text-xs text-brand-lavanda">{subtitle}</span>
          ) : null}
        </span>
        <svg
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
          <div className="flex flex-col gap-4 border-t border-brand-lavanda/10 p-4 md:p-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
