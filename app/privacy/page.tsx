import { getLang } from "@/lib/i18n/server";
import { PRIVACY } from "@/lib/privacy";
import { blowbrush } from "@/app/fonts";

export default async function Privacy() {
  const p = PRIVACY[await getLang()];

  return (
    <main className="rise-in safe-top mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 px-4 pb-10">
      <h1
        className={`${blowbrush.className} text-center text-4xl tracking-wide text-brand-crema md:text-5xl`}
      >
        {p.title}
      </h1>
      <p className="text-center text-xs text-brand-lavanda">{p.updated}</p>
      <p className="text-brand-lavanda">{p.intro}</p>

      {p.sections.map((s) => (
        <section key={s.title} className="panel flex flex-col gap-2 p-5">
          <h2 className="font-semibold text-brand-crema">{s.title}</h2>
          {s.paragraphs?.map((text) => (
            <p key={text} className="text-sm leading-relaxed text-brand-lavanda">
              {text}
            </p>
          ))}
          {s.list ? (
            <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-brand-lavanda marker:text-brand-corallo">
              {s.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </main>
  );
}
