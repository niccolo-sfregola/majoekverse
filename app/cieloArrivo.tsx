"use client";

import { usePathname } from "next/navigation";

// Lo zoom del cielo segue la pagina (CSS in .cielo-zoom, globals.css):
// - in Home il cielo è un po' "vicino", attorno al pianeta grande;
// - nelle altre pagine si allontana insieme al pianeta che rimpicciolisce
//   (stessa durata e curva), e tornando alla Home si riavvicina;
// - arrivando nell'Universo (dopo il tuffo) parte "vicinissimo" e si
//   assesta (.cielo-arrivo): la classe c'è solo in /universo, quindi
//   entrando viene aggiunta e l'animazione riparte ogni volta.
export default function CieloArrivo({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const universo = pathname.startsWith("/universo");
  return (
    <div
      className={`cielo-zoom ${universo ? "cielo-arrivo" : ""}`}
      data-home={pathname === "/" ? "" : undefined}
    >
      {children}
    </div>
  );
}
