import { DISCORD_MAX } from "./announce";

// Il webhook è un URL segreto: chi ce l'ha può scrivere in quel canale.
function webhookUrl(): URL {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) throw new Error("DISCORD_WEBHOOK_URL non configurato");
  return new URL(url);
}

// Discord RIFIUTA (errore 400) i messaggi oltre i 2000 caratteri: meglio
// tagliarli noi che non mandare niente.
function payload(content: string): string {
  return JSON.stringify({ content: content.slice(0, DISCORD_MAX) });
}

// Manda un messaggio nel canale Discord tramite webhook e restituisce il suo
// id, che serve per modificarlo in seguito.
export async function sendToDiscord(content: string): Promise<string> {
  const url = webhookUrl();
  // Con wait=true Discord risponde con il messaggio creato (id compreso)
  // invece di una risposta vuota.
  url.searchParams.set("wait", "true");

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload(content),
  });

  if (!res.ok) {
    throw new Error(`Discord ha risposto ${res.status}`);
  }

  const message = (await res.json()) as { id: string };
  return message.id;
}

// Sostituisce il testo di un messaggio già mandato da QUESTO webhook.
// Restituisce false se il messaggio non esiste più (es. cancellato su
// Discord), così chi chiama può mandarne uno nuovo.
export async function editDiscordMessage(
  messageId: string,
  content: string,
): Promise<boolean> {
  const url = webhookUrl();
  url.pathname += `/messages/${messageId}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: payload(content),
  });

  if (res.status === 404) return false;
  if (!res.ok) {
    throw new Error(`Discord ha risposto ${res.status}`);
  }
  return true;
}
