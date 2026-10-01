"use client";

import { createContext, useContext, type ReactNode } from "react";
import { dictionaries, DEFAULT_LANG, type Lang } from "@/lib/i18n/dictionaries";

// I Client Component non possono leggere i cookie sul server: il layout legge
// la lingua (getLang) e la passa qui, e i componenti la prendono con useLang/useDict.
const LangContext = createContext<Lang>(DEFAULT_LANG);

export function LangProvider({
  lang,
  children,
}: {
  lang: Lang;
  children: ReactNode;
}) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export function useLang(): Lang {
  return useContext(LangContext);
}

export function useDict() {
  return dictionaries[useLang()];
}
