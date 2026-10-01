import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  addDays,
  isJoeUserId,
  mondayOf,
  titleState,
  weeklyWord,
  wordleAccess,
  wordleLeaderboard,
  type WordleRow,
} from "@/lib/games";
import { valuta, type Riga } from "@/lib/wordle";
import { formatDurata } from "@/lib/durata";
import { ddmm } from "@/lib/schedule";
import { getDict } from "@/lib/i18n/server";
import { blowbrush } from "@/app/fonts";
import LoginPrompt from "../loginPrompt";
import WordleGame from "./wordleGame";
import TitleBox from "./titleBox";

const TWITCH_SUB = "https://www.twitch.tv/subs/majoekoto";
const CARD_LABEL =
  "text-xs font-semibold uppercase tracking-[0.18em] text-brand-lavanda";

export default async function Parola() {
  const t = await getDict();
  const p = t.parola;
  const settimana = mondayOf();
  const scorsa = addDays(settimana, -7);
  const supabase = await createClient();

  const [
    {
      data: { user },
    },
    classifica,
    [vincitoreScorsa],
  ] = await Promise.all([
    supabase.auth.getUser(),
    wordleLeaderboard(settimana),
    wordleLeaderboard(scorsa, 1),
  ]);
  // Se la settimana scorsa ha vinto Joe, il premio non è stato assegnato.
  const vintaDaJoe = vincitoreScorsa
    ? await isJoeUserId(vincitoreScorsa.user_id)
    : false;

  // La mia partita di questa settimana (letta dal server: la tabella non è
  // pubblica). I colori li ricalcoliamo qui, la parola resta sul server.
  let game: {
    righe: Riga[];
    stato: "playing" | "won" | "lost";
    timeMs: number | null;
  } | null = null;
  let access: "ok" | "notSub" | "noToken" = "ok";
  // Premio del vincitore della settimana scorsa (proposta di titolo).
  const premio = user ? await titleState(user.id) : null;

  if (user) {
    const { data: mia } = await createAdminClient()
      .from("wordle_games")
      .select("guesses, solved, finished_at, time_ms")
      .eq("user_id", user.id)
      .eq("settimana", settimana)
      .maybeSingle();

    if (mia) {
      const segreta = weeklyWord(settimana);
      game = {
        righe: (mia.guesses as string[]).map((g) => ({
          parola: g,
          esiti: valuta(g, segreta),
        })),
        stato: mia.solved ? "won" : mia.finished_at ? "lost" : "playing",
        timeMs: mia.time_ms,
      };
    } else {
      // Non ha ancora giocato: controlliamo l'abbonamento solo ora.
      access = await wordleAccess(user);
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
        {p.title}
      </h1>
      <p className="text-center text-sm text-brand-lavanda">
        {p.week(ddmm(settimana), ddmm(addDays(settimana, 6)))}
      </p>

      {premio?.kind === "winner" ? <TitleBox state={premio} /> : null}

      {!user ? (
        <LoginPrompt text={p.loginText} />
      ) : access === "notSub" ? (
        <div className="panel flex flex-col items-center gap-4 p-6 text-center">
          <p className="text-brand-lavanda">{p.notSub}</p>
          <a
            href={TWITCH_SUB}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-[#9146ff] px-6 py-3 font-semibold text-white transition hover:brightness-110 active:scale-[0.98]"
          >
            {p.subscribe}
          </a>
        </div>
      ) : access === "noToken" ? (
        <div className="panel flex flex-col items-center gap-4 p-6 text-center">
          <p className="text-brand-lavanda">{p.noToken}</p>
          <Link
            href="/profilo"
            className="rounded-xl bg-brand-blu px-6 py-3 font-semibold text-brand-crema transition hover:brightness-110 active:scale-[0.98]"
          >
            {p.goToProfile}
          </Link>
        </div>
      ) : (
        <>
          {!game ? (
            <p className="panel p-4 text-center text-sm text-brand-lavanda">
              {p.rules}
            </p>
          ) : null}
          {/* key: a cambio settimana il gioco riparte da zero. */}
          <WordleGame
            key={settimana}
            initialRighe={game?.righe ?? []}
            initialStato={game?.stato ?? "playing"}
            initialTimeMs={game?.timeMs ?? null}
          />
        </>
      )}

      <section className="card-glass flex flex-col gap-2 p-5">
        <p className={CARD_LABEL}>{p.leaderboard}</p>
        {classifica.length === 0 ? (
          <p className="text-sm text-brand-lavanda">{p.noPlayers}</p>
        ) : (
          <ol className="flex flex-col divide-y divide-brand-lavanda/10">
            {classifica.map((row, i) => (
              <li
                key={row.user_id}
                className={`flex items-center gap-3 py-2 ${
                  row.user_id === user?.id
                    ? "text-brand-corallo"
                    : "text-brand-crema"
                }`}
              >
                <span className="w-6 shrink-0 text-right text-sm tabular-nums text-brand-lavanda">
                  {i + 1}
                </span>
                <Player row={row} />
                <span className="ml-auto flex shrink-0 items-baseline gap-3 font-mono tabular-nums">
                  <span>{p.attempts(row.attempts)}</span>
                  <span className="text-sm text-brand-lavanda">
                    {formatDurata(row.time_ms)}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* La parola della settimana scorsa si può svelare: ormai è chiusa. */}
      <section className="card-glass flex flex-col gap-2 p-5">
        <p className={CARD_LABEL}>{p.lastWeek}</p>
        <p className="text-brand-lavanda">
          {p.lastWord}{" "}
          <span className="font-bold uppercase tracking-widest text-brand-crema">
            {weeklyWord(scorsa)}
          </span>
        </p>
        {vincitoreScorsa ? (
          <p className="flex items-center gap-2 text-brand-lavanda">
            {p.lastWinner}: 🏆 <Player row={vincitoreScorsa} />
            <span className="font-mono text-sm">
              {p.attempts(vincitoreScorsa.attempts)}
            </span>
          </p>
        ) : null}
        {vintaDaJoe ? (
          <p className="text-sm text-brand-lavanda">{p.joeWon}</p>
        ) : null}
        {vincitoreScorsa ? null : (
          <p className="text-sm text-brand-lavanda">{p.noWinner}</p>
        )}
      </section>
    </main>
  );
}

function Player({ row }: { row: WordleRow }) {
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
    </span>
  );
}
