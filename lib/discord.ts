import { DISCORD_MAX } from "./announce";

// Manda un messaggio nel canale Discord tramite webhook.
// Il webhook è un URL segreto: chi ce l'ha può scrivere in quel canale.
export async function sendToDiscord(content: string): Promise<void> {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) throw new Error("DISCORD_WEBHOOK_URL non configurato");

  // Discord RIFIUTA (errore 400) i messaggi oltre i 2000 caratteri: meglio
  // tagliarli noi che non mandare niente.
  const body = content.slice(0, DISCORD_MAX);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: body }),
  });

  if (!res.ok) {
    throw new Error(`Discord ha risposto ${res.status}`);
  }
}
