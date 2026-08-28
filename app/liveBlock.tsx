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
      <div
        className="flex-1 flex flex-col gap-2 rounded-xl p-4"
        style={{ backgroundColor: "#EF6C4E" }}
      >
        <p className="font-semibold" style={{ color: "#F6ECD8" }}>
          🔴 In diretta ora
        </p>
        {status.game ? (
          <p style={{ color: "#F6ECD8" }}>{status.game}</p>
        ) : null}
        {status.title ? (
          <p className="text-sm" style={{ color: "#F6ECD8" }}>
            {status.title}
          </p>
        ) : null}
        <a
          href={TWITCH_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl p-2 text-center bg-brand-darkblu"
          style={{ color: "#F6ECD8" }}
        >
          Guarda su Twitch →
        </a>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-2 rounded-xl p-4 bg-brand-darkblu">
      <p className="font-semibold" style={{ color: "#F6ECD8" }}>
        Al momento offline
      </p>
      <p style={{ color: "#B9A8E6" }}>
        Guarda lo schedule qui accanto per la prossima diretta.
      </p>
      <a href={TWITCH_URL} target="_blank" rel="noopener noreferrer" style={{ color: "#B9A8E6" }}>
        Vai al canale
      </a>
    </div>
  );
}
