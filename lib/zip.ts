// Zip (stile LinkedIn): una griglia con alcuni numeri; bisogna tracciare un
// unico percorso che parte dall'1, tocca i numeri in ordine, passa da TUTTE
// le caselle una volta sola e finisce sul numero più alto. Alcune coppie di
// caselle vicine sono separate da un muro.
//
// Qui c'è solo logica (niente React, niente server): la usano sia il gioco
// nel browser sia, più avanti, il server per controllare le partite.
//
// Le caselle sono numerate riga per riga: indice = riga * size + colonna.

export type ZipPuzzle = {
  size: number;
  // numeri[i] = numero scritto nella casella i (0 = casella vuota).
  numeri: number[];
  // Muri tra due caselle vicine, come chiave "a-b" con a < b.
  muri: string[];
};

export function wallKey(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

export function neighbors(cell: number, size: number): number[] {
  const r = Math.floor(cell / size);
  const c = cell % size;
  const out: number[] = [];
  if (r > 0) out.push(cell - size);
  if (r < size - 1) out.push(cell + size);
  if (c > 0) out.push(cell - 1);
  if (c < size - 1) out.push(cell + 1);
  return out;
}

export function isAdjacent(a: number, b: number, size: number): boolean {
  return neighbors(a, size).includes(b);
}

// --- Casualità con un seme -------------------------------------------------
// Math.random() dà numeri diversi ogni volta; a noi serve lo STESSO puzzle per
// tutti nello stesso giorno, quindi usiamo un generatore che, dato lo stesso
// seme, produce sempre la stessa sequenza (mulberry32).
export function seededRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- Generazione -------------------------------------------------------------

// Percorso che copre tutta la griglia, scelto a caso.
// Si parte da una serpentina (→ riga 1, ← riga 2, …) e la si rimescola con
// tante mosse "backbite": si prende un'estremità del percorso, si salta su una
// casella vicina che sta più avanti nel percorso, e si rigira il pezzo in
// mezzo. Il risultato è sempre un percorso valido, ma sempre diverso.
function randomPath(size: number, rand: () => number): number[] {
  const path: number[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      path.push(r * size + (r % 2 === 0 ? c : size - 1 - c));
    }
  }

  const steps = size * size * 40;
  for (let s = 0; s < steps; s++) {
    // Lavoriamo sempre sulla testa: metà delle volte giriamo tutto il
    // percorso, così si mescolano entrambe le estremità.
    if (rand() < 0.5) path.reverse();
    const head = path[0];
    const options = neighbors(head, size).filter((n) => n !== path[1]);
    const next = options[Math.floor(rand() * options.length)];
    const i = path.indexOf(next);
    // path = [p0 … p(i-1), p(i) …] → [p(i-1) … p0, p(i) …]
    const front = path.slice(0, i).reverse();
    path.splice(0, i, ...front);
  }
  return path;
}

export function generateZip(seed: number, size: number): ZipPuzzle {
  const rand = seededRandom(seed);
  const cells = size * size;
  const path = randomPath(size, rand);

  // Numeri: sempre sul primo e sull'ultimo passo, più altri in mezzo a
  // distanze irregolari. Meno numeri = più difficile.
  const count = size <= 6 ? 8 + Math.floor(rand() * 3) : 10 + Math.floor(rand() * 3);
  const steps = new Set<number>([0, cells - 1]);
  while (steps.size < count) {
    steps.add(1 + Math.floor(rand() * (cells - 2)));
  }
  const numeri = new Array<number>(cells).fill(0);
  [...steps]
    .sort((a, b) => a - b)
    .forEach((step, k) => {
      numeri[path[step]] = k + 1;
    });

  // Muri: solo tra caselle vicine che il percorso NON attraversa di seguito,
  // così la soluzione generata resta valida.
  const used = new Set<string>();
  for (let i = 1; i < path.length; i++) used.add(wallKey(path[i - 1], path[i]));
  const candidates: string[] = [];
  for (let cell = 0; cell < cells; cell++) {
    for (const n of neighbors(cell, size)) {
      const key = wallKey(cell, n);
      if (cell < n && !used.has(key)) candidates.push(key);
    }
  }
  const wallCount = Math.min(candidates.length, size + Math.floor(rand() * 3));
  const muri: string[] = [];
  while (muri.length < wallCount) {
    const k = candidates.splice(Math.floor(rand() * candidates.length), 1)[0];
    muri.push(k);
  }

  return { size, numeri, muri };
}

// --- Regole --------------------------------------------------------------

export function maxNumber(puzzle: ZipPuzzle): number {
  return Math.max(...puzzle.numeri);
}

// Si può andare da `from` a `to`? (vicine e senza muro in mezzo)
export function canStep(puzzle: ZipPuzzle, from: number, to: number): boolean {
  return (
    isAdjacent(from, to, puzzle.size) &&
    !puzzle.muri.includes(wallKey(from, to))
  );
}

// Il prossimo numero da raggiungere, dato il percorso fatto finora.
export function nextNumber(puzzle: ZipPuzzle, path: number[]): number {
  let last = 0;
  for (const cell of path) {
    if (puzzle.numeri[cell]) last = puzzle.numeri[cell];
  }
  return last + 1;
}

// Il percorso è una soluzione completa e corretta?
export function isSolved(puzzle: ZipPuzzle, path: number[]): boolean {
  const cells = puzzle.size * puzzle.size;
  if (path.length !== cells) return false;
  if (new Set(path).size !== cells) return false;
  if (path.some((c) => !Number.isInteger(c) || c < 0 || c >= cells)) {
    return false;
  }

  let expected = 1;
  for (let i = 0; i < path.length; i++) {
    if (i > 0 && !canStep(puzzle, path[i - 1], path[i])) return false;
    const n = puzzle.numeri[path[i]];
    if (n) {
      if (n !== expected) return false;
      expected++;
    }
  }
  // Tutti i numeri toccati (quindi l'ultimo passo è sul numero più alto,
  // perché l'ultimo numero sta sempre sull'ultima casella del percorso).
  return expected === maxNumber(puzzle) + 1 && puzzle.numeri[path[cells - 1]] === maxNumber(puzzle);
}
