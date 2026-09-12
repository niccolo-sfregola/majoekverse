import { Suspense } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getStreamStatus } from "@/lib/twitch";
import { getLatestVideo } from "@/lib/youtube";
import { isUpcoming } from "@/lib/schedule";
import { blowbrush } from "./fonts";
import background from "@/public/background.png";
import LiveBlock from "./liveBlock";
import ScheduleCard from "./scheduleCard";
import NewsList from "./newsList";

// items-start: ogni card prende solo l'altezza del suo contenuto, invece di
// stirarsi per pareggiare la più alta della sua riga (di griglia).
const GRID =
  "relative z-10 -mt-12 grid w-full max-w-5xl grid-cols-2 items-start gap-3 px-4 md:-mt-16 md:gap-4";
const CARD_LABEL =
  "text-xs font-semibold uppercase tracking-[0.18em] text-brand-lavanda";

// La pagina è sincrona: l'hero (senza dati) compare subito a ogni navigazione,
// mentre le card che dipendono da Twitch/YouTube/DB arrivano in streaming
// dentro il <Suspense>.
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center pb-16">
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

      <Suspense fallback={<HomeCardsSkeleton />}>
        <HomeCards />
      </Suspense>
    </main>
  );
}

function HomeCardsSkeleton() {
  return (
    <div className={GRID}>
      <div className="h-32 rounded-2xl bg-brand-darkblu/40 motion-safe:animate-pulse" />
      <div className="h-32 rounded-2xl bg-brand-darkblu/40 motion-safe:animate-pulse" />
      <div className="col-span-2 h-56 rounded-2xl bg-brand-darkblu/40 motion-safe:animate-pulse md:col-span-1" />
      <div className="col-span-2 h-56 rounded-2xl bg-brand-darkblu/40 motion-safe:animate-pulse md:col-span-1" />
    </div>
  );
}

async function HomeCards() {
  const supabase = await createClient();

  // Tutte in parallelo: l'attesa è quella della più lenta, non la somma.
  const [liveStatus, ultimoVideo, scheduleRes, newsRes] = await Promise.all([
    getStreamStatus(),
    getLatestVideo(),
    supabase.from("schedule").select("*").order("data", { ascending: true }),
    supabase.from("news").select("*").order("created_at", { ascending: false }),
  ]);

  const prossimeDirette = (scheduleRes.data ?? []).filter(
    (item) => item.data && isUpcoming(item.data),
  );
  const news = newsRes.data;

  return (
    <div className={`rise-in ${GRID}`}>
      <LiveBlock initial={liveStatus} />

      <ScheduleCard items={prossimeDirette} />

      <div className="card-glass col-span-2 flex flex-col gap-2 p-5 md:col-span-1">
        <p className={CARD_LABEL}>Ultimo video su YouTube</p>
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
        <p className={CARD_LABEL}>News &amp; eventi</p>
        <NewsList items={news ?? []} />
      </div>
    </div>
  );
}
