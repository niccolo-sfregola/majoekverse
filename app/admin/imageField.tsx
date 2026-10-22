"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Lato più lungo delle foto caricate: abbastanza per uno schermo grande,
// molto più leggero delle foto originali del telefono (spesso 4000px, 5 MB).
const MAX_LATO = 1600;

// Rimpicciolisce la foto nel browser prima di caricarla (JPEG). Se il
// browser non riesce a leggerla (es. HEIC su Chrome) carichiamo l'originale.
async function rimpicciolisci(file: File): Promise<File> {
  try {
    const img = await createImageBitmap(file);
    const scala = Math.min(1, MAX_LATO / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scala);
    canvas.height = Math.round(img.height * scala);
    canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((ok) =>
      canvas.toBlob(ok, "image/jpeg", 0.85),
    );
    return blob ? new File([blob], "foto.jpg", { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
}

// Campo immagine con caricamento file (foto/galleria da telefono). Il file va
// nello Storage di Supabase; nel form viene inviato solo l'URL pubblico.
// variant "logo" = loghi sponsor (caricati così come sono, anche PNG
// trasparenti), "photo" = foto di news ed eventi (rimpicciolite).
export default function ImageField({
  name,
  label,
  current,
  bucket,
  variant,
}: {
  name: string;
  label: string;
  current?: string;
  bucket: string;
  variant: "logo" | "photo";
}) {
  const [url, setUrl] = useState(current ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Quando il form viene svuotato (dopo "Aggiungi"), svuota anche la foto.
  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    const onReset = () => setUrl(current ?? "");
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, [current]);

  // Un campo nascosto non genera eventi "input" da solo: lo lanciamo noi,
  // così il form si accorge del cambio (es. il contatore Discord).
  useEffect(() => {
    inputRef.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [url]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const original = e.target.files?.[0];
    if (!original) return;
    setBusy(true);
    setError("");
    try {
      const file = variant === "photo" ? await rimpicciolisci(original) : original;
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(bucket)
        .upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
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
      <input ref={inputRef} type="hidden" name={name} value={url} />
      <div className="flex items-center gap-3">
        {url ? (
          variant === "logo" ? (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-brand-crema p-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="max-h-full max-w-full object-contain"
              />
            </span>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt=""
              className="h-14 w-20 shrink-0 rounded-lg object-cover"
            />
          )
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
