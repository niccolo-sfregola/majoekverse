import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getStreamStatus } from "@/lib/twitch";
import { getLatestVideo } from "@/lib/youtube";
import { blowbrush } from "./fonts";
import background from "@/public/background.png";
import LiveBlock from "./liveBlock";
import ScheduleCard from "./scheduleCard";

export default async function Home() {
  const supabase = await createClient();

  const liveStatus = await getStreamStatus();
  const ultimoVideo = await getLatestVideo();

  // Due letture dal database. select("*") prende tutte le colonne;
  // order() decide l'ordine delle righe.
  const { data: schedule } = await supabase
    .from("schedule")
    .select("*")
    .order("data", { ascending: true });

  const { data: news } = await supabase
    .from("news")
    .select("*")
    .order("created_at", { ascending: false });

  const prossimeDirette = (schedule ?? []).filter((item) => item.data);

  return (
    <main className="flex min-h-screen flex-col items-center pb-16">
      {/* Hero: immagine a tutta larghezza che sfuma nel fondo, titolo col font del logo.
          next/image la serve in formato moderno e nella misura giusta per lo schermo. */}
      <section className="relative w-full overflow-hidden">
        <Image
          src={background}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-fondo/20 via-brand-fondo/60 to-brand-fondo" />
        <div className="relative z-10 flex flex-col items-center gap-3 px-4 py-20 text-center md:py-28">
          <h1
            className={`${blowbrush.className} logo-title text-5xl md:text-7xl`}
          >
            maJoekverse
          </h1>
          <p className="max-w-md text-sm text-brand-crema/90 md:text-base">
            L&apos;app ufficiale di maJoekoto!
          </p>
        </div>
      </section>

      {/* Riga 1: Live + Schedule, compatte e affiancate anche su mobile.
          Riga 2: video YouTube e News, che prendono più spazio.
          -mt-* fa salire la griglia un po' sopra la sfumatura dell'hero. */}
      <div className="rise-in relative z-10 -mt-12 grid w-full max-w-5xl grid-cols-2 gap-3 px-4 md:-mt-16 md:gap-4">
        <LiveBlock initial={liveStatus} />

        <ScheduleCard items={prossimeDirette} />

        <div className="card-glass col-span-2 flex flex-col gap-2 p-5 md:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-lavanda">
            Ultimo video su YouTube
          </p>
          {ultimoVideo ? (
            <a
              href={ultimoVideo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ultimoVideo.thumbnail}
                alt=""
                className="aspect-video w-full rounded-lg object-cover"
              />
              <p className="text-brand-crema">{ultimoVideo.title}</p>
            </a>
          ) : (
            <p className="text-brand-lavanda">
              Nessun video da mostrare al momento.
            </p>
          )}
        </div>

        <div className="card-glass col-span-2 flex flex-col gap-2 p-5 md:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-lavanda">
            News &amp; eventi
          </p>
          <ul>
            {news?.map((item) => (
              <li key={item.id} className="flex items-start gap-3 py-2">
                <span className="text-xl">{item.icona}</span>
                <div className="flex-1">
                  <p className="text-brand-crema">{item.titolo}</p>
                  <p className="whitespace-pre-line text-brand-lavanda">
                    {item.testo}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
