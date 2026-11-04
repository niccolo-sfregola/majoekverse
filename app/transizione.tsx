"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// Cambio pagina con cinque strisce diagonali (vedi DESIGN.md):
// 1. al clic partono le strisce e la nav sposta subito l'indicatore;
// 2. a 430ms, con lo schermo coperto, si cambia davvero pagina;
// 3. a 1.1s le strisce sono uscite e si toglie lo strato.
// La pagina nuova non aspetta i dati: grazie a loading.tsx compare subito
// con gli scheletri, quindi sotto le strisce c'è sempre qualcosa.
const CAMBIO_MS = 430;
const FINE_MS = 1100;

// Colori del pianeta in scala, dal più chiaro al più scuro: la lava (giallo,
// arancio, fuoco) e poi le bande viola della superficie.
const STRISCE = [
  { c: "var(--pianeta-lava-giallo)", d: "0ms" },
  { c: "var(--pianeta-lava-arancio)", d: "25ms" },
  { c: "var(--pianeta-lava)", d: "50ms" },
  { c: "var(--pianeta-viola)", d: "75ms" },
  { c: "var(--pianeta-viola-scuro)", d: "100ms" },
];

// Tuffo nell'Universo (vedi DESIGN.md): il pianeta si centra e si ingrandisce
// (CSS in .pianeta[data-stato="nascosto"]), da 0.25s partono i raggi di
// stelle, da 0.6s sale il lampo lavanda e a ~1s, con lo schermo coperto dal
// lampo, si apre /universo. A 1.7s lo strato se ne va.
const TUFFO_CAMBIO_MS = 1020;
const TUFFO_FINE_MS = 1700;

// 28 raggi tutto intorno, con partenze sfalsate fra 250 e 530ms.
const RAGGI = Array.from({ length: 28 }, (_, k) => ({
  angolo: `${(k * 360) / 28}deg`,
  ritardo: `${250 + ((k * 7) % 5) * 70}ms`,
}));

type Fase = { tipo: "strisce" | "tuffo"; href: string };

type Transizione = {
  vai: (href: string) => void;
  tuffo: () => void;
  // Dall'Universo alla Home: niente strisce, il pianeta fa il percorso
  // inverso del tuffo da solo (tornando nello stato "home").
  torna: () => void;
  // La pagina verso cui si sta andando, o null: le nav la usano per
  // evidenziare la voce cliccata senza aspettare il cambio vero.
  destinazione: string | null;
  // true durante il tuffo: il pianeta parte subito, prima del cambio pagina.
  tuffando: boolean;
};

const TransizioneContext = createContext<Transizione>({
  vai: () => {},
  tuffo: () => {},
  torna: () => {},
  destinazione: null,
  tuffando: false,
});

export function useTransizione() {
  return useContext(TransizioneContext);
}

export function TransizioneProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [fase, setFase] = useState<Fase | null>(null);
  const timer = useRef<number[]>([]);

  useEffect(() => () => timer.current.forEach(clearTimeout), []);

  // Una transizione alla volta, e niente transizione per restare dove si è.
  // Con movimento ridotto si cambia pagina e basta.
  const avvia = useCallback(
    (tipo: Fase["tipo"], href: string, cambioMs: number, fineMs: number) => {
      if (fase || href === pathname) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(href);
        return;
      }
      setFase({ tipo, href });
      router.prefetch(href);
      timer.current = [
        window.setTimeout(() => router.push(href), cambioMs),
        window.setTimeout(() => setFase(null), fineMs),
      ];
    },
    [fase, pathname, router],
  );

  const vai = useCallback(
    (href: string) => avvia("strisce", href, CAMBIO_MS, FINE_MS),
    [avvia],
  );
  const tuffo = useCallback(
    () => avvia("tuffo", "/universo", TUFFO_CAMBIO_MS, TUFFO_FINE_MS),
    [avvia],
  );
  const torna = useCallback(() => {
    if (!fase) router.push("/");
  }, [fase, router]);

  return (
    <TransizioneContext.Provider
      value={{
        vai,
        tuffo,
        torna,
        destinazione: fase?.href ?? null,
        tuffando: fase?.tipo === "tuffo",
      }}
    >
      {children}
      {fase?.tipo === "strisce" ? (
        <div aria-hidden className="strisce">
          {/* --i = posizione della striscia: il CSS calcola da lì dove sta. */}
          {STRISCE.map((s, i) => (
            <div
              key={i}
              className="striscia"
              style={{ "--i": i, background: s.c, animationDelay: s.d } as React.CSSProperties}
            />
          ))}
        </div>
      ) : null}
      {fase?.tipo === "tuffo" ? (
        <div aria-hidden className="tuffo">
          {RAGGI.map((r) => (
            <div key={r.angolo} className="tuffo-raggio-rot" style={{ rotate: r.angolo }}>
              <div className="tuffo-raggio" style={{ animationDelay: r.ritardo }} />
            </div>
          ))}
          <div className="tuffo-lampo" />
        </div>
      ) : null}
    </TransizioneContext.Provider>
  );
}

// Come <Link>, ma passa dalle strisce. Ctrl/Cmd+clic e "apri in nuova
// scheda" funzionano come sempre: onNavigate scatta solo per la navigazione
// interna dell'app.
export function TransLink({
  href,
  ...props
}: Omit<React.ComponentProps<typeof Link>, "href"> & { href: string }) {
  const { vai } = useTransizione();
  return (
    <Link
      {...props}
      href={href}
      onNavigate={(e) => {
        e.preventDefault();
        vai(href);
      }}
    />
  );
}
