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
  { x: "-2%", c: "var(--pianeta-lava-giallo)", d: "0ms" },
  { x: "18%", c: "var(--pianeta-lava-arancio)", d: "40ms" },
  { x: "38%", c: "var(--pianeta-lava)", d: "80ms" },
  { x: "58%", c: "var(--pianeta-viola)", d: "120ms" },
  { x: "78%", c: "var(--pianeta-viola-scuro)", d: "160ms" },
];

type Transizione = {
  vai: (href: string) => void;
  // La pagina verso cui si sta andando, o null: le nav la usano per
  // evidenziare la voce cliccata senza aspettare il cambio vero.
  destinazione: string | null;
};

const TransizioneContext = createContext<Transizione>({
  vai: () => {},
  destinazione: null,
});

export function useTransizione() {
  return useContext(TransizioneContext);
}

export function TransizioneProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [destinazione, setDestinazione] = useState<string | null>(null);
  const timer = useRef<number[]>([]);

  useEffect(() => () => timer.current.forEach(clearTimeout), []);

  const vai = useCallback(
    (href: string) => {
      // Una transizione alla volta, e niente strisce per restare dove si è.
      if (destinazione || href === pathname) return;
      // Movimento ridotto: si cambia pagina e basta.
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(href);
        return;
      }
      setDestinazione(href);
      router.prefetch(href);
      timer.current = [
        window.setTimeout(() => router.push(href), CAMBIO_MS),
        window.setTimeout(() => setDestinazione(null), FINE_MS),
      ];
    },
    [destinazione, pathname, router],
  );

  return (
    <TransizioneContext.Provider value={{ vai, destinazione }}>
      {children}
      {destinazione ? (
        <div aria-hidden className="strisce">
          {STRISCE.map((s) => (
            <div
              key={s.x}
              className="striscia"
              style={{ left: s.x, background: s.c, animationDelay: s.d }}
            />
          ))}
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
