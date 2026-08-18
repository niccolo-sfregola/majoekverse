const live = {
  isLive: true,
  game: "Claire Obscure: Expedition 33",
  dow: "Martedì",
  day: "18 Agosto 2026",
  time: "21:00",
  twitchUrl: "https://www.twitch.tv/majoekoto",
};

const schedule = [
  { giorno: "Mar", orario: "21:00", game: "Claire Obscure: Expedition 33" },
  { giorno: "Gio", orario: "21:00", game: "Resident Evil" },
  { giorno: "Sab", orario: "15:00", game: "Just Chatting" },
  { giorno: "Dom", orario: "21:00", game: "Posta del cuore di Joe" },
];

const news = [
  {
    icona: "🎁",
    titolo: "Giveaway in corso!",
    descrizione: "Partecipa subito su Discord",
    tempo: "2h fa",
  },
  {
    icona: "📅",
    titolo: "Cambiamento di schedule",
    descrizione: "Nuovi orari a partire da Aprile",
    tempo: "1g fa",
  },
  {
    icona: "▶️",
    titolo: "Nuovo video su YouTube!",
    descrizione: "Clair Obscur ep. 3",
    tempo: "2g fa",
  },
];


export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 style={{ fontSize: "2rem", fontWeight: 500 }}>maJoekverse</h1>
      <div className="flex gap-4 w-full px-4">
        <div className="flex-1 flex flex-col gap-2 rounded-xl p-4 bg-brand-darkblu">
          <p style={{ color: "#B9A8E6" }}>{live.game}</p>
          <p style={{ color: "#B9A8E6" }}>{live.day}</p>
          {live.isLive ? (
            <p style={{ color: "#B9A8E6" }}>
              Siamo in live!{" "}
              <a href={live.twitchUrl} target="_blank" rel="noopener noreferrer">
                Vai al canale
              </a>
            </p>
          ) : (
            <p style={{ color: "#B9A8E6" }}>
              Non siamo ancora in live: la prossima è alle {live.time}
            </p>
          )}
        </div>

        <div className="flex-1 flex flex-col gap-2 rounded-xl p-4 bg-brand-darkblu">
          <p className="font-semibold" style={{ color: "#F6ECD8" }}>
            Schedule
          </p>
          <ul className="flex flex-col gap-1">
            {schedule.map((item) => (
              <li
                key={item.giorno}
                className="flex justify-between gap-4"
                style={{ color: "#B9A8E6" }}
              >
                <span>{item.giorno}</span>
                <span className="hidden md:inline">{item.game}</span>
                <span>{item.orario}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="w-full px-4">
        <div className="flex flex-col gap-2 rounded-xl p-4 bg-brand-darkblu">
          <p className="font-semibold" style={{ color: "#F6ECD8" }}>
            News recenti
          </p>
          <ul>
            {news.map((item) => (
              <li key={item.titolo} className="flex items-start gap-3 py-2">
                <span className="text-xl">{item.icona}</span>
                <div className="flex-1">
                  <p style={{ color: "#F6ECD8" }}>{item.titolo}</p>
                  <p style={{ color: "#B9A8E6" }}>{item.descrizione}</p>
                </div>
                <span style={{ color: "#B9A8E6" }}>{item.tempo}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
