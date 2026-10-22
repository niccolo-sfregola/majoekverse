// Tutti i testi fissi dell'interfaccia, in italiano e in inglese.
// L'italiano fa da "stampo": il tipo Dict è ricavato da `it`, quindi se in
// `en` manca una chiave (o ce n'è una in più) TypeScript dà errore.
// I contenuti scritti nel database (news, eventi, schedule) NON passano da qui.

const it = {
  nav: {
    home: "Home",
    giochi: "Giochi",
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
    news: "News",
    events: "Eventi",
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
    title: "Evento",
    subsOnly: "🔒 Solo abbonati",
    subscribe: "Abbonati per partecipare",
    join: "Partecipa →",
  },
  giochi: {
    title: "Giochi",
    subtitle: "Sfida la community (e Joe) ogni giorno e ogni settimana.",
    daily: "Gioco del giorno",
    dailyName: "Zip",
    dailyText:
      "Collega i numeri in ordine passando da tutte le caselle. Vince chi è più veloce: i primi 3 si prendono il badge del giorno.",
    weekly: "Ogni giorno · premio settimanale",
    weeklyName: "Parola del giorno",
    weeklyText:
      "Indovina la parola segreta (in italiano) ogni giorno e accumula punti. Chi ne fa di più in settimana propone il titolo di una live di Joe.",
    subsOnly: "🔒 Solo abbonati",
    comingSoon: "In arrivo",
    play: "Gioca →",
    win: "Hai vinto!",
  },
  parola: {
    title: "Parola del giorno",
    week: (da: string, a: string) => `Settimana dal ${da} al ${a}`,
    rules:
      "Indovina la parola segreta di 5 lettere (in italiano) in massimo 6 tentativi; ogni giorno ce n'è una nuova. Corallo = lettera giusta al posto giusto, lavanda = lettera presente ma in un altro posto. Punti: 6 se la indovini al primo tentativo, 5 al secondo… 1 al sesto, più +3/+2/+1 ai 3 più veloci del giorno. Chi fa più punti in settimana propone il titolo di una live di Joe.",
    loginText:
      "Accedi con Twitch per giocare alla parola del giorno. È riservata agli abbonati del canale.",
    notSub:
      "La parola del giorno è riservata agli abbonati del canale di Joe. Abbonati per sfidare la community!",
    subscribe: "Abbonati su Twitch",
    noToken:
      "Per controllare se sei abbonato ci serve un permesso Twitch in più. Aggiornalo dal Profilo e torna qui.",
    goToProfile: "Vai al Profilo",
    notSubShort: "Riservato agli abbonati.",
    noTokenShort: "Aggiorna i permessi Twitch dal Profilo.",
    tooShort: "Servono 5 lettere.",
    notWord: "Questa parola non è nella lista.",
    finished: "Hai già finito la partita di oggi.",
    checking: "Controllo…",
    error: "Qualcosa è andato storto: ricarica la pagina e riprova.",
    wonIn: (n: number, tempo: string) =>
      `Indovinata in ${n} ${n === 1 ? "tentativo" : "tentativi"} · ${tempo}`,
    lost: "Tentativi finiti! La parola verrà svelata domani.",
    enter: "Invio",
    delete: "Cancella",
    leaderboardToday: "Classifica di oggi",
    leaderboardWeek: "Classifica della settimana",
    noPlayers: "Ancora nessuno ha indovinato la parola di oggi.",
    noPlayersWeek: "Ancora nessun punto questa settimana.",
    yesterday: "Ieri",
    lastWeek: "Settimana scorsa",
    lastWord: "La parola era",
    lastWinner: "Ha vinto",
    noWinner: "Nessuno l'ha indovinata.",
    joeWon: "Joe vi ha battuti tutti 😏 Questa volta niente titolo da proporre: rifatevi questa settimana!",
    attempts: (n: number) => `${n}/6`,
    points: (n: number) => `${n} pt`,
    days: (n: number) => `${n} ${n === 1 ? "giorno" : "giorni"}`,
  },
  notifiche: {
    title: "Notifiche",
    intro:
      "Ricevi un avviso quando escono lo Zip e la parola del giorno, e un promemoria se non hai ancora giocato. Vale solo per questo dispositivo.",
    enable: "Attiva notifiche",
    enabling: "Attivo…",
    on: "Attive su questo dispositivo. Scegli cosa ricevere:",
    zip: "Zip del giorno (uscita, promemoria, podio)",
    wordle: "Parola del giorno (uscita e promemoria)",
    test: "Invia notifica di prova",
    testSent: "Inviata! Dovrebbe arrivare tra pochi secondi.",
    testTitle: "🔔 Notifica di prova",
    testBody: "Le notifiche funzionano! 🎉",
    newProposal: "🏆 Nuova proposta di titolo",
    accepted: "🎉 Joe ha accettato il tuo titolo!",
    rejected: "La tua proposta di titolo è stata rifiutata",
    rejectedBody: "Puoi proporne un'altra: apri la parola del giorno.",
    reason: "Motivo",
    zipOnline: "🧩 Lo Zip di oggi è online!",
    zipOnlineBody: "Quanto ci metti oggi? Sfida la community (e Joe).",
    zipPodium: (medaglia: string, pos: number) =>
      `${medaglia} Ieri ${pos}° posto nello Zip!`,
    zipPodiumBody: "Oggi hai il badge. Lo Zip nuovo è online: difendi il podio!",
    zipReminder: "⏰ Non hai ancora giocato lo Zip di oggi",
    zipReminderBody: "Hai tempo fino a mezzanotte!",
    wordleOnline: "🔤 La parola di oggi è online!",
    wordleOnlineBody:
      "Indovinala e fai punti: chi ne fa di più in settimana propone il titolo di una live.",
    wordleReminder: "🔤 La parola di oggi ti aspetta",
    wordleReminderBody: "Non hai ancora finito: hai tempo fino a mezzanotte.",
    wordleLast: "⏳ Ultima parola della settimana!",
    wordleLastBody: "Stanotte si chiude la classifica: gli ultimi punti decidono il vincitore.",
    disable: "Disattiva",
    denied:
      "Hai bloccato le notifiche per questo sito. Per riattivarle, cambia il permesso dalle impostazioni del browser e ricarica la pagina.",
    unsupported: "Questo browser non supporta le notifiche.",
    iosInstall:
      "Su iPhone le notifiche arrivano solo con l'app installata: tocca Condividi → \"Aggiungi alla schermata Home\", poi apri l'app da lì.",
    error: "Qualcosa è andato storto: ricarica la pagina e riprova.",
  },
  titolo: {
    heading: "Hai vinto la classifica della settimana scorsa!",
    canPropose: (n: number, giorno: string) =>
      `Proponi il titolo di una live di Joe: se gli piace, lo usa! Ti ${n === 1 ? "resta 1 proposta" : `restano ${n} proposte`}, hai tempo fino a ${giorno}.`,
    pending: "La tua proposta è in attesa: Joe la sta valutando.",
    accepted: "🎉 Joe ha accettato il tuo titolo! Tienilo d'occhio nelle prossime live.",
    exhausted: "Hai usato tutte e 3 le proposte. Ritenta questa settimana!",
    expired: "Il tempo per proporre il titolo è scaduto.",
    placeholder: "Scrivi qui il titolo che vorresti…",
    send: "Invia proposta",
    sending: "Invio…",
    sent: "Proposta inviata! ✅",
    reason: "Motivo",
    stati: {
      pending: "In attesa",
      accepted: "Accettata",
      rejected: "Rifiutata",
    },
    errorLength: "Il titolo deve avere da 1 a 140 caratteri.",
    errorNotAllowed: "Al momento non puoi inviare una proposta.",
    errorServer: "Qualcosa è andato storto: ricarica la pagina e riprova.",
  },
  zip: {
    title: "Zip del giorno",
    back: "← Giochi",
    rules:
      "Parti dall'1 e trascina un unico percorso che tocca i numeri in ordine e passa da tutte le caselle, senza attraversare i muri. Il tempo parte quando premi Inizia.",
    start: "Inizia",
    next: (n: number) => `Prossimo numero: ${n}`,
    fillAll: "Ora riempi tutte le caselle!",
    undo: "Annulla",
    reset: "Ricomincia",
    done: "Completato! 🎉",
    loading: "Carico…",
    resume: "Riprendi",
    inProgress:
      "Hai una partita in corso: il tempo sta ancora scorrendo! Riprendi da dove eri.",
    alreadyPlayed: "Hai già giocato lo Zip di oggi.",
    todayTime: "Il tuo tempo di oggi",
    comeBack: "Torna domani per un nuovo puzzle!",
    error: "Qualcosa è andato storto: ricarica la pagina e riprova.",
    loginText:
      "Accedi con Twitch per giocare e finire in classifica. Un tentativo al giorno: il tempo parte quando premi Inizia.",
    leaderboard: "Classifica di oggi",
    noPlayers: "Ancora nessuno ha finito lo Zip di oggi. Sarai il primo?",
    yesterday: "Podio di ieri",
    you: "tu",
    yourTime: "Il tuo tempo",
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
    zipBadge: "Zip di ieri",
    deleteAccount: "Elimina account",
    deleting: "Elimino…",
    deleteConfirm:
      "Vuoi davvero eliminare il tuo account? Verranno cancellati per sempre anche partite, classifiche, proposte e notifiche. Non si può annullare.",
    deleteError:
      "Non è stato possibile eliminare l'account. Riprova, o scrivi a niccolo.sfregola03@gmail.com.",
    logout: "Esci",
    loggingOut: "Esco…",
    loggedOutText:
      "Accedi con Twitch per vedere il tuo profilo, le tue statistiche col canale e, se sei admin, gestire i contenuti del sito.",
  },
  auth: {
    login: "Accedi con Twitch",
    opening: "Apro Twitch…",
    privacyBefore: "Accedendo accetti",
    privacyLink: "privacy e regole",
  },
  privacy: {
    link: "Privacy e regole",
  },
  onboarding: {
    skip: "Salta",
    welcome: "Benvenuto nel maJoekverse",
    intro:
      "Lo spazio della community di maJoekoto: dirette, eventi e tutto l'universo di Joe in un posto solo.",
    whatsHere: "Cosa trovi qui",
    sections: {
      home: "Se Joe è in diretta, la schedule, l'ultimo video, le news e gli eventi.",
      giochi: "Lo Zip e la parola del giorno: sfida la community e Joe.",
      profilo: "Le tue statistiche col canale, dopo l'accesso.",
      helpdesk: "Il supporto della community, sul Discord.",
      universo: "Bio, social e codici sconto (icona in alto a destra).",
    },
    universoName: "Universo di Joe",
    loginText:
      "Con l'accesso sblocchi il profilo con le tue statistiche col canale, i giochi e gli eventi riservati agli abbonati. Puoi anche entrare come ospite e accedere più tardi.",
    guest: "Continua come ospite",
    back: "Indietro",
    next: "Avanti",
  },
};

export type Dict = typeof it;

const en: Dict = {
  nav: {
    home: "Home",
    giochi: "Games",
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
    news: "News",
    events: "Events",
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
    title: "Event",
    subsOnly: "🔒 Subs only",
    subscribe: "Subscribe to join",
    join: "Join →",
  },
  giochi: {
    title: "Games",
    subtitle: "Challenge the community (and Joe) every day and every week.",
    daily: "Daily game",
    dailyName: "Zip",
    dailyText:
      "Connect the numbers in order, passing through every cell. Fastest wins: the top 3 get the badge of the day.",
    weekly: "Every day · weekly prize",
    weeklyName: "Word of the day",
    weeklyText:
      "Guess the secret word every day and collect points — Italian words only! Whoever scores the most in the week suggests the title of one of Joe's streams.",
    subsOnly: "🔒 Subs only",
    comingSoon: "Coming soon",
    play: "Play →",
    win: "You won!",
  },
  parola: {
    title: "Word of the day",
    week: (da: string, a: string) => `Week from ${da} to ${a}`,
    rules:
      "Guess the secret 5-letter word (Italian words only!) in at most 6 tries; there's a new one every day. Coral = right letter in the right spot, lavender = the letter is in the word but somewhere else. Points: 6 if you get it on the first try, 5 on the second… 1 on the sixth, plus +3/+2/+1 for the 3 fastest of the day. Whoever scores the most in the week suggests the title of one of Joe's streams.",
    loginText:
      "Sign in with Twitch to play the word of the day. It's for channel subscribers only.",
    notSub:
      "The word of the day is for subscribers of Joe's channel. Subscribe to challenge the community!",
    subscribe: "Subscribe on Twitch",
    noToken:
      "To check whether you're subscribed we need one more Twitch permission. Update it from your Profile and come back.",
    goToProfile: "Go to Profile",
    notSubShort: "Subscribers only.",
    noTokenShort: "Update your Twitch permissions from the Profile.",
    tooShort: "You need 5 letters.",
    notWord: "That word isn't in the list.",
    finished: "You've already finished today's game.",
    checking: "Checking…",
    error: "Something went wrong: reload the page and try again.",
    wonIn: (n: number, tempo: string) =>
      `Solved in ${n} ${n === 1 ? "try" : "tries"} · ${tempo}`,
    lost: "Out of tries! The word will be revealed tomorrow.",
    enter: "Enter",
    delete: "Delete",
    leaderboardToday: "Today's leaderboard",
    leaderboardWeek: "This week's leaderboard",
    noPlayers: "Nobody has guessed today's word yet.",
    noPlayersWeek: "No points yet this week.",
    yesterday: "Yesterday",
    lastWeek: "Last week",
    lastWord: "The word was",
    lastWinner: "Winner",
    noWinner: "Nobody guessed it.",
    joeWon: "Joe beat you all 😏 No title to suggest this time: get your revenge this week!",
    attempts: (n: number) => `${n}/6`,
    points: (n: number) => `${n} pts`,
    days: (n: number) => `${n} ${n === 1 ? "day" : "days"}`,
  },
  notifiche: {
    title: "Notifications",
    intro:
      "Get notified when the daily Zip and the word of the day come out, plus a reminder if you haven't played yet. Only for this device.",
    enable: "Turn on notifications",
    enabling: "Turning on…",
    on: "On for this device. Choose what to get:",
    zip: "Daily Zip (release, reminder, podium)",
    wordle: "Word of the day (release and reminders)",
    test: "Send a test notification",
    testSent: "Sent! It should arrive in a few seconds.",
    testTitle: "🔔 Test notification",
    testBody: "Notifications are working! 🎉",
    newProposal: "🏆 New title suggestion",
    accepted: "🎉 Joe accepted your title!",
    rejected: "Your title suggestion was rejected",
    rejectedBody: "You can send another one: open the word of the day.",
    reason: "Reason",
    zipOnline: "🧩 Today's Zip is out!",
    zipOnlineBody: "How fast can you do it? Challenge the community (and Joe).",
    zipPodium: (medaglia: string, pos: number) =>
      `${medaglia} #${pos} in yesterday's Zip!`,
    zipPodiumBody: "You have the badge today. The new Zip is out: defend the podium!",
    zipReminder: "⏰ You haven't played today's Zip yet",
    zipReminderBody: "You have until midnight!",
    wordleOnline: "🔤 Today's word is out!",
    wordleOnlineBody:
      "Guess it and score points: the week's top scorer suggests a stream title.",
    wordleReminder: "🔤 Today's word is waiting",
    wordleReminderBody: "You haven't finished yet: you have until midnight (Italian time).",
    wordleLast: "⏳ Last word of the week!",
    wordleLastBody: "The leaderboard closes tonight: the last points decide the winner.",
    disable: "Turn off",
    denied:
      "You've blocked notifications for this site. To turn them back on, change the permission in your browser settings and reload the page.",
    unsupported: "This browser doesn't support notifications.",
    iosInstall:
      "On iPhone, notifications only work with the app installed: tap Share → \"Add to Home Screen\", then open the app from there.",
    error: "Something went wrong: reload the page and try again.",
  },
  titolo: {
    heading: "You topped last week's leaderboard!",
    canPropose: (n: number, giorno: string) =>
      `Suggest the title of one of Joe's streams: if he likes it, he'll use it! You have ${n === 1 ? "1 suggestion" : `${n} suggestions`} left, until ${giorno}.`,
    pending: "Your suggestion is pending: Joe is looking at it.",
    accepted: "🎉 Joe accepted your title! Keep an eye on the next streams.",
    exhausted: "You've used all 3 suggestions. Try again this week!",
    expired: "The time to suggest a title has run out.",
    placeholder: "Write the title you'd like…",
    send: "Send suggestion",
    sending: "Sending…",
    sent: "Suggestion sent! ✅",
    reason: "Reason",
    stati: {
      pending: "Pending",
      accepted: "Accepted",
      rejected: "Rejected",
    },
    errorLength: "The title must be 1 to 140 characters long.",
    errorNotAllowed: "You can't send a suggestion right now.",
    errorServer: "Something went wrong: reload the page and try again.",
  },
  zip: {
    title: "Daily Zip",
    back: "← Games",
    rules:
      "Start from 1 and drag a single path that hits the numbers in order and goes through every cell, without crossing the walls. The timer starts when you press Start.",
    start: "Start",
    next: (n: number) => `Next number: ${n}`,
    fillAll: "Now fill every cell!",
    undo: "Undo",
    reset: "Restart",
    done: "Solved! 🎉",
    loading: "Loading…",
    resume: "Resume",
    inProgress:
      "You have a game in progress: the timer is still running! Pick up where you left off.",
    alreadyPlayed: "You've already played today's Zip.",
    todayTime: "Your time today",
    comeBack: "Come back tomorrow for a new puzzle!",
    error: "Something went wrong: reload the page and try again.",
    loginText:
      "Sign in with Twitch to play and get on the leaderboard. One try per day: the timer starts when you press Start.",
    leaderboard: "Today's leaderboard",
    noPlayers: "Nobody has finished today's Zip yet. Will you be the first?",
    yesterday: "Yesterday's podium",
    you: "you",
    yourTime: "Your time",
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
    zipBadge: "Yesterday's Zip",
    deleteAccount: "Delete account",
    deleting: "Deleting…",
    deleteConfirm:
      "Do you really want to delete your account? Your games, leaderboard positions, suggestions and notifications will be deleted forever too. This can't be undone.",
    deleteError:
      "We couldn't delete your account. Try again, or write to niccolo.sfregola03@gmail.com.",
    logout: "Log out",
    loggingOut: "Logging out…",
    loggedOutText:
      "Sign in with Twitch to see your profile, your stats with the channel and, if you're an admin, manage the site's content.",
  },
  auth: {
    login: "Sign in with Twitch",
    opening: "Opening Twitch…",
    privacyBefore: "By signing in you accept our",
    privacyLink: "privacy & rules",
  },
  privacy: {
    link: "Privacy & rules",
  },
  onboarding: {
    skip: "Skip",
    welcome: "Welcome to the maJoekverse",
    intro:
      "The home of maJoekoto's community: streams, events and all of Joe's universe in one place.",
    whatsHere: "What you'll find here",
    sections: {
      home: "Whether Joe is live, the schedule, the latest video, the news and the events.",
      giochi: "The daily Zip and word of the day: challenge the community and Joe.",
      profilo: "Your stats with the channel, once you sign in.",
      helpdesk: "Community support, on Discord.",
      universo: "Bio, socials and discount codes (icon at the top right).",
    },
    universoName: "Joe's Universe",
    loginText:
      "Signing in unlocks your profile with your channel stats, the games and the subscriber-only events. You can also continue as a guest and sign in later.",
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
