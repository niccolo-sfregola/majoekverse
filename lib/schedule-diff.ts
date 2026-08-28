// Confronto tra la schedule attuale e l'ultima annunciata su Discord.
import { longDayIt, longDayEn, ddmm, timeIt, timeEn } from "./schedule";

export type ScheduleRow = { data: string; orario: string; gioco: string };

export type ScheduleChange =
  | { kind: "added"; data: string; orario: string; gioco: string }
  | { kind: "removed"; data: string; orario: string; gioco: string }
  | { kind: "moved"; data: string; from: string; to: string; gioco: string }
  | {
      kind: "game";
      data: string;
      orario: string;
      fromGioco: string;
      toGioco: string;
    }
  | {
      kind: "movedGame";
      data: string;
      from: string;
      to: string;
      fromGioco: string;
      toGioco: string;
    };

// Pulisce le righe che arrivano dal database: scarta quelle incomplete e
// taglia l'orario a "HH:MM" (a volte il DB restituisce "21:00:00").
export function normalizeRows(rows: Record<string, string>[]): ScheduleRow[] {
  return rows
    .filter((r) => r.data && r.orario && r.gioco)
    .map((r) => ({
      data: r.data,
      orario: r.orario.slice(0, 5),
      gioco: r.gioco,
    }));
}

export function diffSchedule(
  current: ScheduleRow[],
  previous: ScheduleRow[],
): ScheduleChange[] {
  const prevByDay = new Map(previous.map((r) => [r.data, r]));
  const curByDay = new Map(current.map((r) => [r.data, r]));
  const changes: ScheduleChange[] = [];

  for (const cur of current) {
    const prev = prevByDay.get(cur.data);
    if (!prev) {
      changes.push({ kind: "added", ...cur });
      continue;
    }
    const timeChanged = prev.orario !== cur.orario;
    const gameChanged = prev.gioco.toLowerCase() !== cur.gioco.toLowerCase();

    if (timeChanged && gameChanged) {
      changes.push({
        kind: "movedGame",
        data: cur.data,
        from: prev.orario,
        to: cur.orario,
        fromGioco: prev.gioco,
        toGioco: cur.gioco,
      });
    } else if (timeChanged) {
      changes.push({
        kind: "moved",
        data: cur.data,
        from: prev.orario,
        to: cur.orario,
        gioco: cur.gioco,
      });
    } else if (gameChanged) {
      changes.push({
        kind: "game",
        data: cur.data,
        orario: cur.orario,
        fromGioco: prev.gioco,
        toGioco: cur.gioco,
      });
    }
  }

  for (const prev of previous) {
    if (!curByDay.has(prev.data)) {
      changes.push({ kind: "removed", ...prev });
    }
  }

  return changes.sort((a, b) => a.data.localeCompare(b.data));
}

function dayIt(dataStr: string): string {
  return `${longDayIt(dataStr)} ${ddmm(dataStr)}`;
}

function dayEn(dataStr: string): string {
  return `${longDayEn(dataStr)} ${ddmm(dataStr)}`;
}

// Una riga leggibile per ogni modifica (italiano).
export function changeLine(c: ScheduleChange): string {
  switch (c.kind) {
    case "added":
      return `➕ ${dayIt(c.data)}: nuova diretta dalle ${timeIt(c.orario)} — ${c.gioco.toUpperCase()}`;
    case "removed":
      return `❌ ${dayIt(c.data)}: diretta annullata (${c.gioco.toUpperCase()})`;
    case "moved":
      return `🕘 ${dayIt(c.data)}: spostata dalle ${timeIt(c.from)} alle ${timeIt(c.to)} — ${c.gioco.toUpperCase()}`;
    case "game":
      return `🎮 ${dayIt(c.data)} dalle ${timeIt(c.orario)}: ora ${c.toGioco.toUpperCase()} (prima ${c.fromGioco.toUpperCase()})`;
    case "movedGame":
      return `🔄 ${dayIt(c.data)}: ora dalle ${timeIt(c.to)} con ${c.toGioco.toUpperCase()} (prima dalle ${timeIt(c.from)}, ${c.fromGioco.toUpperCase()})`;
  }
}

// Stessa riga in inglese.
export function changeLineEn(c: ScheduleChange): string {
  switch (c.kind) {
    case "added":
      return `➕ ${dayEn(c.data)}: new stream from ${timeEn(c.orario)} (CEST / Italy) — ${c.gioco.toUpperCase()}`;
    case "removed":
      return `❌ ${dayEn(c.data)}: stream cancelled (${c.gioco.toUpperCase()})`;
    case "moved":
      return `🕘 ${dayEn(c.data)}: moved from ${timeEn(c.from)} to ${timeEn(c.to)} (CEST / Italy) — ${c.gioco.toUpperCase()}`;
    case "game":
      return `🎮 ${dayEn(c.data)} from ${timeEn(c.orario)}: now ${c.toGioco.toUpperCase()} (was ${c.fromGioco.toUpperCase()})`;
    case "movedGame":
      return `🔄 ${dayEn(c.data)}: now from ${timeEn(c.to)} with ${c.toGioco.toUpperCase()} (was ${timeEn(c.from)}, ${c.fromGioco.toUpperCase()})`;
  }
}

// Messaggio per Discord, bilingue IT/EN.
export function formatScheduleChanges(changes: ScheduleChange[]): string {
  const it = changes.map(changeLine).join("\n");
  const en = changes.map(changeLineEn).join("\n");
  return [
    "📢 MODIFICA ALLA SCHEDULE 🧸",
    "",
    it,
    "",
    "Trovi la schedule aggiornata nell'app 🧸",
    "",
    "📢 SCHEDULE UPDATE 🧸",
    "",
    en,
    "",
    "Find the updated schedule in the app 🧸",
  ].join("\n");
}

// Testo per la news creata in automatico (in-app, solo italiano).
export function scheduleChangesPlainText(changes: ScheduleChange[]): string {
  return changes.map(changeLine).join("\n");
}
