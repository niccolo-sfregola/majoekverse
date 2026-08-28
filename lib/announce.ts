// Come si scrive un messaggio per Discord a partire dai dati.
// Funzioni "pure": stesso input, stesso testo. Usate sia per l'anteprima
// nella pagina admin sia per l'invio vero.
import { longDayIt, longDayEn, ddmm, timeIt, timeEn, fullDateIt } from "./schedule";

type Row = Record<string, string>;

export function formatSchedule(rows: Row[]): string {
  const valid = rows.filter((r) => r.data && r.orario && r.gioco);
  if (valid.length === 0) return "";

  const it = valid
    .map(
      (r) =>
        `${longDayIt(r.data)} ${ddmm(r.data)} - dalle ${timeIt(r.orario)}: ${r.gioco.toUpperCase()}`,
    )
    .join("\n");

  const en = valid
    .map(
      (r) =>
        `${longDayEn(r.data)} ${ddmm(r.data)} - from ${timeEn(r.orario)} (CEST / Italy): ${r.gioco.toUpperCase()}`,
    )
    .join("\n");

  return [
    "🇮🇹 🧸 SCHEDULE DELLA SETTIMANA 🧸",
    "",
    it,
    "",
    "Grazie mille per il costante supporto ❤️",
    "",
    "🇬🇧 🧸 SCHEDULE OF THE WEEK 🧸",
    "",
    en,
  ].join("\n");
}

export function formatNews(n: Row): string {
  return `📢 ANNUNCIO: **${n.titolo}**\n${n.testo}`;
}

export function formatEvent(e: Row): string {
  const dataRiga = e.data ? `\n📅 ${fullDateIt(e.data)}` : "";
  return `📢 NUOVO EVENTO: **${e.titolo}**${dataRiga}\n${e.descrizione}`;
}
