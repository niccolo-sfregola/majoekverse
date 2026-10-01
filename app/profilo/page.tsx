import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  signInWithTwitch,
  signOut,
  connectTwitchChannel,
} from "@/app/auth/actions";
import { isAdmin, JOE_TWITCH_LOGIN } from "@/lib/auth";
import { getChannelInfo, getChannelOverview } from "@/lib/twitch";
import {
  getJoeChannelStats,
  getUserChannelRelation,
} from "@/lib/twitch-user";
import { blowbrush } from "@/app/fonts";
import SubmitButton from "@/app/submitButton";
import { zipBadges } from "@/lib/games";
import LangSwitch from "@/app/langSwitch";
import Notifiche from "./notifiche";
import { getDict, getLang } from "@/lib/i18n/server";
import { DATE_LOCALE } from "@/lib/i18n/dictionaries";

const SUB_TIER: Record<string, string> = {
  "1000": "Tier 1",
  "2000": "Tier 2",
  "3000": "Tier 3",
};

// Se l'utente loggato è Joe, il profilo mostra la panoramica del canale
// invece delle statistiche da spettatore. JOE_TWITCH_LOGIN è in lib/auth.

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

// 1234 -> "1,2k" (in inglese "1.2k")
function formatCount(n: number, lang: "it" | "en"): string {
  if (n < 1000) return String(n);
  const k = (n / 1000).toFixed(n < 10000 ? 1 : 0);
  return `${lang === "it" ? k.replace(".", ",") : k}k`;
}

export default async function Profilo() {
  const supabase = await createClient();
  const [lang, t] = await Promise.all([getLang(), getDict()]);
  const count = (n: number) => formatCount(n, lang);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [admin, badges] = user
    ? await Promise.all([isAdmin(), zipBadges()])
    : [false, new Map<string, string>()];
  // Medaglia del podio Zip di ieri: si vede nel profilo per tutto oggi.
  const zipBadge = user ? badges.get(user.id) : undefined;

  const username =
    user?.user_metadata.nickname ??
    user?.user_metadata.name ??
    user?.user_metadata.preferred_username ??
    user?.email;
  const avatarUrl =
    user?.user_metadata.avatar_url ?? user?.user_metadata.picture;
  const membroDal = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(DATE_LOCALE[lang], {
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

  const presto = <span className="text-brand-lavanda/60">{t.profilo.soon}</span>;

  const seguiDaValue = relation
    ? relation.followsSince
      ? new Date(relation.followsSince).toLocaleDateString(DATE_LOCALE[lang], {
          month: "long",
          year: "numeric",
        })
      : relation.connected
        ? t.profilo.notYet
        : presto
    : presto;

  const abbonatoValue = relation
    ? relation.connected
      ? relation.subscribed
        ? (relation.subTier && SUB_TIER[relation.subTier]) || t.profilo.yes
        : t.profilo.no
      : presto
    : presto;

  return (
    <main className="rise-in safe-top mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 px-4 pb-10 md:max-w-3xl">
      <h1
        className={`${blowbrush.className} text-center text-4xl tracking-wide text-brand-crema md:text-5xl`}
      >
        {t.profilo.title}
      </h1>

      {/* Su desktop l'interruttore lingua è nella barra in alto. */}
      <LangSwitch className="self-center md:hidden" />

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
                {zipBadge ? (
                  <span className="rounded-full bg-brand-blu px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide text-brand-crema">
                    {zipBadge} {t.profilo.zipBadge}
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-brand-lavanda">
                {t.profilo.loginWith}
              </p>
            </div>
          </div>

          <div className="card-glass flex flex-col gap-3 p-5 md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-lavanda">
              {isJoe ? t.profilo.channelOverview : t.profilo.stats}
            </p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {isJoe && overview ? (
                <>
                  <Stat
                    label={t.profilo.status}
                    value={
                      overview.isLive ? (
                        <span className="text-[#e11d2f]">{t.profilo.live}</span>
                      ) : (
                        "Offline"
                      )
                    }
                  />
                  {overview.isLive ? (
                    <Stat
                      label={t.profilo.viewers}
                      value={
                        overview.viewers != null
                          ? count(overview.viewers)
                          : t.profilo.na
                      }
                    />
                  ) : null}
                  {overview.isLive && overview.game ? (
                    <Stat label={t.profilo.game} value={overview.game} />
                  ) : null}
                  <Stat
                    label={t.profilo.lastVod}
                    value={
                      overview.lastVideo ? (
                        <a
                          href={overview.lastVideo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={overview.lastVideo.title}
                          className="underline-offset-2 hover:underline"
                        >
                          {count(overview.lastVideo.views)} {t.profilo.views}
                        </a>
                      ) : (
                        t.profilo.na
                      )
                    }
                  />
                  <Stat
                    label={t.profilo.topClip}
                    value={
                      overview.topClip ? (
                        <a
                          href={overview.topClip.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={overview.topClip.title}
                          className="underline-offset-2 hover:underline"
                        >
                          {count(overview.topClip.views)} {t.profilo.views}
                        </a>
                      ) : (
                        t.profilo.na
                      )
                    }
                  />
                  <Stat
                    label={t.profilo.followers}
                    value={
                      joeStats?.followers != null
                        ? count(joeStats.followers)
                        : presto
                    }
                  />
                  <Stat
                    label={t.profilo.subscribers}
                    value={
                      joeStats?.subscribers != null
                        ? count(joeStats.subscribers)
                        : presto
                    }
                  />
                  {joeStats?.subPoints != null ? (
                    <Stat
                      label={t.profilo.subPoints}
                      value={count(joeStats.subPoints)}
                    />
                  ) : null}
                </>
              ) : (
                <>
                  <Stat label={t.profilo.role} value={admin ? "Admin" : t.profilo.member} />
                  {membroDal ? (
                    <Stat label={t.profilo.memberSince} value={membroDal} />
                  ) : null}
                  <Stat label={t.profilo.subscribed} value={abbonatoValue} />
                  <Stat label={t.profilo.followsSince} value={seguiDaValue} />
                </>
              )}
            </div>

            {!isJoe && user && (!relation || !relation.connected) ? (
              <form action={signInWithTwitch}>
                <SubmitButton
                  pendingText={t.auth.opening}
                  className="w-full rounded-xl border border-brand-lavanda/30 py-2.5 text-sm font-semibold text-brand-lavanda transition hover:bg-brand-lavanda/10 active:scale-[0.98] disabled:opacity-60"
                >
                  {t.profilo.refreshPermissions}
                </SubmitButton>
              </form>
            ) : null}

            {isJoe && joeStats && !joeStats.connected ? (
              <form action={connectTwitchChannel}>
                <SubmitButton
                  pendingText={t.auth.opening}
                  className="w-full rounded-xl border border-brand-lavanda/30 py-2.5 text-sm font-semibold text-brand-lavanda transition hover:bg-brand-lavanda/10 active:scale-[0.98] disabled:opacity-60"
                >
                  {t.profilo.connectChannel}
                </SubmitButton>
              </form>
            ) : null}
          </div>

          <Notifiche />

          <div className="flex flex-col gap-3 md:flex-row">
            {admin ? (
              <Link
                href="/admin"
                className="card-glass flex items-center justify-between p-5 font-semibold text-brand-crema md:flex-1"
              >
                {t.profilo.adminArea}
                <span aria-hidden>→</span>
              </Link>
            ) : null}
            <form action={signOut} className={admin ? "md:shrink-0" : "w-full"}>
              <SubmitButton
                pendingText={t.profilo.loggingOut}
                className="w-full rounded-xl border border-brand-corallo/50 py-3 font-semibold text-brand-corallo transition hover:bg-brand-corallo/10 active:scale-[0.98] disabled:opacity-60 md:px-10"
              >
                {t.profilo.logout}
              </SubmitButton>
            </form>
          </div>
        </>
      ) : (
        <div className="card-glass mx-auto flex w-full max-w-md flex-col items-center gap-4 p-6 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-brand-blu text-2xl">
            👤
          </div>
          <p className="text-brand-lavanda">{t.profilo.loggedOutText}</p>
          <form action={signInWithTwitch} className="w-full">
            <SubmitButton
              pendingText={t.auth.opening}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#9146ff] py-3 font-semibold text-white transition hover:bg-[#7d3ce0] active:scale-[0.98] disabled:opacity-60"
            >
              <TwitchIcon />
              {t.auth.login}
            </SubmitButton>
          </form>
        </div>
      )}
    </main>
  );
}
