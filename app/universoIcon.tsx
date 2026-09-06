"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Generatore pseudo-casuale con seme: stessa sequenza sul server e sul client,
// così l'SVG generato è identico e React non si lamenta in idratazione.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Particle = { x: number; y: number; r: number; o: number; c: string };

// ~460 particelle: due bracci a spirale + rigonfiamento centrale + polvere sparsa.
function buildGalaxy(): Particle[] {
  const rand = mulberry32(20240915);
  const cx = 50;
  const cy = 50;
  const maxR = 45;
  const turns = 1.15;
  const armPalette = ["#ffffff", "#F6ECD8", "#ffffff", "#e6dbff", "#ffd8c6", "#dfe7ff"];
  const out: Particle[] = [];

  const push = (x: number, y: number, r: number, o: number, c: string) =>
    out.push({
      x: +x.toFixed(2),
      y: +y.toFixed(2),
      r: +r.toFixed(2),
      o: +o.toFixed(2),
      c,
    });

  // Bracci
  for (let arm = 0; arm < 2; arm++) {
    const baseRot = arm * Math.PI;
    for (let i = 0; i < 155; i++) {
      const t = Math.pow(rand(), 0.7);
      const radius = 3 + t * maxR;
      const angle = baseRot + t * turns * Math.PI * 2;
      const jitterR = (rand() + rand() + rand() - 1.5) * (2 + t * 5);
      const jitterA = (rand() - 0.5) * 0.5 * (1 - t * 0.4);
      const x = cx + Math.cos(angle + jitterA) * (radius + jitterR);
      const y = cy + Math.sin(angle + jitterA) * (radius + jitterR);
      push(
        x,
        y,
        0.18 + rand() * (t < 0.35 ? 0.85 : 0.5),
        0.25 + rand() * 0.6,
        armPalette[Math.floor(rand() * armPalette.length)],
      );
    }
  }

  // Rigonfiamento centrale (bulge)
  for (let i = 0; i < 95; i++) {
    const t = Math.pow(rand(), 2);
    const radius = t * 13;
    const angle = rand() * Math.PI * 2;
    push(
      cx + Math.cos(angle) * radius,
      cy + Math.sin(angle) * radius,
      0.22 + rand() * 0.85,
      0.4 + rand() * 0.6,
      rand() < 0.72 ? "#ffffff" : "#F6ECD8",
    );
  }

  // Polvere di fondo
  for (let i = 0; i < 60; i++) {
    const t = Math.sqrt(rand());
    const radius = t * maxR;
    const angle = rand() * Math.PI * 2;
    push(
      cx + Math.cos(angle) * radius,
      cy + Math.sin(angle) * radius,
      0.13 + rand() * 0.4,
      0.12 + rand() * 0.33,
      "#dfe7ff",
    );
  }

  return out;
}

const GALAXY = buildGalaxy();

export default function Planet() {
  const pathname = usePathname();

  if (pathname === "/universo") {
    return null;
  }

  return (
    <Link
      href="/universo"
      aria-label="Esplora l'universo di Joe"
      className="group fixed right-4 top-4 z-20 flex items-center md:bottom-4 md:top-auto"
    >
      {/* Etichetta: solo desktop, compare al passaggio del mouse. */}
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full border border-brand-crema/15 bg-brand-fondo/80 px-3 py-1.5 text-sm text-brand-crema opacity-0 shadow-lg backdrop-blur-md transition-all duration-200 group-hover:opacity-100 md:block md:translate-x-2 md:group-hover:translate-x-0">
        Esplora l&apos;universo di Joe!
      </span>

      {/* Galassia a particelle che ruota lentamente (vedi .universo-galaxy). */}
      <span className="universo-galaxy relative h-12 w-12 overflow-hidden rounded-full transition-transform duration-200 group-hover:scale-110">
        <svg
          viewBox="0 0 100 100"
          className="universo-galaxy-svg absolute inset-0 h-full w-full"
          aria-hidden
        >
          <defs>
            <radialGradient id="galaxy-core">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="28%" stopColor="#F6ECD8" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#B9A8E6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#B9A8E6" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx="50" cy="50" r="34" fill="url(#galaxy-core)" />

          {GALAXY.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={p.c} opacity={p.o} />
          ))}
        </svg>
      </span>
    </Link>
  );
}
