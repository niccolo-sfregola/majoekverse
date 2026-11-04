"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDict } from "./langProvider";
import { blowbrush } from "./fonts";
import { avviaPianeta, type Motore } from "./pianetaGL";

// Il pianeta 3D (vedi DESIGN.md). Vive in app/layout.tsx e non in una pagina:
// così il canvas WebGL nasce una volta sola e, cambiando pagina, cambia solo
// lo stato (data-stato), che il CSS (.pianeta in globals.css) anima:
// - "home": grande, in alto nella Home
// - "altrove": piccolo in alto a destra nelle altre pagine
// - "nascosto": in /universo, dove ci si è già "tuffati"
export default function Pianeta() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useDict();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motoreRef = useRef<Motore | null>(null);

  const stato =
    pathname === "/" ? "home" : pathname.startsWith("/universo") ? "nascosto" : "altrove";
  const nascosto = stato === "nascosto";

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

  // Da nascosto non serve disegnare: il motore si mette in pausa.
  useEffect(() => {
    motoreRef.current?.setAttivo(!nascosto);
  }, [nascosto]);

  const apri = () => {
    // Era un trascinamento col mouse, non un clic.
    if ((motoreRef.current?.ultimoTrascinamento() ?? 0) >= 6) return;
    router.push("/universo");
  };

  return (
    <div className="pianeta" data-stato={stato} aria-hidden={nascosto}>
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
