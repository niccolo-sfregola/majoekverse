import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  signInWithTwitch,
  signOut,
  connectTwitchChannel,
} from "@/app/auth/actions";
import { isAdmin } from "@/lib/auth";
import { getChannelInfo, getChannelOverview } from "@/lib/twitch";
import {
  getJoeChannelStats,
  getUserChannelRelation,
} from "@/lib/twitch-user";
import { blowbrush } from "@/app/fonts";
import SubmitButton from "@/app/submitButton";

const SUB_TIER: Record<string, string> = {
  "1000": "Tier 1",
  "2000": "Tier 2",
  "3000": "Tier 3",
};

// Il canale di Joe: se l'utente loggato è lui, il profilo mostra una
// panoramica del canale invece delle statistiche da spettatore.
const JOE_TWITCH_LOGIN = "majoekoto";

function TwitchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M2.149 0 .537 4.119V20.16h5.4V24h3.017l3.844-3.84h4.633L23.463 12V0zm19.164 11.161-3.226 3.226h-5.4l-2.688 2.685v-2.685H5.4V1.92h15.913z" />
      <path d="M9.6 6.719h1.92v5.645H9.6zm5.28 0h1.92v5.645h-1.92z" />
    </svg>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-brand-fondo/40 p-3">
      <p className="text-[0.7rem] uppercase tracking-[0.12em] text-brand-lavanda">
        {label}
      </p>
      <p className="mt-1 font-semibold text-brand-crema">{value}</p>
    </div>
  );
}

// 1234 -> "1,2k"
function formatCount(n: number): string {
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(n < 10000 ? 1 : 0).replace(".", ",")}k`;
}

export default async function Profilo() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const admin = user ? await isAdmin() : false;

  const username =
    user?.user_metadata.nickname ??
    user?.user_metadata.name ??
    user?.user_metadata.preferred_username ??
    user?.email;
  const avatarUrl =
    user?.user_metadata.avatar_url ?? user?.user_metadata.picture;
  const membroDal = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("it-IT", {
        month: "long",
        year: "numeric",
      })
    : null;

  const isJoe =
    (
      user?.user_metadata.preferred_username ??
      user?.user_metadata.nickname ??
      ""
    ).toLowerCase() === JOE_TWITCH_LOGIN;

  const [overview, channel] =
    user
      ? await Promise.all([
          isJoe ? getChannelOverview() : Promise.resolve(null),
          getChannelInfo(),
        ])
      : [null, null];

  const joeStats =
    isJoe && user && channel?.id
      ? await getJoeChannelStats(user.id, channel.id)
      : null;

  const relation =
    !isJoe && user && channel?.id
      ? await getUserChannelRelation(user.id, channel.id)
      : null;

  if (!isJoe && user) {
    console.log(
      "[profilo] channel.id:",
      channel?.id,
      "relation:",
      JSON.stringify(relation),
    );
  }

  const presto = <span className="text-brand-lavanda/60">presto</span>;

  const seguiDaValue = relation
    ? relation.followsSince
      ? new Date(relation.followsSince).toLocaleDateString("it-IT", {
          month: "long",
          year: "numeric",
        })
      : relation.connected
        ? "Non ancora"
        : presto
    : presto;

  const abbonatoValue = relation
    ? relation.connected
      ? relation.subscribed
        ? (relation.subTier && SUB_TIER[relation.subTier]) || "Sì"
        : "No"
      : presto
    : presto;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 px-4 py-10 md:max-w-3xl">
      <h1
        className={`${blowbrush.className} text-center text-4xl tracking-wide text-brand-crema md:text-5xl`}
      >
        Profilo
      </h1>

      {user ? (
        <>
          <div className="card-glass flex items-center gap-4 p-5 md:p-6">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                width={80}
                height={80}
                className="h-16 w-16 shrink-0 rounded-full ring-2 ring-brand-lavanda/30 md:h-20 md:w-20"
              />
            ) : (
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-brand-blu text-2xl font-semibold text-brand-crema md:h-20 md:w-20">
                {username?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-lg font-semibold text-brand-crema md:text-xl">
                  {username}
                </p>
                {admin ? (
                  <span className="rounded-full bg-brand-corallo px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide text-brand-crema">
                    Admin
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-brand-lavanda">
                Accesso con Twitch
              </p>
            </div>
          </div>

          <div className="card-glass flex flex-col gap-3 p-5 md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-lavanda">
              {isJoe ? "Panoramica canale" : "Statistiche"}
            </p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {isJoe && overview ? (
                <>
                  <Stat
                    label="Stato"
                    value={
                      overview.isLive ? (
                        <span className="text-[#e11d2f]">In diretta</span>
                      ) : (
                        "Offline"
                      )
                    }
                  />
                  {overview.isLive ? (
                    <Stat
                      label="Spettatori"
                      value={
                        overview.viewers != null
                          ? formatCount(overview.viewers)
                          : "—"
                      }
                    />
                  ) : null}
                  {overview.isLive && overview.game ? (
                    <Stat label="Gioco" value={overview.game} />
                  ) : null}
                  <Stat
                    label="Ultimo VOD"
                    value={
                      overview.lastVideo ? (
                        <a
                          href={overview.lastVideo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={overview.lastVideo.title}
                          className="underline-offset-2 hover:underline"
                        >
                          {formatCount(overview.lastVideo.views)} visual.
                        </a>
                      ) : (
                        "—"
                      )
                    }
                  />
                  <Stat
                    label="Clip top (7 gg)"
                    value={
                      overview.topClip ? (
                        <a
                          href={overview.topClip.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={overview.topClip.title}
                          className="underline-offset-2 hover:underline"
                        >
                          {formatCount(overview.topClip.views)} visual.
                        </a>
                      ) : (
                        "—"
                      )
                    }
                  />
                  <Stat
                    label="Follower"
                    value={
                      joeStats?.followers != null
                        ? formatCount(joeStats.followers)
                        : presto
                    }
                  />
                  <Stat
                    label="Abbonati"
                    value={
                      joeStats?.subscribers != null
                        ? formatCount(joeStats.subscribers)
                        : presto
                    }
                  />
                  {joeStats?.subPoints != null ? (
                    <Stat
                      label="Punti sub"
                      value={formatCount(joeStats.subPoints)}
                    />
                  ) : null}
                </>
              ) : (
                <>
                  <Stat label="Ruolo" value={admin ? "Admin" : "Membro"} />
                  {membroDal ? (
                    <Stat label="Su maJoekverse da" value={membroDal} />
                  ) : null}
                  <Stat label="Abbonato al canale" value={abbonatoValue} />
                  <Stat label="Segui Joe da" value={seguiDaValue} />
                </>
              )}
            </div>

            {!isJoe && user && (!relation || !relation.connected) ? (
              <form action={signInWithTwitch}>
                <SubmitButton
                  pendingText="Apro Twitch…"
                  className="w-full rounded-xl border border-brand-lavanda/30 py-2.5 text-sm font-semibold text-brand-lavanda transition hover:bg-brand-lavanda/10 active:scale-[0.98] disabled:opacity-60"
                >
                  Aggiorna i permessi Twitch per le statistiche
                </SubmitButton>
              </form>
            ) : null}

            {isJoe && joeStats && !joeStats.connected ? (
              <form action={connectTwitchChannel}>
                <SubmitButton
                  pendingText="Apro Twitch…"
                  className="w-full rounded-xl border border-brand-lavanda/30 py-2.5 text-sm font-semibold text-brand-lavanda transition hover:bg-brand-lavanda/10 active:scale-[0.98] disabled:opacity-60"
                >
                  Collega il canale per vedere follower e abbonati
                </SubmitButton>
              </form>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            {admin ? (
              <Link
                href="/admin"
                className="card-glass flex items-center justify-between p-5 font-semibold text-brand-crema md:flex-1"
              >
                Area Admin
                <span aria-hidden>→</span>
              </Link>
            ) : null}
            <form action={signOut} className={admin ? "md:shrink-0" : "w-full"}>
              <SubmitButton
                pendingText="Esco…"
                className="w-full rounded-xl border border-brand-corallo/50 py-3 font-semibold text-brand-corallo transition hover:bg-brand-corallo/10 active:scale-[0.98] disabled:opacity-60 md:px-10"
              >
                Esci
              </SubmitButton>
            </form>
          </div>
        </>
      ) : (
        <div className="card-glass mx-auto flex w-full max-w-md flex-col items-center gap-4 p-6 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-brand-blu text-2xl">
            👤
          </div>
          <p className="text-brand-lavanda">
            Accedi con Twitch per vedere il tuo profilo, le tue statistiche col
            canale e — se sei admin — gestire i contenuti del sito.
          </p>
          <form action={signInWithTwitch} className="w-full">
            <SubmitButton
              pendingText="Apro Twitch…"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#9146ff] py-3 font-semibold text-white transition hover:bg-[#7d3ce0] active:scale-[0.98] disabled:opacity-60"
            >
              <TwitchIcon />
              Accedi con Twitch
            </SubmitButton>
          </form>
        </div>
      )}
    </main>
  );
}
