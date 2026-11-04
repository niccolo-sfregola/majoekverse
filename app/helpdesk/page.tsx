import { getDict } from "@/lib/i18n/server";
import TitoloPagina from "@/app/titoloPagina";
import Button from "@/app/button";

const DISCORD_HELP =
  "https://discord.com/channels/1401611321790693416/1520103878228443287";

// Help Desk (vedi DESIGN.md): titolo animato, testo e un'azione principale,
// che apre il canale di supporto su Discord in una nuova scheda.
export default async function HelpDesk() {
  const t = await getDict();
  return (
    <main className="pagina">
      <TitoloPagina>Help Desk</TitoloPagina>
      <div className="entra flex flex-col items-start gap-4 lg:max-w-[620px] lg:gap-[18px]">
        <p className="leading-[1.45] text-brand-lavanda-chiara lg:leading-normal">
          {t.helpdesk.text}
        </p>
        <Button href={DISCORD_HELP}>{t.helpdesk.button}</Button>
      </div>
    </main>
  );
}
