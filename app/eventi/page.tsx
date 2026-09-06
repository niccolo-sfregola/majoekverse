import { createClient } from "@/lib/supabase/server";
import { longDayIt, ddmm } from "@/lib/schedule";
import { blowbrush } from "@/app/fonts";

const DISCORD_INVITE = "https://discord.com/invite/4FskPTnBts";

export default async function Eventi() {
  const supabase = await createClient();

  const { data: eventi } = await supabase
    .from("events")
    .select("*")
    .order("data", { ascending: true });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 px-4 py-10 md:max-w-4xl">
      <h1
        className={`${blowbrush.className} text-center text-4xl tracking-wide text-brand-crema md:text-5xl`}
      >
        Eventi
      </h1>
      <p className="text-center text-sm text-brand-lavanda">
        I prossimi appuntamenti della community.
      </p>

      {eventi && eventi.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {eventi.map((item) => (
            <article
              key={item.id}
              className="card-glass flex flex-col gap-3 p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                {item.data ? (
                  <span className="inline-flex items-center rounded-lg bg-brand-blu/40 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-brand-crema">
                    {longDayIt(item.data)} {ddmm(item.data)}
                  </span>
                ) : null}
                {item.solo_abbonati ? (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-brand-corallo/20 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-brand-corallo">
                    🔒 Solo abbonati
                  </span>
                ) : null}
              </div>
              <h2 className="text-lg font-semibold text-brand-crema">
                {item.titolo}
              </h2>
              <p className="whitespace-pre-line text-sm text-brand-lavanda">
                {item.descrizione}
              </p>
              <a
                href={DISCORD_INVITE}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto rounded-xl bg-brand-blu py-2 text-center font-semibold text-brand-crema transition hover:brightness-110 active:scale-[0.98]"
              >
                Partecipa →
              </a>
            </article>
          ))}
        </div>
      ) : (
        <div className="card-glass p-6 text-center text-brand-lavanda">
          Nessun evento in programma per ora. Torna a trovarci!
        </div>
      )}
    </main>
  );
}
