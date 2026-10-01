// Durata in millisecondi → "1:05" (sotto l'ora) o "26:01:05" (ore:min:sec).
// Senza parole, così va bene in tutte le lingue.
export function formatDurata(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}
