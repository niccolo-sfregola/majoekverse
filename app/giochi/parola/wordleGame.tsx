"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LUNGHEZZA, MAX_TENTATIVI, type Esito, type Riga } from "@/lib/wordle";
import { formatDurata } from "@/lib/durata";
import { useDict } from "@/app/langProvider";
import WinOverlay from "../winOverlay";
import { guessWordle } from "./actions";

type Stato = "playing" | "won" | "lost";

const TILE_COLORS: Record<Esito, string> = {
  giusta: "border-brand-corallo bg-brand-corallo text-brand-crema",
  presente: "border-brand-lavanda bg-brand-lavanda text-brand-fondo",
  assente: "border-brand-darkblu bg-brand-darkblu text-brand-lavanda/60",
};

const KEY_ROWS = ["qwertyuiop", "asdfghjkl", "⏎zxcvbnm⌫"];

// Per la tastiera: il colore "migliore" visto finora per ogni lettera.
const PRIORITY: Record<Esito, number> = { giusta: 3, presente: 2, assente: 1 };

export default function WordleGame({
  initialRighe,
  initialStato,
  initialTimeMs,
}: {
  initialRighe: Riga[];
  initialStato: Stato;
  initialTimeMs: number | null;
}) {
  const t = useDict();
  const router = useRouter();

  const [righe, setRighe] = useState(initialRighe);
  const [stato, setStato] = useState<Stato>(initialStato);
  const [timeMs, setTimeMs] = useState(initialTimeMs);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  // Riga appena inviata: è l'unica che fa l'animazione di "giro".
  const [revealRow, setRevealRow] = useState<number | null>(null);
  // Cambia a ogni errore, così la riga corrente ripete il "tremolio".
  const [shake, setShake] = useState(0);
  const [celebrating, setCelebrating] = useState(false);

  const fail = useCallback((msg: string) => {
    setMessage(msg);
    setShake((n) => n + 1);
  }, []);

  const submit = useCallback(async () => {
    if (input.length < LUNGHEZZA) {
      fail(t.parola.tooShort);
      return;
    }
    setPending(true);
    // .catch: rete giù, o app aggiornata mentre la pagina era aperta
    // ("Server Action not found") → messaggio "ricarica" invece di un crash.
    const res = await guessWordle(
      input,
      righe.map((r) => r.parola),
    ).catch(() => null);
    setPending(false);
    if (!res) {
      fail(t.parola.error);
      return;
    }

    if (!res.ok) {
      const errors: Record<typeof res.error, string> = {
        notWord: t.parola.notWord,
        finished: t.parola.finished,
        notSub: t.parola.notSubShort,
        noToken: t.parola.noTokenShort,
        login: t.parola.error,
        server: t.parola.error,
      };
      fail(errors[res.error]);
      return;
    }

    setMessage(null);
    setRighe(res.righe);
    setRevealRow(res.righe.length - 1);
    setInput("");
    setStato(res.stato);
    setTimeMs(res.timeMs);
    if (res.stato !== "playing") router.refresh();
  }, [input, righe, fail, router, t]);

  const press = useCallback(
    (key: string) => {
      if (stato !== "playing" || pending) return;
      if (key === "⏎") {
        submit();
      } else if (key === "⌫") {
        setInput((s) => s.slice(0, -1));
      } else if (/^[a-z]$/.test(key)) {
        setInput((s) => (s.length < LUNGHEZZA ? s + key : s));
      }
    },
    [stato, pending, submit],
  );

  // Tastiera fisica (PC).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Enter") press("⏎");
      else if (e.key === "Backspace") press("⌫");
      else press(e.key.toLowerCase());
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press]);

  const keyColors = new Map<string, Esito>();
  for (const r of righe) {
    r.esiti.forEach((esito, i) => {
      const letter = r.parola[i];
      const prev = keyColors.get(letter);
      if (!prev || PRIORITY[esito] > PRIORITY[prev]) keyColors.set(letter, esito);
    });
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Griglia: 6 righe × 5 caselle */}
      <div className="grid gap-1.5">
        {Array.from({ length: MAX_TENTATIVI }, (_, r) => {
          const riga = righe[r];
          const isCurrent = r === righe.length && stato === "playing";
          const letters = riga ? riga.parola : isCurrent ? input : "";
          return (
            <div
              key={isCurrent ? `cur${shake}` : `r${r}`}
              className={`flex gap-1.5 ${isCurrent && shake ? "row-shake" : ""}`}
            >
              {Array.from({ length: LUNGHEZZA }, (_, i) => {
                const letter = letters[i] ?? "";
                const esito = riga?.esiti[i];
                const revealing = riga && r === revealRow;
                const isLast = i === LUNGHEZZA - 1;
                return (
                  <div
                    key={i}
                    style={
                      revealing ? { animationDelay: `${i * 0.12}s` } : undefined
                    }
                    onAnimationEnd={
                      revealing && isLast && stato === "won"
                        ? () => setCelebrating(true)
                        : undefined
                    }
                    className={`grid h-12 w-12 place-items-center rounded-lg border-2 text-2xl font-bold uppercase md:h-14 md:w-14 ${
                      esito
                        ? TILE_COLORS[esito]
                        : letter
                          ? "tile-pop border-brand-lavanda/60 text-brand-crema"
                          : "border-brand-lavanda/15 text-brand-crema"
                    } ${revealing ? "tile-reveal" : ""}`}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <p className="min-h-5 text-center text-sm text-brand-lavanda" aria-live="polite">
        {stato === "won"
          ? t.parola.wonIn(righe.length, timeMs != null ? formatDurata(timeMs) : "—")
          : stato === "lost"
            ? t.parola.lost
            : (message ?? (pending ? t.parola.checking : ""))}
      </p>

      {/* Tastiera a schermo */}
      {stato === "playing" ? (
        <div className="flex w-full max-w-lg flex-col gap-1.5">
          {KEY_ROWS.map((row) => (
            <div key={row} className="flex justify-center gap-1">
              {[...row].map((key) => {
                const esito = keyColors.get(key);
                const wide = key === "⏎" || key === "⌫";
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => press(key)}
                    disabled={pending}
                    aria-label={
                      key === "⏎" ? t.parola.enter : key === "⌫" ? t.parola.delete : key
                    }
                    className={`h-12 rounded-md text-sm font-semibold uppercase transition-colors duration-200 active:scale-95 ${
                      wide ? "flex-[1.5] text-base" : "flex-1"
                    } ${
                      esito
                        ? TILE_COLORS[esito]
                        : "bg-brand-blu/40 text-brand-crema"
                    }`}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      ) : null}

      {celebrating ? <WinOverlay onDone={() => setCelebrating(false)} /> : null}
    </div>
  );
}
