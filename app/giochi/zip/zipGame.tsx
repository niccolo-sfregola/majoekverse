"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { useRouter } from "next/navigation";
import {
  canStep,
  isSolved,
  nextNumber,
  type ZipPuzzle,
} from "@/lib/zip";
import { useDict } from "@/app/langProvider";
import { formatDurata } from "@/lib/durata";
import WinOverlay from "../winOverlay";
import { startZip, finishZip } from "./actions";

const START_BUTTON =
  "rounded-xl bg-brand-corallo px-8 py-3 font-semibold text-brand-crema transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60";

// Stato della partita di oggi, deciso dal server quando carica la pagina.
export type ZipStatus =
  | { kind: "new" }
  | { kind: "inProgress" }
  | { kind: "finished"; timeMs: number };

// Le fasi prima e dopo la griglia: regole + "Inizia" (o "Riprendi"),
// oppure "hai già giocato oggi". Il puzzle arriva dal server solo dopo il
// click su Inizia (startZip), così nessuno può studiarlo prima.
export default function ZipGame({ status }: { status: ZipStatus }) {
  const t = useDict();
  const [game, setGame] = useState<{
    puzzle: ZipPuzzle;
    startedAt: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function start() {
    setLoading(true);
    setError(null);
    // Se la chiamata fallisce del tutto (rete, o app aggiornata mentre la
    // pagina era aperta → "Server Action not found") chiediamo di ricaricare.
    const res = await startZip().catch(() => null);
    setLoading(false);
    if (!res) {
      setError(t.zip.error);
      return;
    }
    if (!res.ok) {
      if (res.error === "played") router.refresh();
      setError(res.error === "played" ? t.zip.alreadyPlayed : t.zip.error);
      return;
    }
    // Il server dice da quanto è iniziata la partita (0 se nuova): il
    // cronometro del browser parte da lì.
    setGame({ puzzle: res.puzzle, startedAt: Date.now() - res.elapsedMs });
  }

  if (game) {
    return <ZipBoard puzzle={game.puzzle} startedAt={game.startedAt} />;
  }

  if (status.kind === "finished") {
    return (
      <div className="panel flex flex-col items-center gap-1 px-8 py-5 text-center">
        <p className="text-sm text-brand-lavanda">{t.zip.todayTime}</p>
        <p className="font-mono text-3xl tabular-nums text-brand-crema">
          {formatDurata(status.timeMs)}
        </p>
        <p className="mt-2 text-sm text-brand-lavanda">{t.zip.comeBack}</p>
      </div>
    );
  }

  return (
    <div className="panel flex flex-col items-center gap-4 p-6 text-center">
      <p className="text-brand-lavanda">
        {status.kind === "inProgress" ? t.zip.inProgress : t.zip.rules}
      </p>
      <button
        type="button"
        onClick={start}
        disabled={loading}
        className={START_BUTTON}
      >
        {loading
          ? t.zip.loading
          : status.kind === "inProgress"
            ? t.zip.resume
            : t.zip.start}
      </button>
      {error ? <p className="text-sm text-brand-corallo">{error}</p> : null}
    </div>
  );
}

// La griglia vera e propria.
function ZipBoard({
  puzzle,
  startedAt,
}: {
  puzzle: ZipPuzzle;
  startedAt: number;
}) {
  const t = useDict();
  const router = useRouter();
  const { size, numeri, muri } = puzzle;

  const [phase, setPhase] = useState<"playing" | "done">("playing");
  const [path, setPath] = useState<number[]>([]);
  // Momento in cui si è finito (null = si sta ancora giocando).
  const [stoppedAt, setStoppedAt] = useState<number | null>(null);
  // Tempo ufficiale, quello calcolato dal server (null finché non risponde).
  const [finalMs, setFinalMs] = useState<number | null>(null);
  const [finishError, setFinishError] = useState(false);
  // Festa di fine partita (sfocatura + "Hai vinto!"), poi si torna alla pagina.
  const [celebrating, setCelebrating] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  // Copia del percorso sempre aggiornata: durante un trascinamento veloce
  // arrivano più eventi prima che React ridisegni, e `path` sarebbe vecchio.
  const pathRef = useRef<number[]>([]);
  // Posizione della griglia sullo schermo, misurata a inizio trascinamento:
  // rimisurarla a ogni movimento del dito costringe il browser a ricalcolare
  // il layout decine di volte al secondo.
  const rectRef = useRef<DOMRect | null>(null);

  // Ogni modifica al percorso passa da qui: se è la soluzione, fine partita.
  function update(next: number[]) {
    pathRef.current = next;
    setPath(next);
    if (isSolved(puzzle, next)) {
      dragging.current = false;
      setStoppedAt(Date.now());
      setPhase("done");
      setCelebrating(true);
      // Il server ricontrolla la soluzione e calcola il tempo ufficiale;
      // poi aggiorniamo la pagina per far comparire il nome in classifica.
      finishZip(next).then((res) => {
        if (res.ok) {
          setFinalMs(res.timeMs);
          router.refresh();
        } else {
          setFinishError(true);
        }
      }, () => setFinishError(true));
    }
  }

  // Casella sotto il dito/mouse, o -1 se si è fuori dalla griglia.
  function cellAt(e: PointerEvent): number {
    const rect = rectRef.current ?? svgRef.current!.getBoundingClientRect();
    const col = Math.floor(((e.clientX - rect.left) / rect.width) * size);
    const row = Math.floor(((e.clientY - rect.top) / rect.height) * size);
    if (col < 0 || row < 0 || col >= size || row >= size) return -1;
    return row * size + col;
  }

  // Prova ad aggiungere una casella in fondo al percorso.
  function canAdd(current: number[], cell: number): boolean {
    const end = current[current.length - 1];
    if (current.includes(cell) || !canStep(puzzle, end, cell)) return false;
    // Sui numeri si entra solo nell'ordine giusto.
    const n = numeri[cell];
    return n === 0 || n === nextNumber(puzzle, current);
  }

  // Trascinando verso `target`: avanza (o torna indietro) una casella alla
  // volta. Serve perché con un movimento veloce il dito può "saltare"
  // caselle tra un evento e l'altro.
  function dragTo(target: number) {
    const path = pathRef.current;
    let current = path;
    for (let guard = 0; guard < size * 2; guard++) {
      const end = current[current.length - 1];
      if (end === target) break;
      const dr = Math.floor(target / size) - Math.floor(end / size);
      const dc = (target % size) - (end % size);
      const step =
        Math.abs(dr) >= Math.abs(dc)
          ? end + Math.sign(dr) * size
          : end + Math.sign(dc);
      if (current.length >= 2 && step === current[current.length - 2]) {
        current = current.slice(0, -1); // ripassando sull'ultima: si cancella
      } else if (canAdd(current, step)) {
        current = [...current, step];
      } else {
        break;
      }
    }
    if (current !== path) update(current);
  }

  function onPointerDown(e: PointerEvent<SVGSVGElement>) {
    if (phase !== "playing") return;
    rectRef.current = svgRef.current!.getBoundingClientRect();
    const cell = cellAt(e);
    if (cell < 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const path = pathRef.current;

    if (path.length === 0) {
      // Si parte solo dall'1.
      if (numeri[cell] !== 1) return;
      update([cell]);
    } else if (path.includes(cell)) {
      // Tap su una casella già fatta: si riparte da lì.
      update(path.slice(0, path.indexOf(cell) + 1));
    } else {
      dragTo(cell);
    }
    dragging.current = true;
  }

  function onPointerMove(e: PointerEvent<SVGSVGElement>) {
    if (!dragging.current || phase !== "playing") return;
    const cell = cellAt(e);
    if (cell >= 0) dragTo(cell);
  }

  function onPointerUp() {
    dragging.current = false;
  }

  const center = (cell: number) => ({
    x: (cell % size) + 0.5,
    y: Math.floor(cell / size) + 0.5,
  });
  const visited = new Set(path);
  const finalTime = formatDurata(finalMs ?? (stoppedAt ?? startedAt) - startedAt);
  const next = nextNumber(puzzle, path);
  const max = Math.max(...numeri);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full max-w-md items-center justify-between text-sm">
        <span className="text-brand-lavanda">
          {phase === "done"
            ? t.zip.done
            : next <= max
              ? t.zip.next(next)
              : t.zip.fillAll}
        </span>
        <span className="font-mono text-lg tabular-nums text-brand-crema">
          {stoppedAt === null ? <Clock startedAt={startedAt} /> : finalTime}
        </span>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${size} ${size}`}
        className="aspect-square w-full max-w-md touch-none select-none rounded-2xl bg-brand-darkblu/40"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Caselle: tutte sempre presenti, quelle percorse si accendono con
            una dissolvenza (transizione CSS sull'opacità). */}
        {Array.from({ length: size * size }, (_, cell) => (
          <rect
            key={`v${cell}`}
            x={cell % size}
            y={Math.floor(cell / size)}
            width={1}
            height={1}
            className={`fill-brand-corallo/15 transition-opacity duration-200 ${
              visited.has(cell) ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Righe della griglia */}
        {Array.from({ length: size - 1 }, (_, i) => (
          <g key={`g${i}`} className="stroke-brand-lavanda/15" strokeWidth={0.02}>
            <line x1={i + 1} y1={0} x2={i + 1} y2={size} />
            <line x1={0} y1={i + 1} x2={size} y2={i + 1} />
          </g>
        ))}

        {/* Percorso: un segmento per passo. La key dipende dalle due caselle,
            quindi React crea un elemento nuovo solo per il passo appena
            fatto, ed è l'unico che si "disegna" (classe zip-seg). */}
        {path.length > 0 ? (
          <circle
            cx={center(path[0]).x}
            cy={center(path[0]).y}
            r={0.21}
            className="fill-brand-corallo"
          />
        ) : null}
        {path.slice(1).map((cell, i) => {
          const from = center(path[i]);
          const to = center(cell);
          return (
            <line
              key={`s${path[i]}-${cell}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              pathLength={1}
              className="zip-seg stroke-brand-corallo"
              strokeWidth={0.42}
              strokeLinecap="round"
            />
          );
        })}

        {/* Muri */}
        {muri.map((key) => {
          const [a, b] = key.split("-").map(Number);
          const r = Math.floor(a / size);
          const c = a % size;
          const vertical = b === a + 1; // muro tra sinistra e destra
          return (
            <line
              key={`w${key}`}
              x1={vertical ? c + 1 : c}
              y1={vertical ? r : r + 1}
              x2={vertical ? c + 1 : c + 1}
              y2={vertical ? r + 1 : r + 1}
              className="stroke-brand-crema"
              strokeWidth={0.1}
              strokeLinecap="round"
            />
          );
        })}

        {/* Numeri */}
        {numeri.map((n, cell) =>
          n ? (
            <g key={`n${cell}`}>
              <circle
                cx={center(cell).x}
                cy={center(cell).y}
                r={0.32}
                className={`transition-[fill,stroke] duration-200 ${
                  visited.has(cell)
                    ? "fill-brand-corallo stroke-brand-corallo"
                    : "fill-brand-fondo stroke-brand-crema/70"
                }`}
                strokeWidth={0.05}
              />
              <text
                x={center(cell).x}
                y={center(cell).y}
                textAnchor="middle"
                // Niente dominantBaseline: Safari su iPhone lo ignora e il
                // numero finisce in alto. dy=0.35em centra in tutti i browser.
                dy="0.35em"
                fontSize={0.34}
                fontWeight={700}
                className="fill-brand-crema"
              >
                {n}
              </text>
            </g>
          ) : null,
        )}
      </svg>

      {phase === "playing" ? (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => update(path.slice(0, -1))}
            disabled={path.length === 0}
            className="rounded-xl border border-brand-lavanda/30 px-5 py-2 text-sm font-semibold text-brand-crema transition active:scale-[0.98] disabled:opacity-40"
          >
            {t.zip.undo}
          </button>
          <button
            type="button"
            onClick={() => update([])}
            disabled={path.length === 0}
            className="rounded-xl border border-brand-lavanda/30 px-5 py-2 text-sm font-semibold text-brand-crema transition active:scale-[0.98] disabled:opacity-40"
          >
            {t.zip.reset}
          </button>
        </div>
      ) : (
        <div className="zip-result panel flex flex-col items-center gap-1 px-8 py-4 text-center">
          <p className="text-sm text-brand-lavanda">{t.zip.yourTime}</p>
          <p className="font-mono text-3xl tabular-nums text-brand-crema">
            {finalTime}
          </p>
          {finishError ? (
            <p className="mt-1 text-sm text-brand-corallo">{t.zip.error}</p>
          ) : null}
        </div>
      )}

      {/* Sopra tutta la pagina: si sfoca, compare la scritta, torna nitida.
          Si smonta a fine animazione (onAnimationEnd), non con un timer,
          così la durata sta solo nel CSS. */}
      {celebrating ? (
        <WinOverlay onDone={() => setCelebrating(false)} />
      ) : null}
    </div>
  );
}

// Cronometro in un componente a parte: così il suo aggiornamento (4 volte al
// secondo) ridisegna solo questo testo e non tutta la griglia dello Zip.
function Clock({ startedAt }: { startedAt: number }) {
  const [now, setNow] = useState(startedAt);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);
  return <>{formatDurata(now - startedAt)}</>;
}
