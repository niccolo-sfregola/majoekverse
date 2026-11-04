import { createClient } from "@/lib/supabase/server";
import {
  dayBefore,
  romeToday,
  zipLeaderboard,
  type ZipRow,
} from "@/lib/games";
import { getDict } from "@/lib/i18n/server";
import { formatDurata } from "@/lib/durata";
import TitoloPagina from "@/app/titoloPagina";
import Indietro from "@/app/indietro";
import ZipGame, { type ZipStatus } from "./zipGame";
import LoginPrompt from "../loginPrompt";

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
  // Chi è sul podio di ieri si porta la posizione accanto al nome per oggi.
  const badges = new Map(podioIeri.map((row, i) => [row.user_id, t.zip.badge(i + 1)]));

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
    <main className="pagina max-w-2xl">
      <Indietro href="/giochi">{t.zip.back}</Indietro>
      <div className="flex flex-col gap-1">
        <TitoloPagina>{t.zip.title}</TitoloPagina>
        <p className="text-brand-lavanda-chiara tabular-nums">
          {today.split("-").reverse().join("/")}
        </p>
      </div>

      <div className="entra flex flex-col gap-6">
        {user ? (
          // key: se la pagina resta aperta oltre mezzanotte e si ricarica, il
          // gioco riparte da zero col giorno nuovo.
          <ZipGame key={today} status={status} />
        ) : (
          <LoginPrompt text={t.zip.loginText} />
        )}

        {podioIeri.length > 0 ? (
          <section className="flex flex-col gap-2.5">
            <h2 className="titolo-sezione">{t.zip.yesterday}</h2>
            <ol className="flex flex-col gap-1.5">
              {podioIeri.map((row, i) => (
                <li key={row.user_id} className="riga gap-3">
                  <span className="w-7 shrink-0 font-bold text-brand-lavanda">{i + 1}°</span>
                  <Player row={row} />
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <section className="flex flex-col gap-2.5">
          <h2 className="titolo-sezione">{t.zip.leaderboard}</h2>
          {classifica.length === 0 ? (
            <p className="text-brand-lavanda-chiara">{t.zip.noPlayers}</p>
          ) : (
            <ol className="flex flex-col gap-1.5">
              {classifica.map((row, i) => {
                const isMe = row.user_id === user?.id;
                return (
                  <li key={row.user_id} className={`riga gap-3 ${isMe ? "riga-attiva" : ""}`}>
                    <span
                      className={`w-7 shrink-0 text-right tabular-nums ${
                        isMe ? "font-bold" : "text-brand-lavanda"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <Player
                      row={row}
                      badge={badges.get(row.user_id)}
                      you={isMe ? t.zip.you : undefined}
                    />
                    <span className="ml-auto font-mono font-bold tabular-nums">
                      {formatDurata(row.time_ms)}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}

// Avatar + nome. `badge` = posizione sul podio di ieri, che si porta dietro oggi.
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
        <span className="h-7 w-7 shrink-0 rounded-full bg-brand-blu" />
      )}
      <span className="truncate">{row.username}</span>
      {badge ? (
        <span className="shrink-0 text-sm font-semibold text-brand-pesca">{badge}</span>
      ) : null}
      {you ? <span className="shrink-0 text-sm">({you})</span> : null}
    </span>
  );
}
