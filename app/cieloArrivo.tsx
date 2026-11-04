"use client";

import { usePathname } from "next/navigation";

// Arrivando nell'Universo (dopo il tuffo) il cielo parte "vicino" e si
// assesta (.cielo-arrivo in globals.css). La classe c'è solo in /universo:
// entrando viene aggiunta e l'animazione riparte ogni volta.
export default function CieloArrivo({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className={`absolute inset-0 ${pathname.startsWith("/universo") ? "cielo-arrivo" : ""}`}>
      {children}
    </div>
  );
}
