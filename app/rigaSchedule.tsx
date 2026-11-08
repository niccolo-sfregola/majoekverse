"use client";

import { useEffect, useRef, useState } from "react";

// Una riga della schedule in Home. Il gioco di solito sta su una riga e, se è
// troppo lungo, si tronca coi "…"; toccando la riga si apre e il titolo si
// legge tutto (si va a capo). È sempre un <button>, ma attivo SOLO se il
// titolo è davvero tagliato: le righe che si leggono già intere non fanno
// finta di essere cliccabili. Giorno, orario e piattaforma li prepara il server.
//
// Attenzione: niente scambio <div>/<button> a seconda dello stato. Cambiando
// tipo di elemento React ricrea anche lo span del titolo, e la misura
// continuerebbe a guardare quello vecchio (staccato, largo 0) → "non tagliato".
export default function RigaSchedule({
  giorno,
  gioco,
  piattaforme,
  orario,
  prossima,
}: {
  giorno: string;
  gioco: string;
  piattaforme: string;
  orario: string;
  prossima: boolean;
}) {
  const [aperta, setAperta] = useState(false);
  const [tagliata, setTagliata] = useState(false);
  const giocoRef = useRef<HTMLSpanElement>(null);

  // Il titolo è tagliato se il testo intero (scrollWidth) è più largo dello
  // spazio che ha (clientWidth). Si ricontrolla quando cambia la larghezza
  // (rotazione del telefono, finestra ridimensionata). Da aperta non si
  // misura: lì il testo va a capo e non sembrerebbe più tagliato.
  useEffect(() => {
    const el = giocoRef.current;
    if (!el || aperta) return;
    const misura = () => setTagliata(el.scrollWidth > el.clientWidth);
    misura();
    // Il font (Oxanium) può arrivare dopo la prima misura e allargare il testo.
    document.fonts?.ready.then(misura);
    const ro = new ResizeObserver(misura);
    ro.observe(el);
    return () => ro.disconnect();
  }, [aperta]);

  const contenuto = (
    <>
      <span className={`font-bold ${prossima ? "" : "text-brand-lavanda"}`}>{giorno}</span>
      {/* Chiusa: il gioco si tronca, la piattaforma resta intera accanto.
          Aperta: il gioco va a capo e la piattaforma lo segue. */}
      <span className={`flex min-w-0 items-baseline gap-x-2 ${aperta ? "flex-wrap" : ""}`}>
        <span
          ref={giocoRef}
          className={`${aperta ? "break-words" : "truncate"} ${prossima ? "font-bold" : ""}`}
        >
          {gioco}
        </span>
        <span className="shrink-0 text-xs text-brand-lavanda-chiara">{piattaforme}</span>
      </span>
      <span className={`tabular-nums ${prossima ? "" : "text-brand-lavanda-chiara"}`}>
        {orario}
      </span>
    </>
  );

  // items-baseline: con il titolo su più righe, giorno e orario restano
  // allineati alla prima riga invece di finire a metà.
  const apribile = tagliata || aperta;

  return (
    <li>
      <button
        type="button"
        onClick={() => setAperta((a) => !a)}
        disabled={!apribile}
        aria-expanded={apribile ? aperta : undefined}
        className={`riga grid grid-cols-[46px_minmax(0,1fr)_auto] items-baseline gap-x-2 py-3 disabled:cursor-default ${
          prossima ? "riga-attiva" : ""
        }`}
      >
        {contenuto}
      </button>
    </li>
  );
}
