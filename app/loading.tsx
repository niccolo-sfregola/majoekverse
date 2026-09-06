// Mostrato subito a ogni navigazione mentre la pagina di destinazione carica
// i suoi dati sul server. Senza questo, al click non succede niente per un po'.
export default function Loading() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-4 px-4 py-10">
      <div className="h-9 w-44 self-center rounded-lg bg-brand-darkblu/40 motion-safe:animate-pulse" />
      <div className="h-24 rounded-2xl bg-brand-darkblu/40 motion-safe:animate-pulse" />
      <div className="h-40 rounded-2xl bg-brand-darkblu/40 motion-safe:animate-pulse" />
      <div className="h-40 rounded-2xl bg-brand-darkblu/40 motion-safe:animate-pulse" />
    </div>
  );
}
