// Wordle: solo logica pura (niente server, niente segreti), così il browser
// può importare i tipi e le costanti senza ricevere le liste di parole.

export const LUNGHEZZA = 5;
export const MAX_TENTATIVI = 6;

// giusta = lettera giusta al posto giusto; presente = c'è ma altrove.
export type Esito = "giusta" | "presente" | "assente";

export type Riga = { parola: string; esiti: Esito[] };

// Colori di un tentativo, con le regole classiche anche per le doppie:
// prima si segnano le lettere al posto giusto, poi le "presenti" solo
// finché la parola segreta ne ha ancora di quel tipo.
// Es. segreta "palla", tentativo "lilla" → l (assente), i, l, l, a giuste…
export function valuta(tentativo: string, segreta: string): Esito[] {
  const esiti: Esito[] = new Array(LUNGHEZZA).fill("assente");
  const rimaste = new Map<string, number>();

  for (let i = 0; i < LUNGHEZZA; i++) {
    if (tentativo[i] === segreta[i]) {
      esiti[i] = "giusta";
    } else {
      rimaste.set(segreta[i], (rimaste.get(segreta[i]) ?? 0) + 1);
    }
  }
  for (let i = 0; i < LUNGHEZZA; i++) {
    if (esiti[i] === "giusta") continue;
    const n = rimaste.get(tentativo[i]) ?? 0;
    if (n > 0) {
      esiti[i] = "presente";
      rimaste.set(tentativo[i], n - 1);
    }
  }
  return esiti;
}
