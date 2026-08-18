const helpDeskText =
  "Hai bisogno di aiuto o vuoi segnalare un problema? Per ora ci trovi direttamente su Discord.";

export default function HelpDesk() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 text-center">
      <h1 style={{ fontSize: "2rem", fontWeight: 500 }}>Help Desk</h1>
      <p style={{ color: "#B9A8E6" }}>{helpDeskText}</p>
      <a
        href="https://discord.com/channels/1401611321790693416/1520103878228443287"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-xl p-4 bg-brand-blu"
        style={{ color: "#F6ECD8" }}
      >
        Vai al Discord →
      </a>
    </main>
  );
}
