// Ultimo video dal canale YouTube di Joe.
//
// Due strade:
//  1. API ufficiale di YouTube (se c'è YOUTUBE_API_KEY): affidabile anche dai
//     server di Vercel.
//  2. Feed RSS pubblico: funziona dal PC di casa, ma YouTube blocca gli IP dei
//     datacenter, quindi in produzione è solo un ripiego.
const CHANNEL_ID = "UCgT_9dL0ccR40Bv-WlTVvNw"; // @maJoekoto
// La playlist "caricamenti" di un canale è il suo ID con UC -> UU.
const UPLOADS_PLAYLIST = "UU" + CHANNEL_ID.slice(2);
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

export type LatestVideo = {
  title: string;
  url: string;
  thumbnail: string;
  publishedAt: string;
} | null;

function decodeXml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

async function fromApi(): Promise<LatestVideo> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;

  const url =
    "https://www.googleapis.com/youtube/v3/playlistItems" +
    `?part=snippet&maxResults=1&playlistId=${UPLOADS_PLAYLIST}&key=${key}`;

  const res = await fetch(url, { next: { revalidate: 900 } });
  if (!res.ok) return null;

  const json = await res.json();
  const s = json.items?.[0]?.snippet;
  const id = s?.resourceId?.videoId;
  if (!s || !id) return null;

  return {
    title: s.title,
    url: `https://www.youtube.com/watch?v=${id}`,
    thumbnail:
      s.thumbnails?.high?.url ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    publishedAt: s.publishedAt ?? "",
  };
}

async function fromRss(): Promise<LatestVideo> {
  const res = await fetch(FEED_URL, {
    next: { revalidate: 900 },
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
      "Accept-Language": "it,en;q=0.8",
    },
  });
  if (!res.ok) return null;

  const xml = await res.text();
  const entry = xml.split("<entry>")[1]; // il primo <entry> è il più recente
  if (!entry) return null;

  const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
  const title = entry.match(/<title>([^<]+)<\/title>/)?.[1];
  const publishedAt = entry.match(/<published>([^<]+)<\/published>/)?.[1] ?? "";
  if (!id || !title) return null;

  return {
    title: decodeXml(title),
    url: `https://www.youtube.com/watch?v=${id}`,
    thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    publishedAt,
  };
}

export async function getLatestVideo(): Promise<LatestVideo> {
  try {
    return (await fromApi()) ?? (await fromRss());
  } catch {
    return null;
  }
}
