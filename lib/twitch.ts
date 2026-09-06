// Parla con l'API di Twitch per sapere se il canale è in diretta.
// Tutto lato server: le chiavi non arrivano mai al browser.

import { unstable_cache } from "next/cache";

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

// Il token applicativo di Twitch dura settimane. Lo teniamo nella cache dati di
// Next (unstable_cache) per 1 ora: così sopravvive anche ai "cold start" del
// server, dove la memoria del processo è vuota e prima si rifaceva il login
// OAuth a ogni richiesta.
const getAppToken = unstable_cache(
  async (): Promise<string> => {
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
    return json.access_token as string;
  },
  ["twitch-app-token"],
  { revalidate: 3600 },
);

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

export type ChannelInfo = {
  id: string | null;
  profileImageUrl: string | null;
  displayName: string | null;
};

const NO_CHANNEL: ChannelInfo = {
  id: null,
  profileImageUrl: null,
  displayName: null,
};

// Id, foto profilo e nome del canale di Joe. Cambia di rado: cache 24h.
export async function getChannelInfo(): Promise<ChannelInfo> {
  try {
    const token = await getAppToken();
    const res = await fetch(
      `https://api.twitch.tv/helix/users?login=${TWITCH_LOGIN}`,
      {
        headers: {
          "Client-Id": process.env.TWITCH_CLIENT_ID!,
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 86400 },
      },
    );
    if (!res.ok) return NO_CHANNEL;
    const json = await res.json();
    const user = json.data?.[0];
    if (!user) return NO_CHANNEL;
    return {
      id: user.id ?? null,
      profileImageUrl: user.profile_image_url ?? null,
      displayName: user.display_name ?? null,
    };
  } catch {
    return NO_CHANNEL;
  }
}

export type ChannelOverview = {
  isLive: boolean;
  viewers: number | null;
  game: string | null;
  lastVideo: { title: string; url: string; views: number } | null;
  topClip: { title: string; url: string; views: number } | null;
};

const EMPTY_OVERVIEW: ChannelOverview = {
  isLive: false,
  viewers: null,
  game: null,
  lastVideo: null,
  topClip: null,
};

// Panoramica pubblica del canale (nessun token utente): spettatori se in
// diretta, ultimo VOD, clip più vista degli ultimi 7 giorni.
export async function getChannelOverview(): Promise<ChannelOverview> {
  try {
    const { id } = await getChannelInfo();
    if (!id) return EMPTY_OVERVIEW;

    const token = await getAppToken();
    const headers = {
      "Client-Id": process.env.TWITCH_CLIENT_ID!,
      Authorization: `Bearer ${token}`,
    };
    const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();

    const [streamRes, videoRes, clipRes] = await Promise.all([
      fetch(`https://api.twitch.tv/helix/streams?user_id=${id}`, {
        headers,
        next: { revalidate: 60 },
      }),
      fetch(
        `https://api.twitch.tv/helix/videos?user_id=${id}&first=1&type=archive`,
        { headers, next: { revalidate: 600 } },
      ),
      fetch(
        `https://api.twitch.tv/helix/clips?broadcaster_id=${id}&first=1&started_at=${weekAgo}`,
        { headers, next: { revalidate: 1800 } },
      ),
    ]);

    const stream = streamRes.ok ? (await streamRes.json()).data?.[0] : null;
    const video = videoRes.ok ? (await videoRes.json()).data?.[0] : null;
    const clip = clipRes.ok ? (await clipRes.json()).data?.[0] : null;

    return {
      isLive: !!stream,
      viewers: stream?.viewer_count ?? null,
      game: stream?.game_name || null,
      lastVideo: video
        ? { title: video.title, url: video.url, views: video.view_count ?? 0 }
        : null,
      topClip: clip
        ? { title: clip.title, url: clip.url, views: clip.view_count ?? 0 }
        : null,
    };
  } catch {
    return EMPTY_OVERVIEW;
  }
}
