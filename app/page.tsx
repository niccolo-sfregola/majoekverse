import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getStreamStatus, getChannelInfo } from "@/lib/twitch";
import { getUserChannelRelation } from "@/lib/twitch-user";
import { getLatestVideo } from "@/lib/youtube";
import { isUpcoming } from "@/lib/schedule";
import { getDict } from "@/lib/i18n/server";
import { blowbrush } from "./fonts";
import Scrivi from "./scrivi";
import ProssimaDiretta from "./prossimaDiretta";
import ScheduleList from "./scheduleList";
import NewsList from "./newsList";
import EventList from "./eventList";

// Home (vedi DESIGN.md). In alto logo neon e sottotitolo: su telefono sotto
// il pianeta, da desktop a sinistra con il pianeta a destra (il pianeta sta
// in layout.tsx, qui si lascia solo lo spazio). Poi conto alla rovescia,
// schedule, ultimo video e news; da desktop queste tre stanno in colonna.
//
// La pagina è sincrona: il titolo compare subito a ogni navigazione, mentre
// tutto quello che dipende da Twitch/YouTube/DB arriva in streaming dentro
// i <Suspense>, con uno scheletro al suo posto nel frattempo.
export default async function Home() {
  const t = await getDict();
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 pb-16 lg:gap-12">
      <section className="flex flex-col gap-5 pt-[calc(env(safe-area-inset-top)_+_19rem)] md:pt-[20rem] lg:min-h-[40rem] lg:max-w-[560px] lg:gap-4 lg:pt-24">
        <header className="text-center lg:text-left">
          <h1
            className={`${blowbrush.className} neon text-5xl leading-none lg:text-[clamp(52px,7vw,92px)]`}
          >
            maJoekverse
          </h1>
          <p className="mt-2 text-brand-lavanda-chiara lg:mt-4 lg:text-xl">
            <Scrivi testo={t.home.subtitle} />
          </p>
        </header>
        <Suspense fallback={<div className="taglio h-44 bg-brand-superficie motion-safe:animate-pulse lg:mt-6" />}>
          <div className="lg:mt-6">
            <Diretta />
          </div>
        </Suspense>
      </section>

      <Suspense fallback={<SezioniSkeleton />}>
        <Sezioni />
      </Suspense>
    </main>
  );
}

async function Diretta() {
  const supabase = await createClient();
  const [liveStatus, scheduleRes] = await Promise.all([
    getStreamStatus(),
    supabase.from("schedule").select("data, orario").order("data", { ascending: true }),
  ]);
  const prossime = (scheduleRes.data ?? []).filter(
    (item) => item.data && item.orario && isUpcoming(item.data),
  );
  return <ProssimaDiretta initial={liveStatus} prossime={prossime} />;
}

function SezioniSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-7 lg:grid-cols-3">
      <div className="taglio h-56 bg-brand-superficie motion-safe:animate-pulse" />
      <div className="taglio h-56 bg-brand-superficie motion-safe:animate-pulse" />
      <div className="taglio h-56 bg-brand-superficie motion-safe:animate-pulse" />
    </div>
  );
}

async function Sezioni() {
  const supabase = await createClient();
  const t = await getDict();

  // Tutte in parallelo: l'attesa è quella della più lenta, non la somma.
  const [ultimoVideo, scheduleRes, newsRes, eventiRes, authRes] = await Promise.all([
    getLatestVideo(),
    supabase.from("schedule").select("*").order("data", { ascending: true }),
    supabase.from("news").select("*").order("created_at", { ascending: false }),
    supabase.from("events").select("*").order("data", { ascending: true }),
    supabase.auth.getUser(),
  ]);

  const prossimeDirette = (scheduleRes.data ?? []).filter(
    (item) => item.data && isUpcoming(item.data),
  );
  // Eventi senza data restano sempre; quelli con data spariscono il giorno dopo.
  const eventi = (eventiRes.data ?? []).filter((e) => !e.data || isUpcoming(e.data));

  // Stato abbonamento: chiamiamo Twitch solo se c'è almeno un evento
  // riservato e l'utente è loggato.
  let subscribed = false;
  const user = authRes.data.user;
  if (user && eventi.some((e) => e.solo_abbonati)) {
    const channel = await getChannelInfo();
    if (channel.id) {
      const rel = await getUserChannelRelation(user.id, channel.id);
      subscribed = rel.subscribed;
    }
  }

  return (
    <div className="entra grid grid-cols-1 items-start gap-7 lg:grid-cols-3">
      <ScheduleList items={prossimeDirette} />

      <section className="flex flex-col gap-2.5 lg:gap-3">
        <h2 className="titolo-sezione">{t.home.latestVideo}</h2>
        {ultimoVideo ? (
          <a
            href={ultimoVideo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-2.5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ultimoVideo.thumbnail}
              alt=""
              className="taglio aspect-video w-full bg-brand-superficie object-cover transition-[filter] duration-200 group-hover:brightness-110"
            />
            <span className="font-semibold text-brand-crema">{ultimoVideo.title}</span>
          </a>
        ) : (
          <p className="text-brand-lavanda-chiara">{t.home.noVideo}</p>
        )}
      </section>

      <section className="flex flex-col gap-2.5 lg:gap-3">
        <h2 className="titolo-sezione">{t.home.news}</h2>
        <NewsList items={newsRes.data ?? []} />
      </section>

      {/* Compare solo se ci sono eventi in programma; da desktop su tutta la riga. */}
      {eventi.length > 0 ? (
        <section className="flex flex-col gap-2.5 lg:col-span-3 lg:gap-3">
          <h2 className="titolo-sezione">{t.home.events}</h2>
          <EventList items={eventi} subscribed={subscribed} />
        </section>
      ) : null}
    </div>
  );
}
