import type { Lang } from "./i18n/dictionaries";

// Testo dell'informativa privacy (GDPR, art. 13) + regole dei giochi.
// Sta qui e non nel dizionario perché è lungo: se cambia qualcosa nei dati
// raccolti (nuove tabelle, nuovi fornitori), va aggiornato QUI e la data
// `aggiornata` va cambiata.

export const PRIVACY_EMAIL = "niccolo.sfregola03@gmail.com";

type Section = { title: string; paragraphs?: string[]; list?: string[] };
type PrivacyText = {
  title: string;
  updated: string;
  intro: string;
  sections: Section[];
};

const it: PrivacyText = {
  title: "Privacy e regole",
  updated: "Ultimo aggiornamento: 1 ottobre 2026",
  intro:
    "Qui trovi quali dati raccoglie maJoekverse, perché, per quanto tempo e come puoi chiederne la cancellazione. Abbiamo cercato di scriverla in modo semplice.",
  sections: [
    {
      title: "Chi è il titolare",
      paragraphs: [
        `Il titolare del trattamento è Niccolò Sfregola, che ha creato e gestisce l'app maJoekverse (la community di maJoekoto). Per qualsiasi domanda o richiesta sulla privacy scrivi a ${PRIVACY_EMAIL}.`,
      ],
    },
    {
      title: "Cosa raccogliamo e perché",
      list: [
        "Account Twitch (nome utente, nome visualizzato, immagine del profilo, ID Twitch e indirizzo email dell'account Twitch): servono per farti accedere. L'email ce la passa Twitch al login: non la mostriamo a nessuno e non la usiamo per scriverti.",
        "Rapporto con il canale di Joe (se lo segui, da quando, se sei abbonato): lo leggiamo da Twitch con un permesso che ci dai al login, per mostrarti le statistiche nel Profilo e aprirti gli eventi e i giochi riservati agli abbonati. Per farlo salviamo un token di accesso Twitch.",
        "Partite ai giochi (giorno o settimana, tempi, numero di tentativi, parole provate): servono per le classifiche, i badge e per non farti giocare due volte la stessa partita.",
        "Classifiche pubbliche: il tuo nome e la tua immagine Twitch compaiono nelle classifiche dei giochi, visibili a chiunque apra l'app.",
        "Proposte di titolo: se vinci la parola della settimana, salviamo le proposte che invii e l'esito.",
        "Notifiche push (solo se le attivi): l'indirizzo tecnico del tuo dispositivo fornito dal browser, la lingua e le tue preferenze. Servono solo a mandarti le notifiche che hai scelto.",
        "Cookie e memoria del browser: solo tecnici (sessione di accesso, lingua scelta, schermata di benvenuto già vista). Niente cookie di analisi o di pubblicità, quindi nessun banner dei cookie.",
        "Dati tecnici: come ogni sito, i nostri fornitori di hosting registrano indirizzi IP e log tecnici per farlo funzionare e proteggerlo.",
      ],
    },
    {
      title: "Su quale base",
      list: [
        "Accesso, profilo, giochi e classifiche: per fornirti il servizio che chiedi quando ti registri e giochi (art. 6.1.b GDPR).",
        "Notifiche push: il tuo consenso, che dai attivandole e puoi ritirare quando vuoi dal Profilo o dalle impostazioni del browser (art. 6.1.a).",
        "Dati tecnici e sicurezza: il nostro legittimo interesse a far funzionare e proteggere l'app (art. 6.1.f).",
      ],
    },
    {
      title: "Per quanto tempo",
      paragraphs: [
        "Teniamo i tuoi dati finché hai un account. Se lo elimini, cancelliamo subito l'account e tutto ciò che è collegato: partite, posizioni in classifica, proposte, token Twitch e iscrizioni alle notifiche. Le iscrizioni alle notifiche spariscono anche quando le disattivi o quando il browser ci dice che non sono più valide. I log tecnici dei fornitori seguono i loro tempi di conservazione.",
      ],
    },
    {
      title: "Con chi li condividiamo",
      paragraphs: [
        "Non vendiamo né cediamo i tuoi dati. Per far funzionare l'app ci appoggiamo a questi fornitori, che li trattano per nostro conto:",
      ],
      list: [
        "Supabase: database e accesso, con i dati nell'Unione Europea (Francoforte, Germania).",
        "Vercel: hosting del sito (USA).",
        "Twitch: accesso e dati sul canale (USA).",
        "Google, Apple, Mozilla: consegnano le notifiche push al tuo browser, solo se le attivi (USA).",
      ],
    },
    {
      title: "Trasferimenti fuori dall'UE",
      paragraphs: [
        "Alcuni fornitori hanno sede negli Stati Uniti. I trasferimenti avvengono con le garanzie previste dal GDPR, come l'EU-U.S. Data Privacy Framework o le clausole contrattuali standard della Commissione Europea.",
      ],
    },
    {
      title: "I tuoi diritti",
      paragraphs: [
        `Puoi chiedere in qualsiasi momento di vedere, correggere, esportare o cancellare i tuoi dati, o opporti a un trattamento, scrivendo a ${PRIVACY_EMAIL}. Puoi eliminare il tuo account da solo, dal Profilo, con il bottone "Elimina account". Puoi anche togliere l'accesso dell'app dal tuo account Twitch (Impostazioni → Connessioni). Se pensi che i tuoi dati siano trattati male, puoi fare reclamo al Garante per la protezione dei dati personali (garanteprivacy.it).`,
      ],
    },
    {
      title: "Minori",
      paragraphs: [
        "Per accedere serve un account Twitch, che Twitch consente solo dai 13 anni in su. In Italia, sotto i 14 anni serve il consenso di un genitore per usare servizi online come questo.",
      ],
    },
    {
      title: "Regole dei giochi e premi",
      list: [
        "Zip del giorno: un tentativo al giorno, il tempo lo misura il server. I primi 3 della classifica ricevono un badge visibile nell'app per il giorno dopo.",
        "Parola della settimana: riservata agli abbonati del canale di maJoekoto. Vince chi indovina con meno tentativi; a parità, chi ci mette meno dal primo tentativo.",
        "Il vincitore della parola della settimana può proporre fino a 3 titoli per una live di Joe, entro 3 giorni. Joe è libero di accettare o rifiutare, e il titolo finale lo decide sempre lui.",
        "Anche Joe gioca alla parola della settimana. Se vince lui, quella settimana il premio non viene assegnato.",
        "I premi (badge e proposta di titolo) non hanno alcun valore economico, non sono convertibili in denaro e si ottengono solo per abilità, non per sorte.",
        "Classifiche ottenute con trucchi o abusi possono essere annullate.",
      ],
    },
  ],
};

const en: PrivacyText = {
  title: "Privacy & rules",
  updated: "Last updated: October 1, 2026",
  intro:
    "Here's what data maJoekverse collects, why, for how long and how you can ask for it to be deleted. We tried to keep it simple.",
  sections: [
    {
      title: "Who is responsible",
      paragraphs: [
        `The data controller is Niccolò Sfregola, who created and runs the maJoekverse app (maJoekoto's community). For any privacy question or request, write to ${PRIVACY_EMAIL}.`,
      ],
    },
    {
      title: "What we collect and why",
      list: [
        "Twitch account (username, display name, profile picture, Twitch ID and your Twitch account's email address): needed to sign you in. Twitch gives us the email at login: we never show it and never use it to contact you.",
        "Your relationship with Joe's channel (whether you follow, since when, whether you're subscribed): read from Twitch with a permission you grant at login, to show your stats in the Profile and unlock subscriber-only events and games. To do this we store a Twitch access token.",
        "Game sessions (day or week, times, number of tries, words guessed): used for leaderboards, badges and to make sure you play each game only once.",
        "Public leaderboards: your Twitch name and picture appear on the game leaderboards, visible to anyone who opens the app.",
        "Title suggestions: if you win the word of the week, we store the suggestions you send and their outcome.",
        "Push notifications (only if you turn them on): the technical address of your device provided by the browser, your language and your preferences. Used only to send the notifications you chose.",
        "Cookies and browser storage: technical only (sign-in session, chosen language, welcome screen already seen). No analytics or advertising cookies, so no cookie banner.",
        "Technical data: like any website, our hosting providers log IP addresses and technical data to run and protect it.",
      ],
    },
    {
      title: "Legal basis",
      list: [
        "Sign-in, profile, games and leaderboards: to provide the service you ask for when you sign up and play (Art. 6(1)(b) GDPR).",
        "Push notifications: your consent, given by turning them on, which you can withdraw at any time from your Profile or browser settings (Art. 6(1)(a)).",
        "Technical data and security: our legitimate interest in running and protecting the app (Art. 6(1)(f)).",
      ],
    },
    {
      title: "How long we keep it",
      paragraphs: [
        "We keep your data as long as you have an account. If you delete it, we immediately delete the account and everything linked to it: game sessions, leaderboard positions, suggestions, Twitch token and notification subscriptions. Notification subscriptions are also removed when you turn them off or when the browser tells us they're no longer valid. Providers' technical logs follow their own retention periods.",
      ],
    },
    {
      title: "Who we share it with",
      paragraphs: [
        "We never sell or hand over your data. To run the app we rely on these providers, who process it on our behalf:",
      ],
      list: [
        "Supabase: database and sign-in, with data stored in the European Union (Frankfurt, Germany).",
        "Vercel: website hosting (USA).",
        "Twitch: sign-in and channel data (USA).",
        "Google, Apple, Mozilla: deliver push notifications to your browser, only if you turn them on (USA).",
      ],
    },
    {
      title: "Transfers outside the EU",
      paragraphs: [
        "Some providers are based in the United States. Transfers rely on the safeguards provided by the GDPR, such as the EU-U.S. Data Privacy Framework or the European Commission's standard contractual clauses.",
      ],
    },
    {
      title: "Your rights",
      paragraphs: [
        `You can ask at any time to access, correct, export or delete your data, or object to its processing, by writing to ${PRIVACY_EMAIL}. You can delete your account yourself from the Profile with the "Delete account" button. You can also remove the app's access from your Twitch account (Settings → Connections). If you think your data is being mishandled, you can complain to the Italian Data Protection Authority (garanteprivacy.it) or your local authority.`,
      ],
    },
    {
      title: "Minors",
      paragraphs: [
        "Signing in requires a Twitch account, which Twitch only allows from age 13. In Italy, under 14s need a parent's consent to use online services like this one.",
      ],
    },
    {
      title: "Game rules and prizes",
      list: [
        "Daily Zip: one try per day, timed by the server. The top 3 on the leaderboard get a badge shown in the app for the next day.",
        "Word of the week: for subscribers of maJoekoto's channel only. Fewest tries wins; on a tie, whoever was fastest from their first try.",
        "The word of the week winner can suggest up to 3 titles for one of Joe's streams, within 3 days. Joe is free to accept or reject them, and the final title is always his call.",
        "Joe plays the word of the week too. If he wins, no prize is awarded that week.",
        "Prizes (badges and title suggestions) have no monetary value, can't be exchanged for money and are won by skill only, not by chance.",
        "Results obtained by cheating or abuse may be cancelled.",
      ],
    },
  ],
};

export const PRIVACY: Record<Lang, PrivacyText> = { it, en };
