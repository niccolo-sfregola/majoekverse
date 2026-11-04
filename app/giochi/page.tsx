import { getDict } from "@/lib/i18n/server";
import TitoloPagina from "@/app/titoloPagina";
import Pannello from "@/app/pannello";
import Button from "@/app/button";

// Le due "vetrine" dei giochi, un pannello per gioco (vedi DESIGN.md).
// Il bordo corallo segna il gioco riservato agli abbonati.
export default async function Giochi() {
  const t = await getDict();
  const g = t.giochi;

  const games = [
    {
      label: g.daily,
      name: g.dailyName,
      text: g.dailyText,
      subsOnly: false,
      href: "/giochi/zip",
    },
    {
      label: g.weeklySubs,
      name: g.weeklyName,
      text: g.weeklyText,
      subsOnly: true,
      href: "/giochi/parola",
    },
  ];

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 pb-10 pt-[calc(env(safe-area-inset-top)_+_92px)] md:pt-16 lg:min-h-[560px] lg:gap-[18px] lg:pt-[110px]">
      <TitoloPagina>{g.title}</TitoloPagina>

      <div className="entra grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7">
        <p className="text-brand-lavanda-chiara lg:col-span-2 lg:text-[19px]">{g.subtitle}</p>
        {games.map((game) => (
          <Pannello
            key={game.name}
            bordo={game.subsOnly ? "corallo" : undefined}
            className="flex flex-col gap-2 p-[18px] lg:gap-2.5 lg:p-[26px]"
          >
            <p
              className={`text-sm lg:text-[15px] ${
                game.subsOnly ? "text-brand-pesca" : "text-brand-lavanda-chiara"
              }`}
            >
              {game.label}
            </p>
            <h2 className="text-[26px] font-bold leading-tight lg:text-[34px]">{game.name}</h2>
            <p className="leading-[1.45] text-brand-lavanda-chiara lg:mb-2 lg:leading-normal">
              {game.text}
            </p>
            <Button href={game.href} className="mt-2 lg:mt-auto lg:self-start">
              {g.play}
            </Button>
          </Pannello>
        ))}
      </div>
    </main>
  );
}
