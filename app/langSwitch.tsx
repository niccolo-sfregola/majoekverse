"use client";

import { useOptimistic, useTransition } from "react";
import { LANGS } from "@/lib/i18n/dictionaries";
import { setLang } from "./langActions";
import { useDict, useLang } from "./langProvider";

// Interruttore IT / EN. useOptimistic sposta subito la "pastiglia" sulla
// lingua cliccata, senza aspettare che il server rimandi la pagina tradotta.
export default function LangSwitch({ className = "" }: { className?: string }) {
  const lang = useLang();
  const t = useDict();
  const [shown, setShown] = useOptimistic(lang);
  const [, startTransition] = useTransition();

  return (
    <div
      role="group"
      aria-label={t.lang.label}
      className={`inline-flex rounded-full border border-brand-lavanda/20 bg-brand-fondo/60 p-0.5 text-xs font-semibold ${className}`}
    >
      {LANGS.map((l) => {
        const active = l === shown;
        return (
          <button
            key={l}
            type="button"
            aria-pressed={active}
            onClick={() => {
              if (active) return;
              startTransition(async () => {
                setShown(l);
                await setLang(l);
              });
            }}
            className={`rounded-full px-2.5 py-1 uppercase tracking-wide transition-colors ${
              active
                ? "bg-brand-blu text-brand-crema"
                : "text-brand-lavanda hover:text-brand-crema"
            }`}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}
