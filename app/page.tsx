import { createClient } from "@/lib/supabase/server";
import { getStreamStatus } from "@/lib/twitch";
import { getLatestVideo } from "@/lib/youtube";
import { shortDayIt } from "@/lib/schedule";
import LiveBlock from "./liveBlock";

export default async function Home() {
  const supabase = await createClient();

  const liveStatus = await getStreamStatus();
  const ultimoVideo = await getLatestVideo();

  // Due letture dal database. select("*") prende tutte le colonne;
  // order() decide l'ordine delle righe.
  const { data: schedule } = await supabase
    .from("schedule")
    .select("*")
    .order("data", { ascending: true });

  const { data: news } = await supabase
    .from("news")
    .select("*")
    .order("created_at", { ascending: false });

  const prossimeDirette = (schedule ?? []).filter((item) => item.data);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 style={{ fontSize: "2rem", fontWeight: 500 }}>maJoekverse</h1>
      <div className="flex gap-4 w-full px-4">
        <LiveBlock initial={liveStatus} />

        <div className="flex-1 flex flex-col gap-2 rounded-xl p-4 bg-brand-darkblu">
          <p className="font-semibold" style={{ color: "#F6ECD8" }}>
            Schedule
          </p>
          {prossimeDirette.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {prossimeDirette.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between gap-4"
                  style={{ color: "#B9A8E6" }}
                >
                  <span>{shortDayIt(item.data)}</span>
                  <span className="hidden md:inline">{item.gioco}</span>
                  <span>{item.orario}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: "#B9A8E6" }}>Stiamo per caricare la schedule…</p>
          )}
        </div>
      </div>

      <div className="w-full px-4">
        <div className="flex flex-col gap-2 rounded-xl p-4 bg-brand-darkblu">
          <p className="font-semibold" style={{ color: "#F6ECD8" }}>
            Ultimo video su YouTube
          </p>
          {ultimoVideo ? (
            <a
              href={ultimoVideo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ultimoVideo.thumbnail}
                alt=""
                className="rounded-lg w-full aspect-video object-cover"
              />
              <p style={{ color: "#F6ECD8" }}>{ultimoVideo.title}</p>
            </a>
          ) : (
            <p style={{ color: "#B9A8E6" }}>
              Nessun video da mostrare al momento.
            </p>
          )}
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
                  <p style={{ color: "#B9A8E6", whiteSpace: "pre-line" }}>
                    {item.testo}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
