"use client";

import { useEffect, useState } from "react";
import type { LiveStatus } from "@/lib/twitch";
import { inizioDiretta } from "@/lib/schedule";
import { useDict } from "./langProvider";
import { useTransizione } from "./transizione";
import Button from "./button";
import Pannello from "./pannello";

const TWITCH_URL = "https://www.twitch.tv/majoekoto";

type Diretta = { data: string; orario: string };

// Blocco in cima alla Home: conto alla rovescia verso la prossima diretta
// vera della schedule, oppure "In diretta ora" se Joe è live. Lo stato live
// arriva dal server (niente "flash") e poi si ricontrolla ogni 60 secondi.
export default function ProssimaDiretta({
  initial,
  prossime,
}: {
  initial: LiveStatus;
  prossime: Diretta[];
}) {
  const t = useDict();
  const { tuffo } = useTransizione();
  const [status, setStatus] = useState(initial);
  const [ora, setOra] = useState(() => Date.now());

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

  // Il conto alla rovescia avanza ogni secondo (solo se c'è qualcosa da contare).
  const conta = !status.isLive && prossime.length > 0;
  useEffect(() => {
    if (!conta) return;
    const id = setInterval(() => setOra(Date.now()), 1000);
    return () => clearInterval(id);
  }, [conta]);

  // La prima diretta che deve ancora iniziare (quelle di oggi già partite no).
  const prossima = prossime
    .map((d) => inizioDiretta(d.data, d.orario).getTime())
    .find((inizio) => inizio > ora);

  const esplora = (className: string) => (
    <button type="button" onClick={tuffo} className={`link-azione ${className}`}>
      {t.home.explore}
      <svg
        aria-hidden
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--lavanda)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lg:hidden"
      >
        <path d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );

  return (
    <div className="flex flex-col gap-5">
      <Pannello soloTelefono className="flex flex-col gap-2 p-[18px] lg:p-0">
        {status.isLive ? (
          <>
            <p className="flex items-center gap-2 font-bold text-brand-corallo">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-corallo opacity-75 motion-reduce:hidden" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-corallo" />
              </span>
              {t.live.liveNow}
            </p>
            {status.game ? (
              <p className="truncate text-2xl font-bold text-brand-neon-testo lg:text-4xl">
                {status.game}
              </p>
            ) : null}
            {status.title ? (
              <p className="line-clamp-2 text-brand-lavanda-chiara">{status.title}</p>
            ) : null}
          </>
        ) : prossima ? (
          <>
            <p className="text-brand-lavanda-chiara">{t.live.nextIn}</p>
            {/* suppressHydrationWarning: il server conta con il suo orologio,
                il browser col suo, quindi i secondi possono non coincidere. */}
            <p
              suppressHydrationWarning
              className="text-[32px] font-bold tabular-nums text-brand-neon-testo [text-shadow:0_0_12px_var(--neon-alone)] lg:text-[46px] lg:[text-shadow:0_0_16px_var(--neon-alone)]"
            >
              {formatta(prossima - ora, t.live.days)}
            </p>
          </>
        ) : (
          <p className="text-brand-lavanda-chiara">{t.live.offline}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-6">
          <Button href={TWITCH_URL}>{status.isLive ? t.live.watch : t.live.goToChannel}</Button>
          {esplora("hidden lg:inline-flex lg:underline lg:underline-offset-[5px]")}
        </div>
      </Pannello>
      {esplora("w-full justify-between lg:hidden")}
    </div>
  );
}

// 192_000_000 ms -> "2g 05:20:00"; sotto il giorno solo "05:20:00".
function formatta(ms: number, giorni: string) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const g = Math.floor(s / 86400);
  const due = (n: number) => String(n).padStart(2, "0");
  const hms = `${due(Math.floor(s / 3600) % 24)}:${due(Math.floor(s / 60) % 60)}:${due(s % 60)}`;
  return g ? `${g}${giorni} ${hms}` : hms;
}
