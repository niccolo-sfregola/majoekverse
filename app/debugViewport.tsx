"use client";

import { useEffect, useRef, useState } from "react";

// TEMPORANEO: riquadro di debug per il bug della nav su iPhone (app installata).
// Si accende e si spegne toccando lo schermo con TRE dita insieme; la scelta
// resta salvata nel telefono. Mostra le misure del viewport dal vivo, così in
// una registrazione dello schermo si vede cosa cambia durante le transizioni.
// Da togliere (file + riga in layout.tsx) quando il bug è risolto.
const CHIAVE = "debug-viewport";

export default function DebugViewport() {
  const [acceso, setAcceso] = useState(false);
  const [testo, setTesto] = useState("");
  const sondaFissa = useRef<HTMLDivElement>(null);
  const sondaDvh = useRef<HTMLDivElement>(null);
  const sondaSafe = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Letto dopo il primo disegno: localStorage sul server non esiste.
    const id = requestAnimationFrame(() => {
      try {
        setAcceso(localStorage.getItem(CHIAVE) === "1");
      } catch {}
    });
    const onTouch = (e: TouchEvent) => {
      if (e.touches.length !== 3) return;
      setAcceso((a) => {
        try {
          localStorage.setItem(CHIAVE, a ? "0" : "1");
        } catch {}
        return !a;
      });
    };
    window.addEventListener("touchstart", onTouch);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("touchstart", onTouch);
    };
  }, []);

  useEffect(() => {
    if (!acceso) return;
    let raf = 0;
    let ultimo = 0;
    const r = (n: number) => Math.round(n);
    const giro = (ora: number) => {
      raf = requestAnimationFrame(giro);
      if (ora - ultimo < 100) return;
      ultimo = ora;
      const vv = window.visualViewport;
      const de = document.documentElement;
      const nav = document.querySelector("nav.fixed")?.getBoundingClientRect();
      const fissa = sondaFissa.current?.getBoundingClientRect();
      const safe = sondaSafe.current ? getComputedStyle(sondaSafe.current) : null;
      setTesto(
        [
          `path ${location.pathname}`,
          `innerH ${innerHeight}  clientH ${de.clientHeight}  screenH ${screen.height}`,
          `vv h ${vv ? r(vv.height) : "-"}  top ${vv ? r(vv.offsetTop) : "-"}  pageTop ${vv ? r(vv.pageTop) : "-"}  scale ${vv ? vv.scale.toFixed(2) : "-"}`,
          `scrollY ${r(scrollY)}  docH ${de.scrollHeight}  bodyH ${document.body.scrollHeight}`,
          `nav top ${nav ? r(nav.top) : "-"}  bottom ${nav ? r(nav.bottom) : "-"}`,
          `fixed bottom:0 → ${fissa ? r(fissa.bottom) : "-"}`,
          `100dvh ${sondaDvh.current?.offsetHeight ?? "-"}`,
          `safe top ${safe?.paddingTop}  bottom ${safe?.paddingBottom}`,
        ].join("\n"),
      );
    };
    raf = requestAnimationFrame(giro);
    return () => cancelAnimationFrame(raf);
  }, [acceso]);

  if (!acceso) return null;
  return (
    <>
      {/* Sonde invisibili: un elemento fisso in basso, uno alto 100dvh e uno
          con padding pari alle safe area. */}
      <div ref={sondaFissa} className="pointer-events-none fixed bottom-0 left-0 h-px w-px" />
      <div ref={sondaDvh} className="pointer-events-none absolute left-0 top-0 h-dvh w-px" />
      <div
        ref={sondaSafe}
        className="pointer-events-none fixed left-0 top-0 w-px pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
      />
      <pre className="pointer-events-none fixed left-2 top-[calc(env(safe-area-inset-top)+4px)] z-[100] whitespace-pre bg-black/80 p-2 font-mono text-[10px] leading-snug text-lime-300">
        {testo}
      </pre>
    </>
  );
}
