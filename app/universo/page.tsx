import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getChannelInfo } from "@/lib/twitch";
import { blowbrush } from "@/app/fonts";
import CopyCode from "./copyCode";
import CosmicBackground from "./cosmicBackground";

const bio =
  "Ciao, sono Joe! Sono un content creator napoletano che vive in Toscana e studente di Scienze dell’Educazione e della Formazione. Creo contenuti dedicati a gaming, tecnologia, lifestyle e skincare, lavoro come UGC creator e porto avanti diversi progetti creativi. Su Twitch condivido soprattutto giochi horror, indie e narrativi, insieme a una community accogliente e inclusiva. Sono anche la mente dietro Koto Mail Club, La Posta del Cuore e il podcast The Big Bear Theory: modi diversi per trasformare le mie passioni in esperienze da condividere, online e offline. 🧸";

const LABEL =
  "text-xs font-semibold uppercase tracking-[0.18em] text-brand-lavanda";

const socials = [
  {
    name: "Twitch",
    link: "https://twitch.tv/majoekoto",
    icon: (
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0 1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
    ),
  },
  {
    name: "Instagram",
    link: "https://instagram.com/majoekoto",
    icon: (
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    ),
  },
  {
    name: "YouTube",
    link: "https://youtube.com/@majoekoto",
    icon: (
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12z" />
    ),
  },
  {
    name: "Discord",
    link: "https://discord.com/invite/4FskPTnBts",
    icon: (
      <path d="M20.317 4.3698a19.7913 19.7913 0 0 0-4.8851-1.5152.0741.0741 0 0 0-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 0 0-.0785-.037 19.7363 19.7363 0 0 0-4.8852 1.515.0699.0699 0 0 0-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 0 0 .0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 0 0 .0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 0 0-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 0 1-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 0 1 .0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 0 1 .0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 0 1-.0066.1276 12.2986 12.2986 0 0 1-1.873.8914.0766.0766 0 0 0-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 0 0 .0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 0 0 .0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 0 0-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
    ),
  },
];

const progetti = [
  {
    name: "The Big Bear Theory",
    desc: "Il podcast di Joe su Spotify: cultura pop, drama di influencer e i temi che gli stanno a cuore, raccontati a modo suo.",
    link: "https://open.spotify.com/show/0Dskk8qdFBWDMtbgQb6slz",
    logo: "/sponsor/the-big-bear-theory.png",
  },
  {
    name: "Koto Mail Club",
    desc: "Ogni mese Joe ti spedisce a casa lettere, sticker e paper goodies. Su Patreon.",
    link: "https://www.patreon.com/cw/kotomailclub",
    logo: "/sponsor/koto-mail-club.png",
  },
  {
    name: "La Posta del Cuore",
    desc: "Lascia un pensiero, una confidenza, una poesia, in forma anonima. Verranno letti in diretta.",
    link: "https://forms.gle/6nFhSHwyy2rHiWKJ7",
    logo: "/sponsor/posta-del-cuore.png",
  },
];

export default async function Universo() {
  const supabase = await createClient();
  const [{ data: sponsor }, channel] = await Promise.all([
    supabase
      .from("sponsors")
      .select("*")
      .order("created_at", { ascending: true }),
    getChannelInfo(),
  ]);

  const ufficiali = (sponsor ?? []).filter((s) => s.ufficiale);
  const altri = (sponsor ?? []).filter((s) => !s.ufficiale);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 px-4 py-10 md:max-w-3xl">
      <CosmicBackground />

      <h1
        className={`${blowbrush.className} text-center text-4xl tracking-wide text-brand-crema md:text-5xl`}
      >
        Universo di Joe
      </h1>

      <section className="card-glass flex flex-col items-center gap-4 p-6 text-center md:flex-row md:items-start md:gap-6 md:text-left">
        {channel.profileImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={channel.profileImageUrl}
            alt=""
            className="h-24 w-24 shrink-0 rounded-full object-cover shadow-[0_0_28px_rgb(185_168_230/0.4)] ring-2 ring-brand-lavanda/40"
          />
        ) : (
          <Image
            src="/j.png"
            alt=""
            width={96}
            height={96}
            className="h-24 w-24 shrink-0 object-contain"
          />
        )}
        <div>
          <p className="text-lg font-semibold text-brand-crema">
            {channel.displayName ?? "maJoekoto"}
          </p>
          <p className="mt-1 text-sm text-brand-lavanda">{bio}</p>
        </div>
      </section>

      <section className="card-glass flex flex-col gap-3 p-5">
        <p className={LABEL}>Sui social</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {socials.map((s) => (
            <a
              key={s.name}
              href={s.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 rounded-xl bg-brand-fondo/40 p-4 text-sm font-semibold text-brand-crema transition hover:bg-brand-fondo/70 active:scale-[0.98]"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6 text-brand-lavanda"
                aria-hidden
              >
                {s.icon}
              </svg>
              {s.name}
            </a>
          ))}
        </div>
      </section>

      {ufficiali.map((s) => (
        <section
          key={s.id}
          className="relative overflow-hidden rounded-2xl border border-brand-corallo/40 bg-brand-corallo/10 p-6 text-center shadow-[0_0_30px_rgb(239_108_78/0.18)]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-corallo">
            Sponsor ufficiale
          </p>
          <div className="mt-4 flex flex-col items-center gap-3">
            {s.logo ? (
              <span className="flex h-24 w-full max-w-xs items-center justify-center rounded-2xl bg-brand-crema p-4">
                <Image
                  src={s.logo}
                  alt={s.name}
                  width={360}
                  height={140}
                  className="max-h-full w-auto object-contain"
                />
              </span>
            ) : (
              <span className="text-xl font-semibold text-brand-crema">
                {s.name}
              </span>
            )}
            <p className="text-sm text-brand-lavanda">
              {s.sconto
                ? `Sconto ${s.sconto} con il codice`
                : "Usa il codice sconto"}
            </p>
            <CopyCode code={s.code} />
            <a
              href={s.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 rounded-xl bg-brand-corallo px-6 py-2 font-semibold text-brand-crema transition hover:brightness-95 active:scale-[0.98]"
            >
              Vai al sito →
            </a>
          </div>
        </section>
      ))}

      {altri.length > 0 ? (
        <section className="card-glass flex flex-col gap-3 p-5">
          <p className={LABEL}>Sponsor</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {altri.map((s) => (
              <a
                key={s.id}
                href={s.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-3 rounded-xl bg-brand-fondo/40 p-4 text-center transition hover:bg-brand-fondo/70 active:scale-[0.98]"
              >
                {s.logo ? (
                  <span className="flex h-16 w-full items-center justify-center rounded-xl bg-brand-crema p-3">
                    <Image
                      src={s.logo}
                      alt={s.name}
                      width={220}
                      height={90}
                      className="max-h-full w-auto object-contain"
                    />
                  </span>
                ) : (
                  <span className="font-semibold text-brand-crema">
                    {s.name}
                  </span>
                )}
                {s.sconto ? (
                  <span className="rounded-full bg-brand-blu/40 px-2 py-0.5 text-xs font-semibold text-brand-crema">
                    Sconto {s.sconto}
                  </span>
                ) : null}
                <span className="font-mono text-sm text-brand-lavanda">
                  {s.code}
                </span>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <section className="card-glass flex flex-col gap-3 p-5">
        <p className={LABEL}>Progetti</p>
        <div className="flex flex-col gap-3">
          {progetti.map((p) => (
            <a
              key={p.name}
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 rounded-xl bg-brand-fondo/40 p-4 transition hover:bg-brand-fondo/70 active:scale-[0.99]"
            >
              <span className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-xl bg-brand-crema p-2.5">
                <Image
                  src={p.logo}
                  alt=""
                  width={72}
                  height={72}
                  className="max-h-full max-w-full object-contain"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-brand-crema">
                  {p.name}
                </span>
                <span className="mt-0.5 block text-sm text-brand-lavanda">
                  {p.desc}
                </span>
              </span>
              <span aria-hidden className="mt-0.5 shrink-0 text-brand-lavanda">
                →
              </span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
