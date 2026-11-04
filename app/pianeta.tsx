"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useDict } from "./langProvider";
import { blowbrush } from "./fonts";
import { avviaPianeta, type Motore } from "./pianetaGL";
import { useTransizione } from "./transizione";

// Il pianeta 3D (vedi DESIGN.md). Vive in app/layout.tsx e non in una pagina:
// così il canvas WebGL nasce una volta sola e, cambiando pagina, cambia solo
// lo stato (data-stato), che il CSS (.pianeta in globals.css) anima:
// - "home": grande, in alto nella Home
// - "altrove": piccolo in alto a destra nelle altre pagine
// - "nascosto": tuffato, cioè centrato sullo schermo, enorme e trasparente.
//   Vale durante il tuffo e in /universo; tornando alla Home il CSS fa da
//   solo il percorso inverso.
export default function Pianeta() {
  const pathname = usePathname();
  const t = useDict();
  const { tuffo, tuffando } = useTransizione();
  const divRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motoreRef = useRef<Motore | null>(null);

  const stato =
    tuffando || pathname.startsWith("/universo")
      ? "nascosto"
      : pathname === "/"
        ? "home"
        : "altrove";
  const nascosto = stato === "nascosto";

  // Prima del tuffo (useLayoutEffect: prima che il browser disegni) si calcola
  // lo spostamento che porta il centro del pianeta al centro dello schermo.
  // Il CSS lo usa come translate(var(--tuffo-x), var(--tuffo-y)) scale(7).
  useLayoutEffect(() => {
    if (nascosto && divRef.current) centraTuffo(divRef.current);
  }, [nascosto]);

  // Avvio del motore al primo montaggio, spegnimento allo smontaggio.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const motore = avviaPianeta(canvas, blowbrush.style.fontFamily);
    motoreRef.current = motore;
    return () => {
      motore?.stop();
      motoreRef.current = null;
    };
  }, []);

  // Da nascosto non serve disegnare: il motore si mette in pausa, ma solo
  // dopo il tuffo (1.2s), così la lava continua a muoversi mentre si ingrandisce.
  useEffect(() => {
    if (!nascosto) {
      motoreRef.current?.setAttivo(true);
      return;
    }
    const id = window.setTimeout(() => motoreRef.current?.setAttivo(false), 1200);
    return () => clearTimeout(id);
  }, [nascosto]);

  const apri = () => {
    // Era un trascinamento col mouse, non un clic.
    if ((motoreRef.current?.ultimoTrascinamento() ?? 0) >= 6) return;
    tuffo();
  };

  return (
    <div ref={divRef} className="pianeta" data-stato={stato} aria-hidden={nascosto}>
      <button
        type="button"
        onClick={apri}
        aria-label={t.nav.universo}
        tabIndex={nascosto ? -1 : 0}
        className="pianeta-bottone"
      >
        <canvas ref={canvasRef} />
      </button>
    </div>
  );
}

// Il pianeta è trasformato con origine nell'angolo in alto a destra (O):
// un punto p finisce in O + t + 7·(p − O). Perché il centro (O + (−w/2, h/2))
// arrivi al centro dello schermo, t = centro schermo − O + (3.5w, −3.5h).
// offsetLeft/Top danno la posizione senza trasformazioni, nella pagina.
function centraTuffo(el: HTMLElement) {
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const ox = el.offsetLeft + w;
  const oy = el.offsetTop;
  const tx = window.scrollX + window.innerWidth / 2 - ox + 3.5 * w;
  const ty = window.scrollY + window.innerHeight / 2 - oy - 3.5 * h;
  el.style.setProperty("--tuffo-x", `${tx}px`);
  el.style.setProperty("--tuffo-y", `${ty}px`);
}
