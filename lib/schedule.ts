// Helper per trasformare una data ("2026-08-11") e un orario ("21:00")
// nei formati che servono in giro per l'app.
// Usiamo sempre UTC per non far dipendere il risultato dal fuso del server.

const SHORT_DAY_IT = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

function toDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00Z`);
}

export function shortDayIt(dateStr: string): string {
  return SHORT_DAY_IT[toDate(dateStr).getUTCDay()] ?? "";
}

export function longDayIt(dateStr: string): string {
  const s = new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    timeZone: "UTC",
  }).format(toDate(dateStr));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function longDayEn(dateStr: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    timeZone: "UTC",
  }).format(toDate(dateStr));
}

export function ddmm(dateStr: string): string {
  const d = toDate(dateStr);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

// "2026-08-20" -> "20/08/2026"
export function fullDateIt(dateStr: string): string {
  return `${ddmm(dateStr)}/${toDate(dateStr).getUTCFullYear()}`;
}

// "21:00" -> "21.00"
export function timeIt(orario: string): string {
  return orario.replace(":", ".");
}

// "21:00" -> "9:00 PM"
export function timeEn(orario: string): string {
  const [h, m] = orario.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m || 0).padStart(2, "0")} ${ampm}`;
}
