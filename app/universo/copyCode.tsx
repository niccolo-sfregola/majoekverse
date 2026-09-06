"use client";

import { useState } from "react";

export default function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

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
      className="inline-flex items-center gap-2 rounded-lg border border-brand-crema/20 bg-brand-fondo/50 px-3 py-1.5 font-mono text-sm font-semibold text-brand-crema transition hover:border-brand-crema/40 active:scale-[0.98]"
    >
      {code}
      <span className="font-sans text-xs font-normal text-brand-lavanda">
        {copied ? "copiato!" : "copia"}
      </span>
    </button>
  );
}
