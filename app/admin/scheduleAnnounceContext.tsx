"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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
  // notify deve restare la STESSA funzione tra un render e l'altro: chi la usa
  // la mette nelle dipendenze di un useEffect, e se cambiasse a ogni render
  // l'effetto ripartirebbe all'infinito (notify → render → nuovo notify → ...).
  const notify = useCallback(() => setTick((t) => t + 1), []);
  const value = useMemo(() => ({ tick, notify }), [tick, notify]);
  return (
    <ScheduleAnnounceContext.Provider value={value}>
      {children}
    </ScheduleAnnounceContext.Provider>
  );
}

const noop = () => {};

export function useNotifyScheduleChanged(): () => void {
  const ctx = useContext(ScheduleAnnounceContext);
  return ctx?.notify ?? noop;
}

export function useScheduleAnnounceTick(): number {
  const ctx = useContext(ScheduleAnnounceContext);
  return ctx?.tick ?? 0;
}
