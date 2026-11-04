import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  addDays,
  dailyWord,
  dayBefore,
  mondayOf,
  premioSettimana,
  puntiDelGiorno,
  romeToday,
  titleState,
  weeklyLeaderboard,
  wordleAccess,
  wordleLeaderboard,
} from "@/lib/games";
import { valuta, type Riga } from "@/lib/wordle";
import { difficolta } from "@/lib/wordle-words";
import { formatDurata } from "@/lib/durata";
import { ddmm } from "@/lib/schedule";
import { getDict } from "@/lib/i18n/server";
import TitoloPagina from "@/app/titoloPagina";
import Indietro from "@/app/indietro";
import Pannello from "@/app/pannello";
import Button from "@/app/button";
import LoginPrompt from "../loginPrompt";
import WordleGame from "./wordleGame";
import TitleBox from "./titleBox";

const TWITCH_SUB = "https://www.twitch.tv/subs/majoekoto";

export default async function Parola() {
  const t = await getDict();
  const p = t.parola;
  const oggi = romeToday();
  const ieri = dayBefore(oggi);
  const settimana = mondayOf(oggi);
  const scorsa = addDays(settimana, -7);
  const supabase = await createClient();

  const [
    {
      data: { user },
    },
    classificaOggi,
    classificaSettimana,
    premioScorsa,
  ] = await Promise.all([
    supabase.auth.getUser(),
    // Tutte le partite vinte di oggi: servono tutte per il bonus velocità.
    wordleLeaderboard(oggi, 1000),
    weeklyLeaderboard(settimana),
    premioSettimana(scorsa),
  ]);
  // Classifica di oggi in ordine di punti (col bonus velocità, chi è più
  // veloce può superare chi ha usato un tentativo in meno), poi di tempo.
  const puntiOggi = puntiDelGiorno(classificaOggi);
  const pt = (id: string) => puntiOggi.get(id) ?? 0;
  const classificaOggiPunti = [...classificaOggi]
    .sort((a, b) => pt(b.user_id) - pt(a.user_id) || a.time_ms - b.time_ms)
    .slice(0, 50);
  const vincitoreScorsa = premioScorsa.vincitore;
  // Chi è stato saltato perché aveva già il premio: "Corona" accanto al nome
  // per tutta la settimana.
  const conCorona = premioScorsa.corona ? vincitoreScorsa?.user_id : undefined;

  // La mia partita di oggi (letta dal server: la tabella non è
  // pubblica). I colori li ricalcoliamo qui, la parola resta sul server.
  let game: {
    righe: Riga[];
    stato: "playing" | "won" | "lost";
    timeMs: number | null;
  } | null = null;
  let access: "ok" | "notSub" | "noToken" = "ok";
  // Premio della settimana scorsa (proposta di titolo) e partita di oggi:
  // non dipendono l'una dall'altra, quindi le chiediamo insieme.
  const [premio, { data: mia }] = user
    ? await Promise.all([
        titleState(user.id),
        createAdminClient()
          .from("wordle_games")
          .select("guesses, solved, finished_at, time_ms")
          .eq("user_id", user.id)
          .eq("giorno", oggi)
          .maybeSingle(),
      ])
    : [null, { data: null }];

  if (user) {
    if (mia) {
      const segreta = dailyWord(oggi);
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

  const mio = (id: string) => id === user?.id;

  return (
    <main className="pagina max-w-2xl">
      <Indietro href="/giochi">{t.zip.back}</Indietro>
      <div className="flex flex-col gap-1">
        <TitoloPagina>{p.title}</TitoloPagina>
        <p className="text-brand-lavanda-chiara tabular-nums">
          {oggi.split("-").reverse().join("/")} · {p.difficulty}:{" "}
          {p.livelli[difficolta(dailyWord(oggi))]}
        </p>
      </div>

      <div className="entra flex flex-col gap-6">
        {premio?.kind === "winner" ? <TitleBox state={premio} /> : null}

        {!user ? (
          <LoginPrompt text={p.loginText} />
        ) : access === "notSub" ? (
          // Bordo corallo: contenuto riservato agli abbonati.
          <Pannello bordo="corallo" className="flex flex-col items-start gap-4 p-[18px] lg:p-[26px]">
            <p className="text-brand-lavanda-chiara">{p.notSub}</p>
            <Button href={TWITCH_SUB}>{p.subscribe}</Button>
          </Pannello>
        ) : access === "noToken" ? (
          <Pannello className="flex flex-col items-start gap-4 p-[18px] lg:p-[26px]">
            <p className="text-brand-lavanda-chiara">{p.noToken}</p>
            <Button href="/profilo">{p.goToProfile}</Button>
          </Pannello>
        ) : (
          <div className="flex flex-col gap-4">
            {!game ? (
              <Pannello className="p-[18px] lg:p-[26px]">
                <p className="text-brand-lavanda-chiara">{p.rules}</p>
              </Pannello>
            ) : null}
            {/* key: a cambio giorno il gioco riparte da zero. */}
            <WordleGame
              key={oggi}
              initialRighe={game?.righe ?? []}
              initialStato={game?.stato ?? "playing"}
              initialTimeMs={game?.timeMs ?? null}
            />
          </div>
        )}

        <section className="flex flex-col gap-2.5">
          <h2 className="titolo-sezione">{p.leaderboardToday}</h2>
          {classificaOggi.length === 0 ? (
            <p className="text-brand-lavanda-chiara">{p.noPlayers}</p>
          ) : (
            <ol className="flex flex-col gap-1.5">
              {classificaOggiPunti.map((row, i) => (
                <li key={row.user_id} className={`riga gap-3 ${mio(row.user_id) ? "riga-attiva" : ""}`}>
                  <Posizione n={i + 1} mia={mio(row.user_id)} />
                  <Player
                    row={row}
                    corona={row.user_id === conCorona ? p.crown : undefined}
                    coronaTitolo={p.crownTitle}
                  />
                  <span className="ml-auto flex shrink-0 items-baseline gap-3 font-mono tabular-nums">
                    <span>{p.attempts(row.attempts)}</span>
                    <span className={`text-sm ${mio(row.user_id) ? "" : "text-brand-lavanda-chiara"}`}>
                      {formatDurata(row.time_ms)}
                    </span>
                    <span className="w-10 text-right font-bold">
                      +{puntiOggi.get(row.user_id) ?? 0}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="flex flex-col gap-2.5">
          <div>
            <h2 className="titolo-sezione">{p.leaderboardWeek}</h2>
            <p className="text-sm text-brand-lavanda-chiara">
              {p.week(ddmm(settimana), ddmm(addDays(settimana, 6)))}
            </p>
          </div>
          {classificaSettimana.length === 0 ? (
            <p className="text-brand-lavanda-chiara">{p.noPlayersWeek}</p>
          ) : (
            <ol className="flex flex-col gap-1.5">
              {classificaSettimana.map((row, i) => (
                <li key={row.user_id} className={`riga gap-3 ${mio(row.user_id) ? "riga-attiva" : ""}`}>
                  <Posizione n={i + 1} mia={mio(row.user_id)} />
                  <Player
                    row={row}
                    corona={row.user_id === conCorona ? p.crown : undefined}
                    coronaTitolo={p.crownTitle}
                  />
                  <span className="ml-auto flex shrink-0 items-baseline gap-3 font-mono tabular-nums">
                    <span className={`text-sm ${mio(row.user_id) ? "" : "text-brand-lavanda-chiara"}`}>
                      {p.days(row.giorni)}
                    </span>
                    <span className="font-bold">{p.points(row.punti)}</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* La parola di ieri si può svelare: ormai è chiusa. */}
        <section className="flex flex-col gap-2.5">
          <h2 className="titolo-sezione">{p.yesterday}</h2>
          <p className="text-brand-lavanda-chiara">
            {p.lastWord}{" "}
            <span className="font-bold uppercase tracking-widest text-brand-crema">
              {dailyWord(ieri)}
            </span>{" "}
            ({p.livelli[difficolta(dailyWord(ieri))]})
          </p>
        </section>

        <section className="flex flex-col gap-2.5">
          <h2 className="titolo-sezione">{p.lastWeek}</h2>
          {vincitoreScorsa ? (
            <div className="riga gap-3">
              <span className="shrink-0 text-brand-lavanda-chiara">{p.lastWinner}</span>
              <Player
                row={vincitoreScorsa}
                corona={premioScorsa.corona ? p.crown : undefined}
                coronaTitolo={p.crownTitle}
              />
              <span className="ml-auto shrink-0 font-mono font-bold tabular-nums">
                {p.points(vincitoreScorsa.punti)}
              </span>
            </div>
          ) : (
            <p className="text-brand-lavanda-chiara">{p.noWinner}</p>
          )}
          {premioScorsa.vintaDaJoe ? (
            <p className="text-brand-lavanda-chiara">{p.joeWon}</p>
          ) : null}
          {premioScorsa.corona ? (
            premioScorsa.premiato ? (
              <div className="flex flex-col gap-1.5">
                <p className="text-brand-lavanda-chiara">{p.crowned}</p>
                <div className="riga gap-3">
                  <Player row={premioScorsa.premiato} />
                </div>
              </div>
            ) : (
              <p className="text-brand-lavanda-chiara">{p.crownedAlone}</p>
            )
          ) : null}
        </section>
      </div>
    </main>
  );
}

function Posizione({ n, mia }: { n: number; mia: boolean }) {
  return (
    <span
      className={`w-7 shrink-0 text-right tabular-nums ${mia ? "font-bold" : "text-brand-lavanda"}`}
    >
      {n}
    </span>
  );
}

// Avatar + nome. `corona`: etichetta per chi tiene la corona (il titolo
// spiega cosa vuol dire, passandoci sopra col mouse).
function Player({
  row,
  corona,
  coronaTitolo,
}: {
  row: { username: string; avatar_url: string | null };
  corona?: string;
  coronaTitolo?: string;
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
      {corona ? (
        <span title={coronaTitolo} className="shrink-0 text-sm font-semibold text-brand-pesca">
          {corona}
        </span>
      ) : null}
    </span>
  );
}
