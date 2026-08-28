import { createClient } from "@/lib/supabase/server";

const eventiIntro = "Ecco i prossimi eventi della community:";

export default async function Eventi() {
  const supabase = await createClient();

  const { data: eventi } = await supabase
    .from("events")
    .select("*")
    .order("data", { ascending: true });

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
      <h1 style={{ fontSize: "2rem", fontWeight: 500 }}>Eventi</h1>
      <p style={{ color: "#B9A8E6" }}>{eventiIntro}</p>

      <div className="flex flex-col gap-3 w-full">
        {eventi?.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-2 rounded-xl p-4 bg-brand-darkblu"
          >
            <p className="font-semibold" style={{ color: "#F6ECD8" }}>
              {item.titolo}
            </p>
            <p style={{ color: "#B9A8E6" }}>{item.data}</p>
            <p style={{ color: "#B9A8E6" }}>{item.descrizione}</p>
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
        ))}
      </div>
    </main>
  );
}
