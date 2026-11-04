import { getLang } from "@/lib/i18n/server";
import { PRIVACY } from "@/lib/privacy";
import TitoloPagina from "@/app/titoloPagina";
import Pannello from "@/app/pannello";

export default async function Privacy() {
  const p = PRIVACY[await getLang()];

  return (
    <main className="pagina max-w-3xl">
      <div className="flex flex-col gap-1">
        <TitoloPagina>{p.title}</TitoloPagina>
        <p className="text-sm text-brand-lavanda-chiara">{p.updated}</p>
      </div>
      <div className="entra flex flex-col gap-4">
        <p className="leading-relaxed text-brand-lavanda-chiara">{p.intro}</p>

        {p.sections.map((s) => (
          <Pannello key={s.title} className="flex flex-col gap-2 p-[18px] lg:p-[26px]">
            <h2 className="titolo-sezione">{s.title}</h2>
            {s.paragraphs?.map((text) => (
              <p key={text} className="leading-relaxed text-brand-lavanda-chiara">
                {text}
              </p>
            ))}
            {s.list ? (
              <ul className="flex list-disc flex-col gap-1.5 pl-5 leading-relaxed text-brand-lavanda-chiara marker:text-brand-corallo">
                {s.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </Pannello>
        ))}
      </div>
    </main>
  );
}
