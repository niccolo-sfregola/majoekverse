import { Suspense } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  signInWithTwitch,
  signOut,
  connectTwitchChannel,
} from "@/app/auth/actions";
import { JOE_TWITCH_LOGIN } from "@/lib/auth";
import { getChannelInfo, getChannelOverview } from "@/lib/twitch";
import { getJoeChannelStats, getUserChannelRelation } from "@/lib/twitch-user";
import SubmitButton from "@/app/submitButton";
import { MEDALS, zipBadges } from "@/lib/games";
import TitoloPagina from "@/app/titoloPagina";
import Pannello from "@/app/pannello";
import { TransLink } from "@/app/transizione";
import LangSwitch from "@/app/langSwitch";
import Notifiche from "./notifiche";
import DeleteAccountButton from "./deleteAccountButton";
import { getDict, getLang } from "@/lib/i18n/server";
import { DATE_LOCALE } from "@/lib/i18n/dictionaries";

const SUB_TIER: Record<string, string> = {
  "1000": "Tier 1",
  "2000": "Tier 2",
  "3000": "Tier 3",
};

// Se l'utente loggato è Joe, il profilo mostra la panoramica del canale
// invece delle statistiche da spettatore. JOE_TWITCH_LOGIN è in lib/auth.

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-brand-fondo p-3">
      <p className="text-sm text-brand-lavanda-chiara">{label}</p>
      <p className="mt-1 font-bold text-brand-crema">{value}</p>
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
  const t = await getDict();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // is_admin() direttamente (e non isAdmin(), che rifarebbe getUser): il
  // database riconosce l'utente dal token anche da solo.
  const [adminRes, badges] = user
    ? await Promise.all([supabase.rpc("is_admin"), zipBadges()])
    : [null, new Map<string, string>()];
  const admin = adminRes?.data === true;
  // Posizione sul podio Zip di ieri (1-3): si vede nel profilo per tutto oggi.
  const zipPos = user ? MEDALS.indexOf(badges.get(user.id) ?? "") + 1 : 0;

  const username =
    user?.user_metadata.nickname ??
    user?.user_metadata.name ??
    user?.user_metadata.preferred_username ??
    user?.email;
  const avatarUrl =
    user?.user_metadata.avatar_url ?? user?.user_metadata.picture;
  const isJoe =
    (
      user?.user_metadata.preferred_username ??
      user?.user_metadata.nickname ??
      ""
    ).toLowerCase() === JOE_TWITCH_LOGIN;

  return (
    <main className="pagina">
      <TitoloPagina>{t.profilo.title}</TitoloPagina>

      {user ? (
        <div className="entra flex w-full flex-col gap-4 lg:max-w-3xl">
          {/* Su desktop l'interruttore lingua è nella barra in alto. */}
          <LangSwitch className="self-start md:hidden" />

          <Pannello className="flex items-center gap-4 p-[18px] lg:p-[26px]">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                width={80}
                height={80}
                className="h-16 w-16 shrink-0 rounded-full ring-2 ring-brand-lavanda lg:h-20 lg:w-20"
              />
            ) : (
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-brand-blu text-2xl font-bold text-brand-crema lg:h-20 lg:w-20">
                {username?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-xl font-bold text-brand-crema lg:text-2xl">
                {username}
              </p>
              <p className="text-sm text-brand-lavanda-chiara">{t.profilo.loginWith}</p>
              {admin || zipPos ? (
                <p className="mt-1 flex flex-wrap gap-x-3 text-sm font-semibold">
                  {admin ? <span className="text-brand-corallo">Admin</span> : null}
                  {zipPos ? (
                    <span className="text-brand-lavanda">{t.profilo.zipBadge(zipPos)}</span>
                  ) : null}
                </p>
              ) : null}
            </div>
          </Pannello>

          {/* Le statistiche dipendono da Twitch (la parte lenta): arrivano in
              streaming, intanto il resto del profilo è già visibile. */}
          <Suspense fallback={<StatsSkeleton />}>
            <StatsCard user={user} admin={admin} isJoe={isJoe} />
          </Suspense>

          <Notifiche />

          {admin ? (
            <TransLink href="/admin" className="riga justify-between font-bold">
              {t.profilo.adminArea}
              <svg
                aria-hidden
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--lavanda)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </TransLink>
          ) : null}

          {/* Azioni secondarie: link, non bottoni pieni (il bottone
              principale della pagina è uno solo). */}
          <div className="flex flex-wrap items-start gap-x-8 gap-y-1">
            <form action={signOut}>
              <SubmitButton pendingText={t.profilo.loggingOut} className="link-azione">
                {t.profilo.logout}
              </SubmitButton>
            </form>
            <DeleteAccountButton />
            <TransLink
              href="/privacy"
              className="link-azione font-normal text-brand-lavanda-chiara underline underline-offset-4"
            >
              {t.privacy.link}
            </TransLink>
          </div>
        </div>
      ) : (
        <div className="entra flex flex-col items-start gap-4 lg:max-w-[620px] lg:gap-[18px]">
          <p className="leading-[1.45] text-brand-lavanda-chiara lg:leading-normal">
            {t.profilo.loggedOutText}
          </p>
          <form action={signInWithTwitch} className="w-full lg:w-auto">
            <SubmitButton pendingText={t.auth.opening} className="btn">
              {t.auth.login}
            </SubmitButton>
          </form>
          <p className="text-sm text-brand-lavanda-chiara">
            {t.auth.privacyBefore}{" "}
            <TransLink href="/privacy" className="underline underline-offset-4 hover:text-brand-crema">
              {t.auth.privacyLink}
            </TransLink>
            .
          </p>
          {/* Su desktop l'interruttore lingua è nella barra in alto. */}
          <LangSwitch className="md:hidden" />
        </div>
      )}
    </main>
  );
}

// Card delle statistiche: tutte le chiamate a Twitch stanno qui dentro, così
// la pagina non le aspetta (vedi il <Suspense> sopra).
async function StatsCard({
  user,
  admin,
  isJoe,
}: {
  user: User;
  admin: boolean;
  isJoe: boolean;
}) {
  const [lang, t] = await Promise.all([getLang(), getDict()]);
  const count = (n: number) => formatCount(n, lang);
  const membroDal = new Date(user.created_at).toLocaleDateString(
    DATE_LOCALE[lang],
    { month: "long", year: "numeric" },
  );

  const [overview, channel] = await Promise.all([
    isJoe ? getChannelOverview() : Promise.resolve(null),
    getChannelInfo(),
  ]);

  const joeStats =
    isJoe && channel.id ? await getJoeChannelStats(user.id, channel.id) : null;

  const relation =
    !isJoe && channel.id
      ? await getUserChannelRelation(user.id, channel.id)
      : null;

  const presto = (
    <span className="font-normal text-brand-lavanda-chiara">{t.profilo.soon}</span>
  );

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
    <Pannello className="flex flex-col gap-3 p-[18px] lg:p-[26px]">
      <h2 className="titolo-sezione">
        {isJoe ? t.profilo.channelOverview : t.profilo.stats}
      </h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {isJoe && overview ? (
          <>
            <Stat
              label={t.profilo.status}
              value={
                overview.isLive ? (
                  <span className="text-brand-corallo">{t.profilo.live}</span>
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
                joeStats?.followers != null ? count(joeStats.followers) : presto
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
            <Stat
              label={t.profilo.role}
              value={admin ? "Admin" : t.profilo.member}
            />
            {membroDal ? (
              <Stat label={t.profilo.memberSince} value={membroDal} />
            ) : null}
            <Stat label={t.profilo.subscribed} value={abbonatoValue} />
            <Stat label={t.profilo.followsSince} value={seguiDaValue} />
          </>
        )}
      </div>

      {!isJoe && (!relation || !relation.connected) ? (
        <form action={signInWithTwitch}>
          <SubmitButton pendingText={t.auth.opening} className="link-azione text-left">
            {t.profilo.refreshPermissions}
          </SubmitButton>
        </form>
      ) : null}

      {isJoe && joeStats && !joeStats.connected ? (
        <form action={connectTwitchChannel}>
          <SubmitButton pendingText={t.auth.opening} className="link-azione text-left">
            {t.profilo.connectChannel}
          </SubmitButton>
        </form>
      ) : null}
    </Pannello>
  );
}

function StatsSkeleton() {
  return (
    <Pannello className="flex flex-col gap-3 p-[18px] lg:p-[26px]">
      <div className="h-6 w-32 bg-brand-fondo motion-safe:animate-pulse" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[4.5rem] bg-brand-fondo motion-safe:animate-pulse" />
        ))}
      </div>
    </Pannello>
  );
}
