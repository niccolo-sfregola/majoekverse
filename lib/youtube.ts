// Ultimo video dal canale YouTube di Joe.
// Niente API key: YouTube pubblica un feed RSS per ogni canale.
const CHANNEL_ID = "UCgT_9dL0ccR40Bv-WlTVvNw"; // @maJoekoto
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

export async function getLatestVideo(): Promise<LatestVideo> {
  try {
    // Ricontrolla al massimo ogni 15 minuti.
    // Gli header da browser sono necessari: senza User-Agent il server RSS
    // di YouTube risponde 404 (soprattutto dai server, non dal PC di casa).
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
    if (!xml.includes("<entry>")) return null;
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
  } catch {
    return null;
  }
}
