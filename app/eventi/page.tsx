import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { longDayIt, ddmm } from "@/lib/schedule";
import { getChannelInfo } from "@/lib/twitch";
import { getUserChannelRelation } from "@/lib/twitch-user";
import { blowbrush } from "@/app/fonts";

const DISCORD_INVITE = "https://discord.com/invite/4FskPTnBts";
const TWITCH_SUB = "https://www.twitch.tv/subs/majoekoto";

export default function Eventi() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 px-4 py-10 md:max-w-4xl">
      <h1
        className={`${blowbrush.className} text-center text-4xl tracking-wide text-brand-crema md:text-5xl`}
      >
        Eventi
      </h1>
      <p className="text-center text-sm text-brand-lavanda">
        I prossimi appuntamenti della community.
      </p>

      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-44 rounded-2xl bg-brand-darkblu/40 motion-safe:animate-pulse" />
            <div className="h-44 rounded-2xl bg-brand-darkblu/40 motion-safe:animate-pulse" />
          </div>
        }
      >
        <EventiList />
      </Suspense>
    </main>
  );
}

async function EventiList() {
  const supabase = await createClient();

  const [{ data: eventi }, { data: auth }] = await Promise.all([
    supabase.from("events").select("*").order("data", { ascending: true }),
    supabase.auth.getUser(),
  ]);

  // Stato abbonamento: serve solo se c'è almeno un evento riservato.
  let subscribed = false;
  const hasLocked = (eventi ?? []).some((e) => e.solo_abbonati);
  if (hasLocked && auth.user) {
    const twitchId =
      auth.user.user_metadata.provider_id ?? auth.user.user_metadata.sub ?? null;
    const channel = await getChannelInfo();
    if (channel.id && twitchId) {
      const rel = await getUserChannelRelation(
        auth.user.id,
        twitchId,
        channel.id,
      );
      subscribed = rel.subscribed;
    }
  }

  if (!eventi || eventi.length === 0) {
    return (
      <div className="card-glass p-6 text-center text-brand-lavanda">
        Nessun evento in programma per ora. Torna a trovarci!
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {eventi.map((item) => {
        const locked = item.solo_abbonati && !subscribed;
        return (
          <article
            key={item.id}
            className="card-glass flex flex-col gap-3 p-5"
          >
            <div className="flex flex-wrap items-center gap-2">
              {item.data ? (
                <span className="inline-flex items-center rounded-lg bg-brand-blu/40 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-brand-crema">
                  {longDayIt(item.data)} {ddmm(item.data)}
                </span>
              ) : null}
              {item.solo_abbonati ? (
                <span className="inline-flex items-center gap-1 rounded-lg bg-brand-corallo/20 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-brand-corallo">
                  🔒 Solo abbonati
                </span>
              ) : null}
            </div>
            <h2 className="text-lg font-semibold text-brand-crema">
              {item.titolo}
            </h2>
            <p className="whitespace-pre-line text-sm text-brand-lavanda">
              {item.descrizione}
            </p>
            {locked ? (
              <a
                href={TWITCH_SUB}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto rounded-xl border border-brand-corallo/50 py-2 text-center text-sm font-semibold text-brand-corallo transition hover:bg-brand-corallo/10 active:scale-[0.98]"
              >
                Abbonati per partecipare
              </a>
            ) : (
              <a
                href={DISCORD_INVITE}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto rounded-xl bg-brand-blu py-2 text-center font-semibold text-brand-crema transition hover:brightness-110 active:scale-[0.98]"
              >
                Partecipa →
              </a>
            )}
          </article>
        );
      })}
    </div>
  );
}
