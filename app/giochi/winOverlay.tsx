"use client";

import { useDict } from "@/app/langProvider";
import { blowbrush } from "@/app/fonts";

// Festa di fine partita, comune a tutti i giochi: la pagina si sfoca,
// compare "Hai vinto!", poi torna nitida. Si smonta a fine animazione
// (onAnimationEnd), non con un timer, così la durata sta solo nel CSS.
export default function WinOverlay({ onDone }: { onDone: () => void }) {
  const t = useDict();
  return (
    <div
      className="zip-win fixed inset-0 z-[70] grid place-items-center"
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget) onDone();
      }}
    >
      <p
        className={`${blowbrush.className} zip-win-text logo-title text-6xl md:text-8xl`}
      >
        {t.giochi.win}
      </p>
    </div>
  );
}
