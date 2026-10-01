import Link from "next/link";
import { getDict } from "@/lib/i18n/server";
import { blowbrush } from "@/app/fonts";

const CARD_LABEL =
  "text-xs font-semibold uppercase tracking-[0.18em] text-brand-lavanda";

// Le due "vetrine" dei giochi. `href` vuoto = gioco non ancora pronto.
export default async function Giochi() {
  const t = await getDict();
  const g = t.giochi;

  const games = [
    {
      label: g.daily,
      icon: "🧩",
      name: g.dailyName,
      text: g.dailyText,
      subsOnly: false,
      href: "/giochi/zip",
    },
    {
      label: g.weekly,
      icon: "🔤",
      name: g.weeklyName,
      text: g.weeklyText,
      subsOnly: true,
      href: "/giochi/parola",
    },
  ];

  return (
    <main className="rise-in safe-top mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 px-4 pb-10 md:max-w-4xl">
      <h1
        className={`${blowbrush.className} text-center text-4xl tracking-wide text-brand-crema md:text-5xl`}
      >
        {g.title}
      </h1>
      <p className="text-center text-sm text-brand-lavanda">{g.subtitle}</p>

      <div className="rise-in grid gap-4 md:grid-cols-2">
        {games.map((game) => (
          <article key={game.name} className="card-glass flex flex-col gap-3 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <p className={CARD_LABEL}>{game.label}</p>
              {game.subsOnly ? (
                <span className="inline-flex items-center rounded-lg bg-brand-corallo/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-corallo">
                  {g.subsOnly}
                </span>
              ) : null}
            </div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-brand-crema">
              <span className="text-2xl leading-none">{game.icon}</span>
              {game.name}
            </h2>
            <p className="text-sm text-brand-lavanda">{game.text}</p>
            {game.href ? (
              <Link
                href={game.href}
                className="mt-auto rounded-xl bg-brand-blu py-2 text-center font-semibold text-brand-crema transition hover:brightness-110 active:scale-[0.98]"
              >
                {g.play}
              </Link>
            ) : (
              <span className="mt-auto rounded-xl border border-brand-lavanda/20 py-2 text-center text-sm font-semibold text-brand-lavanda">
                {g.comingSoon}
              </span>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}
