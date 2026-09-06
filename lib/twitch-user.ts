// Statistiche del canale che richiedono il token OAuth del broadcaster (Joe):
// numero follower e abbonati. Il token è salvato in twitch_credentials e viene
// rinnovato con il refresh_token quando scaduto.

import { createAdminClient } from "@/lib/supabase/admin";

// Scope chiesti a ogni utente: da quando segue Joe e se è abbonato.
export const USER_CHANNEL_SCOPES =
  "user:read:follows user:read:subscriptions";

// Joe (broadcaster) ne chiede in più per leggere follower/abbonati del canale.
// Include anche quelli utente, così il suo token può fare tutto.
export const JOE_CHANNEL_SCOPES = `moderator:read:followers channel:read:subscriptions ${USER_CHANNEL_SCOPES}`;

const BROADCASTER_MARKER = "channel:read:subscriptions";

async function getStoredToken(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("twitch_credentials")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return null;

  const valid =
    data.expires_at &&
    new Date(data.expires_at).getTime() > Date.now() + 60_000;
  if (valid) return data.access_token;

  if (!data.refresh_token) return null;

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID!,
      client_secret: process.env.TWITCH_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: data.refresh_token,
    }),
    cache: "no-store",
  });
  if (!res.ok) return null;

  const json = await res.json();
  await admin
    .from("twitch_credentials")
    .update({
      access_token: json.access_token,
      refresh_token: json.refresh_token ?? data.refresh_token,
      expires_at: new Date(
        Date.now() + (json.expires_in ?? 14_400) * 1000,
      ).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  return json.access_token as string;
}

export async function saveUserToken(input: {
  userId: string;
  accessToken: string;
  refreshToken: string | null;
  scopes: string;
  expiresIn?: number;
}): Promise<void> {
  const admin = createAdminClient();
  await admin.from("twitch_credentials").upsert({
    user_id: input.userId,
    access_token: input.accessToken,
    refresh_token: input.refreshToken,
    expires_at: new Date(
      Date.now() + (input.expiresIn ?? 4 * 3600) * 1000,
    ).toISOString(),
    scopes: input.scopes,
    updated_at: new Date().toISOString(),
  });
}

export function saveJoeToken(input: {
  userId: string;
  accessToken: string;
  refreshToken: string | null;
  expiresIn?: number;
}): Promise<void> {
  return saveUserToken({ ...input, scopes: JOE_CHANNEL_SCOPES });
}

// Salva il token di un utente normale, MA non declassa quello di Joe: se la
// riga esistente ha già gli scope da broadcaster, la lascia com'è.
export async function saveViewerToken(input: {
  userId: string;
  accessToken: string;
  refreshToken: string | null;
  expiresIn?: number;
}): Promise<void> {
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("twitch_credentials")
    .select("scopes")
    .eq("user_id", input.userId)
    .maybeSingle();

  if (existing?.scopes?.includes(BROADCASTER_MARKER)) return;

  await saveUserToken({ ...input, scopes: USER_CHANNEL_SCOPES });
}

export type ChannelStats = {
  connected: boolean;
  followers: number | null;
  subscribers: number | null;
  subPoints: number | null;
};

const NOT_CONNECTED: ChannelStats = {
  connected: false,
  followers: null,
  subscribers: null,
  subPoints: null,
};

export type ChannelRelation = {
  connected: boolean;
  followsSince: string | null; // data ISO
  subscribed: boolean;
  subTier: string | null; // "1000" | "2000" | "3000"
};

const NO_RELATION: ChannelRelation = {
  connected: false,
  followsSince: null,
  subscribed: false,
  subTier: null,
};

// Rapporto tra un utente e il canale di Joe. `dbUserId` = id Supabase (per il
// token salvato). L'id Twitch dell'utente si ricava dal token stesso, così non
// dipendiamo da come Supabase riempie user_metadata.
export async function getUserChannelRelation(
  dbUserId: string,
  broadcasterId: string,
): Promise<ChannelRelation> {
  try {
    const token = await getStoredToken(dbUserId);
    if (!token) {
      console.log("[relation] nessun token salvato per", dbUserId);
      return NO_RELATION;
    }

    // Diagnostica: quali scope ha davvero il token salvato.
    try {
      const val = await fetch("https://id.twitch.tv/oauth2/validate", {
        headers: { Authorization: `OAuth ${token}` },
        cache: "no-store",
      });
      console.log(
        "[relation] validate:",
        val.status,
        val.ok ? (await val.json()).scopes : "",
      );
    } catch {}

    const headers = {
      "Client-Id": process.env.TWITCH_CLIENT_ID!,
      Authorization: `Bearer ${token}`,
    };

    // Chi è il proprietario del token (endpoint /helix/users senza login).
    const meRes = await fetch("https://api.twitch.tv/helix/users", {
      headers,
      cache: "no-store",
    });
    if (!meRes.ok) {
      console.log("[relation] /helix/users:", meRes.status);
      return NO_RELATION;
    }
    const twitchUserId = (await meRes.json())?.data?.[0]?.id;
    if (!twitchUserId) return NO_RELATION;

    const [followRes, subRes] = await Promise.all([
      fetch(
        `https://api.twitch.tv/helix/channels/followed?user_id=${twitchUserId}&broadcaster_id=${broadcasterId}`,
        { headers, cache: "no-store" },
      ),
      fetch(
        `https://api.twitch.tv/helix/subscriptions/user?broadcaster_id=${broadcasterId}&user_id=${twitchUserId}`,
        { headers, cache: "no-store" },
      ),
    ]);

    console.log(
      "[relation] followed:",
      followRes.status,
      "subscription:",
      subRes.status,
    );

    const followAuthFail =
      followRes.status === 401 || followRes.status === 403;
    const subAuthFail = subRes.status === 401 || subRes.status === 403;
    // Token vecchio senza i nuovi scope: da ricollegare.
    if (followAuthFail && subAuthFail) return NO_RELATION;

    const follow = followRes.ok ? await followRes.json() : null;
    const followsSince = follow?.data?.[0]?.followed_at ?? null;

    let subscribed = false;
    let subTier: string | null = null;
    if (subRes.ok) {
      const s = (await subRes.json())?.data?.[0];
      if (s) {
        subscribed = true;
        subTier = s.tier ?? null;
      }
    }
    // subRes 404 = non abbonato (resta false)

    return { connected: true, followsSince, subscribed, subTier };
  } catch {
    return NO_RELATION;
  }
}

export async function getJoeChannelStats(
  userId: string,
  broadcasterId: string,
): Promise<ChannelStats> {
  try {
    const token = await getStoredToken(userId);
    if (!token) return NOT_CONNECTED;

    const headers = {
      "Client-Id": process.env.TWITCH_CLIENT_ID!,
      Authorization: `Bearer ${token}`,
    };

    const [followRes, subRes] = await Promise.all([
      fetch(
        `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${broadcasterId}&first=1`,
        { headers, cache: "no-store" },
      ),
      fetch(
        `https://api.twitch.tv/helix/subscriptions?broadcaster_id=${broadcasterId}&first=1`,
        { headers, cache: "no-store" },
      ),
    ]);

    // 401 = token non più valido / scope revocati: da ricollegare.
    if (followRes.status === 401 || subRes.status === 401) {
      return NOT_CONNECTED;
    }

    const follow = followRes.ok ? await followRes.json() : null;
    const sub = subRes.ok ? await subRes.json() : null;

    return {
      connected: true,
      followers: follow?.total ?? null,
      subscribers: sub?.total ?? null,
      subPoints: sub?.points ?? null,
    };
  } catch {
    return NOT_CONNECTED;
  }
}
