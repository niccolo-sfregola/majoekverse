import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { blowbrush } from "@/app/fonts";
import { getDict } from "@/lib/i18n/server";
import { tipoLogo, type TipoLogo } from "@/lib/logo";
import CopyCode from "./copyCode";
import TornaHome from "./tornaHome";
import Pannello from "@/app/pannello";
import Button from "@/app/button";

const socials = [
  { name: "Twitch", link: "https://twitch.tv/majoekoto" },
  { name: "Instagram", link: "https://instagram.com/majoekoto" },
  { name: "YouTube", link: "https://youtube.com/@majoekoto" },
  { name: "Discord", link: "https://discord.com/invite/4FskPTnBts" },
];

// desc = chiave del dizionario (t.universo.*) con la descrizione tradotta.
const progetti: {
  name: string;
  desc: "bigBearTheory" | "kotoMailClub" | "postaDelCuore";
  link: string;
  logo: string;
}[] = [
  {
    name: "The Big Bear Theory",
    desc: "bigBearTheory",
    link: "https://open.spotify.com/show/0Dskk8qdFBWDMtbgQb6slz",
    logo: "/sponsor/the-big-bear-theory.png",
  },
  {
    name: "Koto Mail Club",
    desc: "kotoMailClub",
    link: "https://www.patreon.com/cw/kotomailclub",
    logo: "/sponsor/koto-mail-club.png",
  },
  {
    name: "La Posta del Cuore",
    desc: "postaDelCuore",
    link: "https://forms.gle/6nFhSHwyy2rHiWKJ7",
    logo: "/sponsor/posta-del-cuore.png",
  },
];

// Universo di Joe (vedi DESIGN.md): ci si arriva col tuffo, sullo stesso
// cielo stellato, senza pianeta. Bio, social, sponsor e progetti; i contenuti
// arrivano dal centro (.arriva) mentre il cielo si assesta.
export default async function Universo() {
  const supabase = await createClient();
  const t = await getDict();
  const { data: sponsor } = await supabase
    .from("sponsors")
    .select("*")
    .order("created_at", { ascending: true });

  // Per ogni logo: com'è fatto (chiaro, scuro, su riquadro bianco), così
  // sul pannello scuro si vede sempre bene. Vedi lib/logo.ts.
  const conTipo = await Promise.all(
    (sponsor ?? []).map(async (s) => ({
      ...s,
      tipo: s.logo ? await tipoLogo(s.logo) : ("chiaro" as TipoLogo),
    })),
  );
  const ufficiali = conTipo.filter((s) => s.ufficiale);
  const altri = conTipo.filter((s) => !s.ufficiale);

  return (
    <main className="arriva pagina max-w-[880px] gap-[18px] pt-[calc(env(safe-area-inset-top)_+_20px)] md:pt-10 lg:min-h-0 lg:gap-[26px] lg:pt-10">
      <TornaHome />
      <h1
        className={`${blowbrush.className} neon text-[42px] leading-[1.05] lg:text-[clamp(48px,7vw,84px)]`}
      >
        {t.universo.title}
      </h1>

      <Pannello className="p-[18px] lg:p-[26px]">
        <p className="leading-normal text-brand-lavanda-chiara lg:leading-[1.6]">{t.universo.bio}</p>
      </Pannello>

      <section className="flex flex-col gap-2.5 lg:gap-3">
        <h2 className="titolo-sezione">{t.universo.socials}</h2>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-2.5">
          {socials.map((s) => (
            <a key={s.name} href={s.link} target="_blank" rel="noopener noreferrer" className="social">
              {s.name}
            </a>
          ))}
        </div>
      </section>

      {/* Sponsor ufficiali: un pannello ciascuno, con codice da copiare. */}
      {ufficiali.map((s) => (
        <section key={s.id} className="flex flex-col gap-2.5 lg:gap-3">
          <h2 className="titolo-sezione">{t.universo.sponsor}</h2>
          <Pannello className="flex flex-col items-center gap-3 p-[18px] text-center lg:p-[26px]">
            {s.logo ? (
              <span className="flex h-24 w-full max-w-xs items-center justify-center">
                <Image
                  src={s.logo}
                  alt={s.name}
                  width={360}
                  height={140}
                  className={`max-h-full w-auto object-contain logo-${s.tipo}`}
                />
              </span>
            ) : (
              <span className="text-xl font-bold text-brand-crema">{s.name}</span>
            )}
            <p className="text-brand-lavanda-chiara">
              {s.sconto ? t.universo.discountWithCode(s.sconto) : t.universo.useCode}
            </p>
            <CopyCode code={s.code} />
            <Button href={s.link} className="mt-2 lg:self-center">
              {t.universo.goToSite}
            </Button>
          </Pannello>
        </section>
      ))}

      {altri.length > 0 ? (
        <section className="flex flex-col gap-2.5 lg:gap-3">
          <h2 className="titolo-sezione">{t.universo.affiliations}</h2>
          <p className="-mt-1 text-brand-lavanda-chiara">{t.universo.affiliationsText}</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:gap-2.5">
            {altri.map((s) => (
              <a
                key={s.id}
                href={s.link}
                target="_blank"
                rel="noopener noreferrer"
                className="riga flex-col items-start gap-2.5 p-3 lg:p-4"
              >
                {s.logo ? (
                  <span className="flex h-16 w-full items-center justify-center">
                    <Image
                      src={s.logo}
                      alt={s.name}
                      width={220}
                      height={90}
                      className={`max-h-full w-auto object-contain logo-${s.tipo}`}
                    />
                  </span>
                ) : (
                  <span className="font-bold text-brand-crema">{s.name}</span>
                )}
                {s.sconto ? (
                  <span className="text-sm font-semibold text-brand-lavanda">
                    {t.universo.discount(s.sconto)}
                  </span>
                ) : null}
                <span className="font-mono font-bold text-brand-crema">{s.code}</span>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <section className="flex flex-col gap-2.5 lg:gap-3">
        <h2 className="titolo-sezione">{t.universo.projects}</h2>
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-3 lg:gap-2.5">
          {progetti.map((p) => (
            <a
              key={p.name}
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              className="riga items-start gap-3 p-3 lg:flex-col lg:gap-2.5 lg:p-4"
            >
              {/* Largo e non quadrato: alcuni loghi (Posta del Cuore) sono
                  scritte lunghe e in un quadrato diventerebbero minuscole. */}
              <span className="flex h-16 w-24 shrink-0 items-center justify-center lg:h-[72px] lg:w-44 lg:justify-start">
                <Image
                  src={p.logo}
                  alt=""
                  width={176}
                  height={72}
                  className="max-h-full max-w-full object-contain"
                />
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block text-brand-crema">{p.name}</strong>
                <span className="mt-0.5 block text-sm text-brand-lavanda-chiara">
                  {t.universo[p.desc]}
                </span>
              </span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
