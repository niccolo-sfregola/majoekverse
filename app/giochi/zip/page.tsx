import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  dayBefore,
  gamesDevOpen,
  MEDALS,
  romeToday,
  zipLeaderboard,
  type ZipRow,
} from "@/lib/games";
import { getDict } from "@/lib/i18n/server";
import { formatDurata } from "@/lib/durata";
import { blowbrush } from "@/app/fonts";
import ZipGame, { type ZipStatus } from "./zipGame";
import LoginPrompt from "../loginPrompt";

const CARD_LABEL =
  "text-xs font-semibold uppercase tracking-[0.18em] text-brand-lavanda";

// Il puzzle NON arriva con la pagina: lo manda il server solo dopo "Inizia"
// (vedi actions.ts). Qui decidiamo solo cosa mostrare: login, gioco nuovo,
// partita da riprendere o "hai già giocato".
export default async function Zip() {
  const t = await getDict();
  const today = romeToday();
  const supabase = await createClient();

  const [
    {
      data: { user },
    },
    classifica,
    podioIeri,
  ] = await Promise.all([
    supabase.auth.getUser(),
    zipLeaderboard(today),
    zipLeaderboard(dayBefore(today), 3),
  ]);
  // Chi è sul podio di ieri si porta la medaglia accanto al nome per oggi.
  const badges = new Map(podioIeri.map((row, i) => [row.user_id, MEDALS[i]]));

  let status: ZipStatus = { kind: "new" };
  if (user) {
    const { data: mia } = await supabase
      .from("zip_games")
      .select("time_ms")
      .eq("user_id", user.id)
      .eq("giorno", today)
      .maybeSingle();
    if (mia?.time_ms != null) {
      status = { kind: "finished", timeMs: mia.time_ms };
    } else if (mia) {
      status = { kind: "inProgress" };
    }
  }

  return (
    <main className="rise-in safe-top mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 px-4 pb-10">
      <Link
        href="/giochi"
        className="self-start text-sm text-brand-lavanda transition hover:text-brand-crema"
      >
        {t.zip.back}
      </Link>
      <h1
        className={`${blowbrush.className} text-center text-4xl tracking-wide text-brand-crema md:text-5xl`}
      >
        {t.zip.title}
      </h1>
      <p className="text-center text-sm text-brand-lavanda">
        {today.split("-").reverse().join("/")}
      </p>

      {user || gamesDevOpen() ? (
        // key: se la pagina resta aperta oltre mezzanotte e si ricarica, il
        // gioco riparte da zero col giorno nuovo.
        <ZipGame key={today} status={status} />
      ) : (
        <LoginPrompt text={t.zip.loginText} />
      )}

      {podioIeri.length > 0 ? (
        <section className="card-glass flex flex-col gap-2 p-5">
          <p className={CARD_LABEL}>{t.zip.yesterday}</p>
          <ul className="flex flex-col gap-1.5">
            {podioIeri.map((row, i) => (
              <li key={row.user_id} className="flex items-center gap-2">
                <span className="text-lg leading-none">{MEDALS[i]}</span>
                <Player row={row} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="card-glass flex flex-col gap-2 p-5">
        <p className={CARD_LABEL}>{t.zip.leaderboard}</p>
        {classifica.length === 0 ? (
          <p className="text-sm text-brand-lavanda">{t.zip.noPlayers}</p>
        ) : (
          <ol className="flex flex-col divide-y divide-brand-lavanda/10">
            {classifica.map((row, i) => {
              const isMe = row.user_id === user?.id;
              return (
                <li
                  key={row.user_id}
                  className={`flex items-center gap-3 py-2 ${
                    isMe ? "text-brand-corallo" : "text-brand-crema"
                  }`}
                >
                  <span className="w-6 shrink-0 text-right text-sm tabular-nums text-brand-lavanda">
                    {i + 1}
                  </span>
                  <Player
                    row={row}
                    badge={badges.get(row.user_id)}
                    you={isMe ? t.zip.you : undefined}
                  />
                  <span className="ml-auto font-mono tabular-nums">
                    {formatDurata(row.time_ms)}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </main>
  );
}

// Avatar + nome. `badge` = medaglia vinta ieri, che si porta dietro oggi.
function Player({
  row,
  badge,
  you,
}: {
  row: ZipRow;
  badge?: string;
  you?: string;
}) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      {row.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={row.avatar_url}
          alt=""
          className="h-7 w-7 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span className="h-7 w-7 shrink-0 rounded-full bg-brand-blu/50" />
      )}
      <span className="truncate">{row.username}</span>
      {badge ? <span className="shrink-0">{badge}</span> : null}
      {you ? (
        <span className="shrink-0 text-xs text-brand-lavanda">({you})</span>
      ) : null}
    </span>
  );
}
