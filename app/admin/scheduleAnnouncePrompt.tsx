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

  useEffect(() => {
    if (!tick) return;
    let cancelled = false;
    setResult(null);
    setChanges(null);
    previewScheduleChanges().then((c) => {
      if (!cancelled) setChanges(c);
    });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  if (result) {
    return <span className="text-sm text-brand-lavanda">{result}</span>;
  }
  if (!changes || changes.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-brand-fondo/60 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-lavanda">
        📢 Pubblicare questa modifica su Discord?
      </p>
      <pre className="whitespace-pre-wrap text-sm text-brand-crema">
        {changes.map(changeLine).join("\n")}
      </pre>
      <div className="flex gap-2">
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
          className="rounded-lg bg-brand-blu px-3 py-1.5 text-sm font-semibold text-brand-crema transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
        >
          {sending ? "Invio…" : "📢 Pubblica su Discord"}
        </button>
        <button
          type="button"
          onClick={() => setChanges(null)}
          className="rounded-lg border border-brand-lavanda/30 px-3 py-1.5 text-sm text-brand-lavanda transition hover:bg-brand-lavanda/10"
        >
          Non ora
        </button>
      </div>
    </div>
  );
}
