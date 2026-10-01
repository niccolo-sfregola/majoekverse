// Tutti i testi fissi dell'interfaccia, in italiano e in inglese.
// L'italiano fa da "stampo": il tipo Dict è ricavato da `it`, quindi se in
// `en` manca una chiave (o ce n'è una in più) TypeScript dà errore.
// I contenuti scritti nel database (news, eventi, schedule) NON passano da qui.

const it = {
  nav: {
    home: "Home",
    eventi: "Eventi",
    profilo: "Profilo",
    helpdesk: "Help Desk",
    universo: "Esplora l'universo di Joe",
    universoHover: "Esplora l'universo di Joe!",
  },
  lang: {
    label: "Lingua",
  },
  common: {
    close: "Chiudi",
  },
  meta: {
    description:
      "Dirette, eventi e universo di maJoekoto: uno spazio solo per la community.",
  },
  home: {
    subtitle: "L'app ufficiale di maJoekoto!",
    latestVideo: "Ultimo video su YouTube",
    noVideo: "Nessun video da mostrare al momento.",
    news: "News & eventi",
  },
  live: {
    liveNow: "In diretta ora",
    watch: "Guarda su Twitch →",
    offline: "Al momento offline",
    noStream: "Nessuna diretta in corso.",
    goToChannel: "Vai al canale",
  },
  schedule: {
    title: "Schedule",
    weekTitle: "Schedule della settimana",
    loading: "Stiamo per caricare la schedule…",
    next: "Prossima",
    tbd: "Gioco da definire",
    timezoneNote: "",
  },
  news: {
    title: "News",
    empty: "Nessuna news al momento.",
  },
  eventi: {
    title: "Eventi",
    subtitle: "I prossimi appuntamenti della community.",
    empty: "Nessun evento in programma per ora. Torna a trovarci!",
    subsOnly: "🔒 Solo abbonati",
    subscribe: "Abbonati per partecipare",
    join: "Partecipa →",
  },
  helpdesk: {
    text: "Il supporto della community si gestisce su Discord. Apri il canale dedicato, scrivi il tuo problema e ti rispondiamo appena possibile.",
    button: "Apri il canale supporto",
  },
  universo: {
    title: "Universo di Joe",
    bio: "Ciao, sono Joe! Sono un content creator napoletano che vive in Toscana e studente di Scienze dell’Educazione e della Formazione. Creo contenuti dedicati a gaming, tecnologia, lifestyle e skincare, lavoro come UGC creator e porto avanti diversi progetti creativi. Su Twitch condivido soprattutto giochi horror, indie e narrativi, insieme a una community accogliente e inclusiva. Sono anche la mente dietro Koto Mail Club, La Posta del Cuore e il podcast The Big Bear Theory: modi diversi per trasformare le mie passioni in esperienze da condividere, online e offline. 🧸",
    socials: "Sui social",
    sponsor: "Sponsor",
    discountWithCode: (sconto: string) => `Sconto ${sconto} con il codice`,
    useCode: "Usa il codice sconto",
    goToSite: "Vai al sito →",
    affiliations: "Affiliazioni",
    affiliationsText: "Codici sconto dei brand con cui Joe collabora.",
    discount: (sconto: string) => `Sconto ${sconto}`,
    projects: "Progetti",
    bigBearTheory:
      "Il podcast di Joe su Spotify: cultura pop, drama di influencer e i temi che gli stanno a cuore, raccontati a modo suo.",
    kotoMailClub:
      "Ogni mese Joe ti spedisce a casa lettere, sticker e paper goodies. Su Patreon.",
    postaDelCuore:
      "Lascia un pensiero, una confidenza, una poesia, in forma anonima. Verranno letti in diretta.",
    copy: "copia",
    copied: "copiato!",
  },
  profilo: {
    title: "Profilo",
    loginWith: "Accesso con Twitch",
    channelOverview: "Panoramica canale",
    stats: "Statistiche",
    status: "Stato",
    live: "In diretta",
    viewers: "Spettatori",
    game: "Gioco",
    lastVod: "Ultimo VOD",
    topClip: "Clip top (7 gg)",
    views: "visual.",
    followers: "Follower",
    subscribers: "Abbonati",
    subPoints: "Punti sub",
    role: "Ruolo",
    member: "Membro",
    memberSince: "Su maJoekverse da",
    subscribed: "Abbonato al canale",
    followsSince: "Segui Joe da",
    notYet: "Non ancora",
    yes: "Sì",
    no: "No",
    soon: "presto",
    na: "n/d",
    refreshPermissions: "Aggiorna i permessi Twitch per le statistiche",
    connectChannel: "Collega il canale per vedere follower e abbonati",
    adminArea: "Area Admin",
    logout: "Esci",
    loggingOut: "Esco…",
    loggedOutText:
      "Accedi con Twitch per vedere il tuo profilo, le tue statistiche col canale e, se sei admin, gestire i contenuti del sito.",
  },
  auth: {
    login: "Accedi con Twitch",
    opening: "Apro Twitch…",
  },
  onboarding: {
    skip: "Salta",
    welcome: "Benvenuto nel maJoekverse",
    intro:
      "Lo spazio della community di maJoekoto: dirette, eventi e tutto l'universo di Joe in un posto solo.",
    whatsHere: "Cosa trovi qui",
    sections: {
      home: "Se Joe è in diretta, la schedule, l'ultimo video e le news.",
      eventi: "Gli appuntamenti della community, alcuni riservati agli abbonati.",
      profilo: "Le tue statistiche col canale, dopo l'accesso.",
      helpdesk: "Il supporto della community, sul Discord.",
      universo: "Bio, social e codici sconto (icona in alto a destra).",
    },
    universoName: "Universo di Joe",
    loginText:
      "Con l'accesso sblocchi il profilo con le tue statistiche col canale e gli eventi riservati agli abbonati. Puoi anche entrare come ospite e accedere più tardi.",
    guest: "Continua come ospite",
    back: "Indietro",
    next: "Avanti",
  },
};

export type Dict = typeof it;

const en: Dict = {
  nav: {
    home: "Home",
    eventi: "Events",
    profilo: "Profile",
    helpdesk: "Help Desk",
    universo: "Explore Joe's universe",
    universoHover: "Explore Joe's universe!",
  },
  lang: {
    label: "Language",
  },
  common: {
    close: "Close",
  },
  meta: {
    description:
      "Streams, events and maJoekoto's universe: a space just for the community.",
  },
  home: {
    subtitle: "maJoekoto's official app!",
    latestVideo: "Latest YouTube video",
    noVideo: "No video to show right now.",
    news: "News & events",
  },
  live: {
    liveNow: "Live now",
    watch: "Watch on Twitch →",
    offline: "Currently offline",
    noStream: "No stream right now.",
    goToChannel: "Go to channel",
  },
  schedule: {
    title: "Schedule",
    weekTitle: "This week's schedule",
    loading: "The schedule is coming soon…",
    next: "Next",
    tbd: "Game TBA",
    timezoneNote: "Times are in Italian time",
  },
  news: {
    title: "News",
    empty: "No news right now.",
  },
  eventi: {
    title: "Events",
    subtitle: "The community's upcoming events.",
    empty: "No events planned for now. Check back soon!",
    subsOnly: "🔒 Subs only",
    subscribe: "Subscribe to join",
    join: "Join →",
  },
  helpdesk: {
    text: "Community support is handled on Discord. Open the dedicated channel, describe your problem and we'll get back to you as soon as possible.",
    button: "Open the support channel",
  },
  universo: {
    title: "Joe's Universe",
    bio: "Hi, I'm Joe! I'm a content creator from Naples living in Tuscany, and a student of Education and Training Sciences. I make content about gaming, tech, lifestyle and skincare, I work as a UGC creator and I run several creative projects. On Twitch I mostly play horror, indie and story-driven games, together with a welcoming and inclusive community. I'm also the mind behind Koto Mail Club, La Posta del Cuore and the podcast The Big Bear Theory: different ways to turn my passions into experiences to share, online and offline. 🧸",
    socials: "Socials",
    sponsor: "Sponsor",
    discountWithCode: (sconto: string) => `${sconto} off with the code`,
    useCode: "Use the discount code",
    goToSite: "Visit the site →",
    affiliations: "Affiliations",
    affiliationsText: "Discount codes from brands Joe works with.",
    discount: (sconto: string) => `${sconto} off`,
    projects: "Projects",
    bigBearTheory:
      "Joe's podcast on Spotify: pop culture, influencer drama and the topics close to his heart, told his way.",
    kotoMailClub:
      "Every month Joe mails you letters, stickers and paper goodies. On Patreon.",
    postaDelCuore:
      "Leave a thought, a secret, a poem, anonymously. They'll be read live on stream.",
    copy: "copy",
    copied: "copied!",
  },
  profilo: {
    title: "Profile",
    loginWith: "Signed in with Twitch",
    channelOverview: "Channel overview",
    stats: "Stats",
    status: "Status",
    live: "Live",
    viewers: "Viewers",
    game: "Game",
    lastVod: "Latest VOD",
    topClip: "Top clip (7 days)",
    views: "views",
    followers: "Followers",
    subscribers: "Subscribers",
    subPoints: "Sub points",
    role: "Role",
    member: "Member",
    memberSince: "On maJoekverse since",
    subscribed: "Subscribed to the channel",
    followsSince: "Following Joe since",
    notYet: "Not yet",
    yes: "Yes",
    no: "No",
    soon: "soon",
    na: "n/a",
    refreshPermissions: "Update Twitch permissions to see your stats",
    connectChannel: "Connect the channel to see followers and subscribers",
    adminArea: "Admin area",
    logout: "Log out",
    loggingOut: "Logging out…",
    loggedOutText:
      "Sign in with Twitch to see your profile, your stats with the channel and, if you're an admin, manage the site's content.",
  },
  auth: {
    login: "Sign in with Twitch",
    opening: "Opening Twitch…",
  },
  onboarding: {
    skip: "Skip",
    welcome: "Welcome to the maJoekverse",
    intro:
      "The home of maJoekoto's community: streams, events and all of Joe's universe in one place.",
    whatsHere: "What you'll find here",
    sections: {
      home: "Whether Joe is live, the schedule, the latest video and the news.",
      eventi: "Community events, some reserved for subscribers.",
      profilo: "Your stats with the channel, once you sign in.",
      helpdesk: "Community support, on Discord.",
      universo: "Bio, socials and discount codes (icon at the top right).",
    },
    universoName: "Joe's Universe",
    loginText:
      "Signing in unlocks your profile with your channel stats and the subscriber-only events. You can also continue as a guest and sign in later.",
    guest: "Continue as guest",
    back: "Back",
    next: "Next",
  },
};

export const LANGS = ["it", "en"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "it";
// Nome del cookie in cui ricordiamo la lingua scelta (vedi app/langActions.ts).
export const LANG_COOKIE = "lang";

export const dictionaries: Record<Lang, Dict> = { it, en };

export function isLang(value: unknown): value is Lang {
  return LANGS.includes(value as Lang);
}

// Locale da passare a Intl / toLocaleDateString per le date.
export const DATE_LOCALE: Record<Lang, string> = { it: "it-IT", en: "en-GB" };
