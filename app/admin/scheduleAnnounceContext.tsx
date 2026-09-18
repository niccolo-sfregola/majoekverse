"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// Segnale condiviso: RowForm/DeleteButton "avvisano" quando una riga della
// schedule è stata salvata o eliminata; ScheduleAnnouncePrompt (che vive
// fuori dalla riga, quindi sopravvive anche se la riga viene cancellata)
// se ne accorge e controlla se c'è qualcosa da annunciare su Discord.
type Ctx = { tick: number; notify: () => void };
const ScheduleAnnounceContext = createContext<Ctx | null>(null);

export function ScheduleAnnounceProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [tick, setTick] = useState(0);
  return (
    <ScheduleAnnounceContext.Provider
      value={{ tick, notify: () => setTick((t) => t + 1) }}
    >
      {children}
    </ScheduleAnnounceContext.Provider>
  );
}

export function useNotifyScheduleChanged(): () => void {
  const ctx = useContext(ScheduleAnnounceContext);
  return ctx?.notify ?? (() => {});
}

export function useScheduleAnnounceTick(): number {
  const ctx = useContext(ScheduleAnnounceContext);
  return ctx?.tick ?? 0;
}
