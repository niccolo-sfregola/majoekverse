"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { previewScheduleChanges, announceScheduleChanges } from "./actions";
import { changeLine, type ScheduleChange } from "@/lib/schedule-diff";
import { useScheduleAnnounceTick } from "./scheduleAnnounceContext";

// Vive nella sezione Schedule (non dentro la singola riga: così sopravvive
// anche quando la riga viene eliminata). Ogni volta che RowForm/DeleteButton
// avvisano di un salvataggio/eliminazione riuscito (vedi useNotifyScheduleChanged),
// controlla se c'è qualcosa di nuovo da annunciare su Discord e mostra un
// riquadro col dettaglio + un bottone per pubblicare (o ignorare).
export default function ScheduleAnnouncePrompt() {
  const tick = useScheduleAnnounceTick();
  const router = useRouter();
  const [changes, setChanges] = useState<ScheduleChange[] | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // A ogni nuovo salvataggio (tick cambiato) si riparte puliti. Si fa durante
  // il render, confrontando col tick visto l'ultima volta, e non dentro
  // l'effetto: lì un setState immediato farebbe un render in più a vuoto.
  const [tickVisto, setTickVisto] = useState(tick);
  if (tick !== tickVisto) {
    setTickVisto(tick);
    setResult(null);
    setChanges(null);
  }

  useEffect(() => {
    if (!tick) return;
    let cancelled = false;
    previewScheduleChanges().then((c) => {
      if (!cancelled) setChanges(c);
    });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  if (result) {
    return <span className="text-sm text-brand-lavanda-chiara">{result}</span>;
  }
  if (!changes || changes.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 border border-brand-lavanda bg-brand-fondo p-3">
      <p className="font-bold text-brand-lavanda">Pubblicare questa modifica su Discord?</p>
      <pre className="whitespace-pre-wrap text-sm text-brand-crema">
        {changes.map(changeLine).join("\n")}
      </pre>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={sending}
          onClick={async () => {
            setSending(true);
            const esito = await announceScheduleChanges(null, new FormData());
            setSending(false);
            setResult(esito?.message ?? null);
            router.refresh();
          }}
          className="bottone-secondario"
        >
          {sending ? "Invio…" : "Pubblica su Discord"}
        </button>
        <button
          type="button"
          onClick={() => setChanges(null)}
          className="link-azione text-brand-lavanda"
        >
          Non ora
        </button>
      </div>
    </div>
  );
}
