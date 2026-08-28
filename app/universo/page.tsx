import { createClient } from "@/lib/supabase/server";

const bio =
  "Ciao, sono Joe! 🧸 30 anni, napoletano di nascita e vivo in Toscana. Content creator e studente di Scienze dell'Educazione e della Formazione 📚 In diretta gioco soprattutto horror game, indie game e giochi in community, su PC e PS5 🎮 Vieni a giocare e a conoscerci 🫶";

const sponsorIntro =
  "I miei sponsor: clicca per scoprirli, e usa il codice sconto indicato per supportarmi e per avere sui vostri ordini il 10% di sconto.";

const socialsIntro =
  "Seguimi sui miei canali social:";

const socials = [
  { name: "Twitch", link: "https://twitch.tv/majoekoto" },
  { name: "Instagram", link: "https://instagram.com/majoekoto" },
  { name: "YouTube", link: "https://youtube.com/@majoekoto" },
  { name: "Discord", link: "https://discord.com/invite/4FskPTnBts"}
];

const otherLinksIntro =
  "Altri modi per sostenermi e restare in contatto:";

const otherLinks = [
  { name: "KOTO MAIL CLUB", link: "https://www.patreon.com/cw/kotomailclub" },
  { name: "POSTA DEL CUORE", link: "https://forms.gle/6nFhSHwyy2rHiWKJ7" },
];

const cardColor = "bg-brand-blu";

export default async function Universo() {
  const supabase = await createClient();

  const { data: sponsor } = await supabase
    .from("sponsors")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
      <h1 style={{ fontSize: "2rem", fontWeight: 500 }}>Universo di Joe</h1>

      <p style={{ color: "#B9A8E6" }}>{bio}</p>

      <div className="flex flex-col gap-2 rounded-xl p-4 bg-brand-darkblu w-full">
        <p className="font-semibold" style={{ color: "#F6ECD8" }}>
          {socialsIntro}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {socials.map((item) => (
            <a
              key={item.name}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-xl p-4 text-center ${cardColor}`}
              style={{ color: "#F6ECD8" }}
            >
              {item.name}
            </a>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-xl p-4 bg-brand-darkblu w-full">
        <p className="font-semibold" style={{ color: "#F6ECD8" }}>
          {sponsorIntro}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {sponsor?.map((item) => (
            <a
              key={item.name}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center gap-1 rounded-xl p-4 text-center ${cardColor}`}
              style={{ color: "#F6ECD8" }}
            >
              <span>{item.name}</span>
              <span className="text-sm">{item.code}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-xl p-4 bg-brand-darkblu w-full">
        <p className="font-semibold" style={{ color: "#F6ECD8" }}>
          {otherLinksIntro}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {otherLinks.map((item) => (
            <a
              key={item.name}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-xl p-4 text-center ${cardColor}`}
              style={{ color: "#F6ECD8" }}
            >
              {item.name}
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}