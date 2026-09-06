import { blowbrush } from "@/app/fonts";

export const metadata = { title: "Offline · maJoekverse" };

export default function Offline() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="text-5xl">🛰️</div>
      <h1
        className={`${blowbrush.className} text-3xl tracking-wide text-brand-crema`}
      >
        Sei offline
      </h1>
      <p className="text-brand-lavanda">
        Non c&apos;è connessione. Riprova quando torni online. Le pagine già
        viste restano disponibili.
      </p>
    </main>
  );
}
