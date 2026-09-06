"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "sponsor-logos";

// Campo "logo" con caricamento file (foto/galleria da telefono). Il file va
// nello Storage di Supabase; nel form viene inviato solo l'URL pubblico.
export default function SponsorLogoField({
  name,
  label,
  current,
}: {
  name: string;
  label: string;
  current?: string;
}) {
  const [url, setUrl] = useState(current ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      setUrl(data.publicUrl);
    } catch {
      setError("Caricamento fallito. Controlla connessione e riprova.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-brand-fondo/40 p-3">
      <span className="text-sm text-brand-crema">{label}</span>
      <input type="hidden" name={name} value={url} />
      <div className="flex items-center gap-3">
        {url ? (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-brand-crema p-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt=""
              className="max-h-full max-w-full object-contain"
            />
          </span>
        ) : null}
        <label className="cursor-pointer rounded-lg border border-brand-lavanda/25 bg-brand-fondo/60 px-3 py-2 text-sm font-semibold text-brand-crema transition hover:border-brand-lavanda/45 active:scale-[0.98]">
          {busy ? "Carico…" : url ? "Cambia" : "Carica immagine"}
          <input
            type="file"
            accept="image/*"
            onChange={onFile}
            disabled={busy}
            className="hidden"
          />
        </label>
        {url ? (
          <button
            type="button"
            onClick={() => setUrl("")}
            className="text-xs text-brand-lavanda transition-colors hover:text-brand-crema"
          >
            Rimuovi
          </button>
        ) : null}
      </div>
      {error ? <span className="text-sm text-brand-corallo">{error}</span> : null}
    </div>
  );
}
