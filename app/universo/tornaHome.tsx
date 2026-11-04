"use client";

import { useDict } from "../langProvider";
import { useTransizione } from "../transizione";

// "Torna alla Home": niente strisce, il pianeta fa il percorso inverso del
// tuffo (vedi torna() in app/transizione.tsx).
export default function TornaHome() {
  const t = useDict();
  const { torna } = useTransizione();
  return (
    <button
      type="button"
      onClick={torna}
      className="flex min-h-11 items-center gap-1.5 self-start font-semibold text-brand-lavanda transition-colors hover:text-brand-crema"
    >
      <svg
        aria-hidden
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 5l-7 7 7 7" />
      </svg>
      {t.universo.backHome}
    </button>
  );
}
