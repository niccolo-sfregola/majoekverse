// Parla con l'API di Twitch per sapere se il canale è in diretta.
// Tutto lato server: le chiavi non arrivano mai al browser.

const TWITCH_LOGIN = "majoekoto";

export type LiveStatus = {
  isLive: boolean;
  game: string | null;
  title: string | null;
  startedAt: string | null;
};

const OFFLINE: LiveStatus = {
  isLive: false,
  game: null,
  title: null,
  startedAt: null,
};

// Il token applicativo di Twitch dura settimane: lo teniamo in memoria e lo
// rinnoviamo solo quando sta per scadere.
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAppToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID!,
      client_secret: process.env.TWITCH_CLIENT_SECRET!,
      grant_type: "client_credentials",
    }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Twitch token: ${res.status}`);

  const json = await res.json();
  cachedToken = {
    value: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return cachedToken.value;
}

export async function getStreamStatus(): Promise<LiveStatus> {
  try {
    const token = await getAppToken();

    const res = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${TWITCH_LOGIN}`,
      {
        headers: {
          "Client-Id": process.env.TWITCH_CLIENT_ID!,
          Authorization: `Bearer ${token}`,
        },
        // Ricontrolla al massimo una volta al minuto.
        next: { revalidate: 60 },
      },
    );

    if (!res.ok) return OFFLINE;

    const json = await res.json();
    const stream = json.data?.[0];
    if (!stream) return OFFLINE;

    return {
      isLive: true,
      game: stream.game_name || null,
      title: stream.title || null,
      startedAt: stream.started_at || null,
    };
  } catch {
    // Se Twitch non risponde o le chiavi mancano, mostriamo "offline"
    // invece di far crashare la pagina.
    return OFFLINE;
  }
}
