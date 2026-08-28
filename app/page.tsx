import { createClient } from "@/lib/supabase/server";
import { getStreamStatus } from "@/lib/twitch";
import LiveBlock from "./liveBlock";

// Ancora finto: l'evento in evidenza lo colleghiamo alla tabella events più avanti.
const eventoInEvidenza = {
  titolo: "Giveaway PS5",
  data: "20 Agosto 2026",
  descrizione: "In collaborazione con DUBBY, in palio una PS5. Dettagli su Discord.",
};

export default async function Home() {
  const supabase = await createClient();

  const liveStatus = await getStreamStatus();

  // Due letture dal database. select("*") prende tutte le colonne;
  // order() decide l'ordine delle righe.
  const { data: schedule } = await supabase
    .from("schedule")
    .select("*")
    .order("created_at", { ascending: true });

  const { data: news } = await supabase
    .from("news")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 style={{ fontSize: "2rem", fontWeight: 500 }}>maJoekverse</h1>
      <div className="flex gap-4 w-full px-4">
        <LiveBlock initial={liveStatus} />

        <div className="flex-1 flex flex-col gap-2 rounded-xl p-4 bg-brand-darkblu">
          <p className="font-semibold" style={{ color: "#F6ECD8" }}>
            Schedule
          </p>
          <ul className="flex flex-col gap-1">
            {schedule?.map((item) => (
              <li
                key={item.id}
                className="flex justify-between gap-4"
                style={{ color: "#B9A8E6" }}
              >
                <span>{item.giorno}</span>
                <span className="hidden md:inline">{item.gioco}</span>
                <span>{item.orario}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="w-full px-4">
        <div className="flex flex-col gap-2 rounded-xl p-4 bg-brand-darkblu">
          <p className="font-semibold" style={{ color: "#F6ECD8" }}>
            Evento in evidenza
          </p>
          <p style={{ color: "#F6ECD8" }}>{eventoInEvidenza.titolo}</p>
          <p style={{ color: "#B9A8E6" }}>{eventoInEvidenza.data}</p>
          <p style={{ color: "#B9A8E6" }}>{eventoInEvidenza.descrizione}</p>
          <a
            href="https://discord.com/invite/4FskPTnBts"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl p-2 text-center bg-brand-blu"
            style={{ color: "#F6ECD8" }}
          >
            Partecipa →
          </a>
        </div>
      </div>

      <div className="w-full px-4">
        <div className="flex flex-col gap-2 rounded-xl p-4 bg-brand-darkblu">
          <p className="font-semibold" style={{ color: "#F6ECD8" }}>
            News recenti
          </p>
          <ul>
            {news?.map((item) => (
              <li key={item.id} className="flex items-start gap-3 py-2">
                <span className="text-xl">{item.icona}</span>
                <div className="flex-1">
                  <p style={{ color: "#F6ECD8" }}>{item.titolo}</p>
                  <p style={{ color: "#B9A8E6" }}>{item.testo}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
