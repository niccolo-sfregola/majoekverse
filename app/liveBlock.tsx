"use client";

import { useEffect, useState } from "react";
import type { LiveStatus } from "@/lib/twitch";

const TWITCH_URL = "https://www.twitch.tv/majoekoto";

// Riceve lo stato calcolato sul server (niente "flash"), poi lo ricontrolla
// da solo ogni 60 secondi chiamando /api/live.
export default function LiveBlock({ initial }: { initial: LiveStatus }) {
  const [status, setStatus] = useState(initial);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/live");
        if (res.ok) setStatus(await res.json());
      } catch {
        // rete assente: teniamo l'ultimo stato noto
      }
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  if (status.isLive) {
    return (
      <div className="card-sheen flex flex-col gap-2 rounded-2xl bg-brand-crema p-4 text-brand-fondo shadow-[0_10px_34px_rgb(0_0_0/0.3)] md:p-5">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#e11d2f]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e11d2f] opacity-75 motion-reduce:hidden" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#e11d2f]" />
          </span>
          In diretta ora
        </p>
        {status.game ? <p className="truncate font-medium">{status.game}</p> : null}
        {status.title ? (
          <p className="line-clamp-2 text-sm text-brand-fondo/70">{status.title}</p>
        ) : null}
        <a
          href={TWITCH_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto rounded-xl bg-brand-corallo p-2 text-center font-semibold text-brand-crema transition hover:brightness-95 active:scale-[0.98]"
        >
          Guarda su Twitch →
        </a>
      </div>
    );
  }

  return (
    <div className="card-glass flex flex-col gap-2 p-4 md:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-lavanda">
        Al momento offline
      </p>
      <p className="text-brand-crema">Nessuna diretta in corso.</p>
      <a
        href={TWITCH_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto font-semibold text-brand-corallo transition-opacity hover:opacity-80"
      >
        Vai al canale
      </a>
    </div>
  );
}
