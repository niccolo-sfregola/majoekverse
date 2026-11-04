"use client";

import { useState } from "react";
import { useDict } from "@/app/langProvider";

// Codice sconto: un tocco lo copia negli appunti.
export default function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const t = useDict();

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {}
      }}
      className="taglio-piccolo inline-flex min-h-11 items-center gap-3 bg-brand-fondo px-4 font-mono font-bold text-brand-crema transition-transform active:scale-[0.97]"
    >
      {code}
      <span className="font-sans text-sm font-semibold text-brand-lavanda" aria-live="polite">
        {copied ? t.universo.copied : t.universo.copy}
      </span>
    </button>
  );
}
