// Come si scrive un messaggio per Discord a partire dai dati.
// Funzioni "pure": stesso input, stesso testo. Usate sia per l'anteprima
// nella pagina admin sia per l'invio vero.
import { longDayIt, longDayEn, ddmm, timeIt, timeEn, fullDateIt } from "./schedule";
import { pulisciPiattaforme, nomiPiattaforme } from "./piattaforme";

// Le righe arrivano sia dal database sia dai form: valori di tipo misto
// (le piattaforme della schedule sono un array).
type Row = Record<string, unknown>;

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

// Lunghezza massima di un messaggio Discord (anche via webhook).
export const DISCORD_MAX = 2000;

export function formatSchedule(rows: Row[]): string {
  const valid = rows
    .filter((r) => r.data && r.orario && r.gioco)
    .map((r) => ({
      data: String(r.data),
      orario: String(r.orario).slice(0, 5),
      gioco: String(r.gioco).toUpperCase(),
      su: nomiPiattaforme(pulisciPiattaforme(r.piattaforme)),
    }));
  if (valid.length === 0) return "";

  const it = valid
    .map(
      (r) =>
        `${longDayIt(r.data)} ${ddmm(r.data)} - dalle ${timeIt(r.orario)}: ${r.gioco} (${r.su})`,
    )
    .join("\n");

  const en = valid
    .map(
      (r) =>
        `${longDayEn(r.data)} ${ddmm(r.data)} - from ${timeEn(r.orario)} (CEST / Italy): ${r.gioco} (${r.su})`,
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

// La foto va in fondo come link: Discord la mostra da sola in anteprima.
function fotoRiga(url: unknown): string {
  return str(url) ? `\n${str(url)}` : "";
}

// News ed eventi possono avere anche la versione inglese. Su Discord va il
// messaggio con TUTTE e due le lingue (prima IT, poi EN); se l'inglese non
// c'è resta il messaggio solo italiano di sempre. Il titolo inglese è
// facoltativo: se manca si riusa quello italiano.
function bilingue(italiano: string, inglese: string): string {
  return inglese ? `🇮🇹 ${italiano}\n\n🇬🇧 ${inglese}` : italiano;
}

export function formatNews(n: Row): string {
  const it = `📢 ANNUNCIO: **${str(n.titolo)}**\n${str(n.testo)}`;
  const en = str(n.testo_en)
    ? `📢 ANNOUNCEMENT: **${str(n.titolo_en) || str(n.titolo)}**\n${str(n.testo_en)}`
    : "";
  return bilingue(it, en) + fotoRiga(n.immagine);
}

export function formatEvent(e: Row): string {
  const data = str(e.data);
  const dataRiga = data ? `\n📅 ${fullDateIt(data)}` : "";
  const it = `📢 NUOVO EVENTO: **${str(e.titolo)}**${dataRiga}\n${str(e.descrizione)}`;
  const en = str(e.descrizione_en)
    ? `📢 NEW EVENT: **${str(e.titolo_en) || str(e.titolo)}**${dataRiga}\n${str(e.descrizione_en)}`
    : "";
  return bilingue(it, en) + fotoRiga(e.immagine);
}

// Lunghezza come la conta Discord: [...testo] conta le emoji come 1.
export function discordLength(content: string): number {
  return [...content].length;
}
