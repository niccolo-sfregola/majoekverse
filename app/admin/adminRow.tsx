"use client";

import { useState, type ReactNode } from "react";

// Riga espandibile dell'area admin: stesso aspetto di prima (details.row),
// ma apertura morbida con .reveal invece dello scatto nativo di <details>.
export default function AdminRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <li className="overflow-hidden rounded-xl bg-brand-fondo/45">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 p-3 text-left"
      >
        <span className="min-w-0 truncate text-sm text-brand-crema">
          {label}
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
          <div className="flex flex-col gap-3 border-t border-brand-lavanda/10 p-3">
            {children}
          </div>
        </div>
      </div>
    </li>
  );
}
