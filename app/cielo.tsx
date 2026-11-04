"use client";

import { useEffect, useRef } from "react";
import CieloArrivo from "./cieloArrivo";

// Cielo stellato fisso dietro tutta l'app (vedi DESIGN.md). Le stelle sono
// generate con un seme fisso (stesso cielo per tutti, niente Math.random()),
// e circa il 30% brilla, ognuna per conto suo con un ciclo di 3.6s.
//
// Si disegna su un <canvas> 2D invece che in SVG: far brillare ~130 stelle
// una per una in un SVG costringe il browser a ridisegnare tutto il cielo a
// ogni fotogramma; sul canvas sono 420 puntini, pochissimo lavoro.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 420 stelle; sul telefono si disegnano solo le prime 260.
const TOTALE = 420;
const SUL_TELEFONO = 260;
const TINTE = ["--crema", "--crema", "--crema", "--lavanda", "--pesca"];
const CICLO = 3.6; // secondi per un "brillio" completo
const FPS = 30; // brillano piano: 30 fotogrammi al secondo bastano

type Stella = {
  x: number; // 0-100, come una viewBox 100×100
  y: number;
  r: number;
  o: number; // opacità per le stelle fisse
  tinta: string;
  brilla: boolean;
  fase: number; // secondi di sfasamento del brillio
};

const STELLE: Stella[] = (() => {
  const rand = mulberry32(77);
  return Array.from({ length: TOTALE }, () => {
    const u = rand();
    return {
      x: rand() * 100,
      y: rand() * 100,
      // u² fa sì che le stelle grandi siano poche.
      r: 0.04 + u * u * 0.13,
      o: 0.3 + rand() * 0.6,
      tinta: TINTE[Math.floor(rand() * TINTE.length)],
      brilla: rand() < 0.3,
      fase: rand() * 4,
    };
  });
})();

export default function Cielo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const fermo = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // I colori vengono dai token in globals.css.
    const stile = getComputedStyle(document.documentElement);
    const colori = Object.fromEntries(
      TINTE.map((v) => [v, stile.getPropertyValue(v).trim() || "#F6ECD8"]),
    );

    let w = 0;
    let h = 0;
    let quante = TOTALE;
    const misura = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      quante = innerWidth < 768 ? SUL_TELEFONO : TOTALE;
    };

    // Come un SVG con preserveAspectRatio="xMidYMid slice": la viewBox
    // 100×100 copre tutto il canvas, centrata.
    const disegna = (secondi: number) => {
      const scala = Math.max(w, h) / 100;
      const dx = (w - 100 * scala) / 2;
      const dy = (h - 100 * scala) / 2;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < quante; i++) {
        const s = STELLE[i];
        // Brillio: da 0.15 a 0.95 e ritorno, morbido (coseno).
        ctx.globalAlpha =
          s.brilla && !fermo
            ? 0.15 + 0.8 * (0.5 - 0.5 * Math.cos((2 * Math.PI * (secondi + s.fase)) / CICLO))
            : s.o;
        ctx.fillStyle = colori[s.tinta];
        ctx.beginPath();
        ctx.arc(dx + s.x * scala, dy + s.y * scala, s.r * scala, 0, 2 * Math.PI);
        ctx.fill();
      }
    };

    let raf = 0;
    let ultimo = 0;
    const fotogramma = (ora: number) => {
      raf = requestAnimationFrame(fotogramma);
      if (ora - ultimo < 1000 / FPS) return;
      ultimo = ora;
      disegna(ora / 1000);
    };
    const avvia = () => {
      if (fermo || raf || document.hidden) return;
      raf = requestAnimationFrame(fotogramma);
    };
    const ferma = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    misura();
    disegna(0);
    avvia();

    const onResize = () => {
      misura();
      disegna(performance.now() / 1000);
    };
    // Scheda nascosta: niente disegno.
    const onVisibilita = () => (document.hidden ? ferma() : avvia());
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibilita);
    return () => {
      ferma();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilita);
    };
  }, []);

  return (
    <div aria-hidden className="cielo">
      <CieloArrivo>
        <canvas ref={canvasRef} className="h-full w-full" />
      </CieloArrivo>
    </div>
  );
}
