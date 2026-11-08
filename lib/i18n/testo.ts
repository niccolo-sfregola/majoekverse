import type { Lang } from "./dictionaries";

// Sceglie il testo nella lingua del sito per i contenuti scritti dall'admin
// (news, eventi): in inglese usa la versione _en se c'è, altrimenti quella
// italiana, così niente resta mai vuoto.
export function inLingua(
  lang: Lang,
  italiano: string | null | undefined,
  inglese: string | null | undefined,
): string {
  return (lang === "en" && inglese?.trim()) || italiano || "";
}
