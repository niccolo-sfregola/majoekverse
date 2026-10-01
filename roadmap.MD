# Piano di sviluppo — maJoekoto App (versione 1)

*App web / PWA · Next.js + Supabase + Twitch · tema scuro · un solo sviluppatore che impara*

---

## Come usare questo piano

Una **fase alla volta**, in ordine. Non saltare avanti. Ogni fase è pensata per **finire con qualcosa che funziona e si vede** — così non lavori mai per giorni senza risultati, e impari un pezzo per volta.

Per ogni fase trovi: i **task** (da spuntare), **cosa impari**, e **fatto quando** (il traguardo che ti dice che puoi passare alla fase dopo).

Il codice vero lo scriviamo insieme quando arrivi a ciascun task — questo è il "cosa fare", non il "come" riga per riga.

**Regola d'oro:** se una fase ti sembra grande, è perché la stai guardando tutta insieme. Guarda solo il prossimo task.

---

## ✅ Fase 0 — Ambiente (FATTA)

- [x] WSL + Node installati
- [x] Progetto Next.js creato
- [x] `npm run dev` → pagina su localhost:3000
- [x] Prima modifica a `page.tsx` visibile a schermo

Hai già superato la parte più ostica. Da qui è costruire.

---

## ✅ Fase 1 — Aspetto e schermate (con dati finti) (FATTA)

**Obiettivo:** costruire tutta l'interfaccia con dati inventati scritti a mano, *senza ancora database né login*. È il modo giusto di iniziare: vedi subito i risultati e impari React/Next/Tailwind sul concreto.

- [X] Definire il **tema** in un punto solo: i colori del logo (fondo `#15133A`, blu `#2E2AB5`, lavanda `#B9A8E6`, corallo `#EF6C4E`, crema `#F6ECD8`) e i font. Così cambiarli dopo è istantaneo.
- [X] Creare il **guscio dell'app**: bottom bar su mobile / nav in alto su desktop (mai insieme), responsive con i breakpoint Tailwind, + icona "Universo" fissa che apre `/universo`.
- [X] Costruire la **Home** con dati finti: blocco "sono live / prossima live" (con link a Twitch), anteprima schedule, card evento in evidenza, lista news.
- [X] Costruire **Universo di Joe**: bio, link ai canali (Twitch, Instagram, YouTube), sezione sponsor con codici sconto, altri link (Patreon, Posta del cuore) — dati reali, non finti.
- [X] Costruire le altre schermate con contenuto vero: **Eventi** (lista eventi), **Help Desk** (testo + link Discord), **Profilo** (due stati: loggato/non loggato con ternario, sottoscrizione, personalizzazione avatar interattiva con `useState`, skeleton area admin).
- [X] Rendere tutto **responsive**: layout a griglia/flex elastici, breakpoint `md:` dove serve.
- [X] *(opzionale, rifinitura finale)* Piccola animazione di benvenuto all'avvio: il "mondo" dell'icona Universo gira, poi appare "Benvenuto nel maJoekverse!". Idea carina avuta strada facendo — non blocca il passaggio alla Fase 2, va aggiunta quando c'è voglia.

**Cosa impari:** componenti React, come si dividono le schermate in pezzi, Tailwind per lo stile, il layout responsive, `.map()` su liste, ternari per contenuto condizionale, il primo `useState`.

**Fatto quando:** navighi tra i 4 tab e apri l'Universo, ha i tuoi colori, e funziona bene sia in finestra stretta (telefono) sia larga (PC) — tutto con dati finti. ✅

---

## ✅ Fase 2 — Database e dati veri (Supabase) (FATTA)

**Obiettivo:** togliere i dati finti e leggerli da un database vero.

- [X] Creare un account e un progetto **Supabase** (gratis).
- [X] Creare le prime tabelle: `schedule`, `news`, `events`, `sponsors`.
- [X] Collegare l'app a Supabase (`@supabase/supabase-js` + `@supabase/ssr`): client server in `lib/supabase/server.ts`, client browser in `lib/supabase/client.ts`.
- [X] Far leggere alla **Home** schedule e news dal database; a **Eventi** gli eventi; a **Universo** gli sponsor. (pagine ora Server Component `async`)
- [X] Policy RLS di lettura pubblica (`SELECT`) create su tutte e 4 le tabelle — senza, l'API restituiva sempre array vuoti anche con dati dentro.
- [X] Inserito righe di prova dal pannello di Supabase e verificato che compaiano.

**Cosa impari:** cos'è un database, come si leggono i dati da un'app, un po' di SQL di base, client vs server in Next.js, RLS e policy.

**Fatto quando:** aggiungi una news dal pannello Supabase e — senza toccare il codice — compare nella Home. ✅

**Dati finti della Home — stato:** `live.isLive` → collegato (Fase 4, Twitch). `eventoInEvidenza` → sostituito con **ultimo video YouTube** (feed RSS del canale, `lib/youtube.ts`, nessuna API key). Niente più segnaposto sulla Home.

---

## ✅ Fase 3 — Login con Twitch e profilo (FATTA)

**Obiettivo:** permettere l'accesso con Twitch, tenendo l'app usabile anche senza login.

- [X] Registrare un'applicazione sulla **Twitch Developer Console** (client "riservate", redirect URL = `https://<ref>.supabase.co/auth/v1/callback`).
- [X] Attivare **Twitch come provider** in Supabase + URL Configuration (Site URL `http://localhost:3000`, Redirect URLs `http://localhost:3000/**`).
- [X] Codice login: `proxy.ts` (refresh sessione), `app/auth/callback/route.ts`, `app/auth/actions.ts` (signInWithTwitch / signOut).
- [X] Schermata **Profilo** reale: username + avatar da Twitch quando loggato, bottone "Accedi con Twitch" quando no. Emoji picker spostato in `avatarPicker.tsx` (client).
- [X] Provato il giro completo in `npm run dev`: accedi → vedi profilo → esci.
- [X] Verificato che Home, Universo ed Eventi restino usabili **senza** login.

**Cosa impari:** come funziona l'autenticazione, la differenza tra utente pubblico e loggato.

**Fatto quando:** accedi con Twitch, vedi il tuo profilo, esci — e chi non fa login usa comunque l'app. ✅

---

## ✅ Fase 4 — Stato "live" automatico (FATTA)

**Obiettivo:** la Home mostra da sola se maJoekoto è online, senza inserirlo a mano.

- [X] `lib/twitch.ts`: token applicativo (client credentials, in cache) + endpoint *Get Streams* per `majoekoto`.
- [X] `app/api/live/route.ts`: endpoint JSON con lo stato live.
- [X] La Home mostra il blocco corallo "🔴 In diretta ora" quando è live, "Al momento offline" quando no (`app/liveBlock.tsx`).
- [X] Polling: stato iniziale dal server, poi `liveBlock` ricontrolla `/api/live` ogni 60s; la fetch a Twitch è in cache 60s.
- [X] Verifica finale: quando Joe è davvero in diretta, la Home passa da sola a "live" (o testare forzando).

**Cosa impari:** come l'app parla con un servizio esterno (l'API di Twitch) tramite il tuo server.

**Fatto quando:** quando Joe è davvero in diretta, la Home passa da sola allo stato "live".

---

## ✅ Fase 5 — Mini area amministrativa (FATTA)

**Obiettivo:** dare a Joe (e a te) un posto per inserire schedule e news dal telefono.

- [X] Ruolo admin nel database: tabella `admins` + funzione `is_admin()` + policy di scrittura (INSERT/UPDATE/DELETE solo admin) su schedule/news/events/sponsors — `supabase/admin-setup.sql`.
- [X] Pagina `/admin` con form (Server Action) per aggiungere ed eliminare news, eventi, righe schedule, sponsor — `app/admin/page.tsx`, `app/admin/actions.ts`.
- [X] Controllo ruolo **lato server**: `lib/auth.ts` (`isAdmin()` via RPC), `/admin` rimbalza i non-admin, ogni action richiama `assertAdmin()`, e comunque la RLS lo impone nel database.
- [X] Link "Area Admin" nel Profilo, visibile solo agli admin.
- [X] Modifica in-place (form pre-compilato in un `<details>`) oltre ad aggiungi/elimina, per tutte e 4 le sezioni.
- [X] Prova: login admin → `/admin` → aggiungi una news → compare nella Home. Login non-admin → `/admin` rimbalza.

**Cosa impari:** permessi e ruoli, come si scrivono dati nel database da un form.

**Fatto quando:** Joe accede, apre Admin, aggiunge una news → compare nella Home per tutti.

**Idee raccolte da fare dopo (non bloccano la fase):**
- [X] **Bottone "pubblica su Discord"** in `/admin` via webhook (`DISCORD_WEBHOOK_URL`): anteprima + "Pubblica schedule su Discord", e "Annuncia" per ogni news. `lib/discord.ts`, `lib/announce.ts`, `app/admin/announceButton.tsx`.
- [X] Messaggio schedule bilingue IT/EN nel formato ufficiale di Joe; `schedule.giorno` → `schedule.data` (data vera), nome giorno e `dd/mm` calcolati da `lib/schedule.ts`. Migrazione: `supabase/schedule-data-column.sql`.
- [X] Formato news su Discord: `📢 ANNUNCIO: **titolo**` + testo. Formato eventi: `📢 NUOVO EVENTO: **titolo**` + data + descrizione, con bottone "Annuncia" per ogni evento.
- [X] **Flusso modifica schedule**: due pulsanti nella sezione Schedule — "📢 Pubblica schedule completa" (settimana nuova, salva lo snapshot) e "📢 Annuncia modifiche" (diff vs snapshot → messaggio solo modifiche + news "Modifica alla schedule" creata in automatico). Snapshot in `schedule_announcement` (`supabase/schedule-announcement.sql`), diff in `lib/schedule-diff.ts`. Anteprima mostrata prima dell'invio = conferma.
- [X] **Ciclo settimanale schedule**: pulsante "🗑️ Azzera schedule" (con conferma) → cancella tutte le righe e resetta lo snapshot. Con schedule vuota la Home mostra "Stiamo per caricare la schedule…".
- [X] **Messaggio modifiche bilingue** IT/EN (come la schedule completa). La news in-app resta solo IT.
- [X] **Rifiniture admin**: `saveRow`/`deleteRow` ora restituiscono un esito → feedback "✅/❌" sotto ai bottoni (`rowForm.tsx`, `deleteButton.tsx`); conferma `window.confirm` prima di eliminare e prima di azzerare; il form "Aggiungi" si svuota dopo un inserimento riuscito.

---

## ✅ Fase 6 — UI, rifinitura estetica + PWA installabile (FATTA)

**Obiettivo:** portare l'app da "funziona e si vede" a bella davvero, e farla diventare un'app installabile su telefono e PC.

- [X] **Passata di rifinitura UI vera e propria**: margini, spaziature, animazioni, dettagli estetici, l'animazione di benvenuto rimandata dalla Fase 1. A differenza delle fasi precedenti (dove hai scritto tu quasi tutto il codice per capire i meccanismi), qui il supporto sarà più massiccio — a quel punto conoscerai già l'architettura, quindi appoggiarti di più sul lato estetico non toglie nulla a quanto imparato finora.
- [X] Aggiungere il **manifest** (nome, icona = logo J, colore tema scuro) così compare "Installa / Aggiungi a Home".
- [X] Aggiungere il **service worker** (con Serwist) per l'installabilità e un minimo di funzionamento offline.
- [ ] ~~(Opzionale) notifiche push "sono live"~~ → spostate nella **Fase 9** (sistema di notifiche completo).

**Cosa impari:** rifinitura di design con Tailwind, cosa rende un sito una PWA, service worker e manifest.

**Fatto quando:** l'app è visivamente rifinita, e la installi sulla home del tuo telefono **e** su PC, con l'icona della J.

---

## ✅ Fase 7 — Pubblicazione (FATTA)

**Obiettivo:** metterla online per la community.

- [X] Collegare il repository a **Vercel** → deploy automatico a ogni push. Online su `majoekverse.vercel.app`. Env su Vercel (incl. `NEXT_PUBLIC_SITE_URL`), Supabase URL Configuration aggiornata per il dominio di produzione.
- [X] (Opzionale) dominio personalizzato — l'utente lo vuole, serve scegliere il nome + comprarlo.
- [X] Provare l'app su **telefoni veri** (Android e iPhone) e sistemare le ultime cose.

**Fatto quando:** c'è un link pubblico, installabile, con dati veri, che Joe può condividere.

---

## ✅ Fase 8 — Giochi (FATTA)

**Obiettivo:** il tab Eventi diventa **Giochi**: uno Zip giornaliero (stile LinkedIn) con classifica a tempo e badge ai primi 3, e un Wordle settimanale per abbonati il cui vincitore propone il titolo di una live. Joe gioca come tutti, contro la sua community.

**Decisioni prese:**
- Gli eventi escono dal menu e finiscono in una card nella **Home**: tap → si apre come una news (stesso modale di `newsList.tsx`) + bottone "Partecipa" (o "Abbonati" se è solo abbonati). La pagina `/eventi` sparisce.
- Si gioca **solo con login Twitch**. Il Wordle settimanale è **solo per abbonati** (+ Joe, che non è abbonato al proprio canale). Admin e Joe sono in classifica come tutti.
- **Zip:** stesso puzzle per tutti, cambia a mezzanotte (ora italiana), un tentativo al giorno. Il tempo lo misura il **server** (il puzzle arriva solo quando premi "Inizia"). Badge ai primi 3, **valido solo il giorno dopo**, niente palmarès.
- **Wordle:** **solo in italiano** (parola e parole ammesse sono italiane, anche per chi usa l'app in inglese — lo dice la descrizione del gioco). Parola **pescata a caso dal server** da una lista nel codice. Nessuno la sceglie, quindi nessuno la conosce (Joe compreso). La scelta usa un segreto (`GAMES_SECRET`, lo stesso del puzzle Zip), così non si può ricavare leggendo il codice. Classifica per **numero di tentativi**, a parità vince chi ci ha messo meno. Il vincitore si decide a fine settimana.
- **Titolo della live:** il vincitore scrive una **proposta** → `/admin` Accetta / Rifiuta (motivo facoltativo) → se rifiutata può riproporre, **max 3 proposte**. Scade dopo 3 giorni se non la scrive. Nessun automatismo con Twitch: il titolo vero lo mette Joe. **Se vince Joe, quella settimana il premio non si assegna** (Joe resta in classifica).

**Task:**
- [X] Menu: "Eventi" → "Giochi" (top + bottom nav, icona nuova, dizionari IT/EN). Eventi nella Home come card espandibile. Pagina `/giochi` con due card.
- [X] Zip giocabile: generatore di griglia (percorso che copre tutte le celle + numeri + muri), tracciamento del percorso col dito/mouse, verifica.
- [X] Zip "vero": tabella partite, inizio/fine salvati dal server, un tentativo al giorno, classifica del giorno, badge dei primi 3 di ieri (in profilo e in classifica).
- [X] Wordle: lista parole italiane (soluzioni comuni + lista più ampia di parole ammesse), parola della settimana sul server, tentativi verificati da Server Action, controllo abbonamento.
- [X] Wordle: classifica settimanale + vincitore.
- [X] Proposte titolo: form per il vincitore, sezione in `/admin` con Accetta/Rifiuta, contatore 3 proposte, scadenza.

**Cosa impari:** logica di gioco in React (stato, eventi touch/mouse), perché non ci si fida del client (tempo e soluzioni sul server), date e fusi orari, generazione casuale con un seme, classifiche in SQL.

**Fatto quando:** chi fa login gioca lo Zip del giorno e vede la classifica, il giorno dopo i primi 3 hanno il badge; un abbonato vince il Wordle, propone un titolo e Joe lo accetta da `/admin`.

---

## Fase 9 — Notifiche push

**Obiettivo:** avvisare quando i giochi sono online, ricordare a chi non ha ancora giocato, e far girare il flusso del titolo (Joe ↔ vincitore) con notifiche.

**Come funziona:** l'utente attiva le notifiche dal Profilo (il browser chiede il permesso solo dopo un tocco) → l'iscrizione si salva su Supabase → il server invia con `web-push` + chiavi VAPID → `public/sw.js` mostra la notifica e al tocco apre la pagina giusta. Notifiche a orario: **pg_cron su Supabase** chiama `/api/cron/...` protetta da `CRON_SECRET` (il cron gratuito di Vercel è troppo impreciso). Notifiche del titolo: partono subito dalla Server Action, senza cron.

**Calendario (confermato):**

| Notifica | Quando | A chi |
|---|---|---|
| Zip di oggi online | ogni giorno 9:00 | iscritti |
| Sollecito Zip | ogni giorno 20:00 | chi oggi non ha giocato |
| Wordle della settimana online | lunedì 9:00 | abbonati iscritti |
| 1° sollecito Wordle | giovedì 20:00 | abbonati che non l'hanno finito |
| 2° sollecito Wordle | domenica 18:00 | come sopra |
| Posto in classifica Zip ("🥈 sei arrivato 2° ieri") | ogni giorno 9:00, insieme a "Zip online" | i primi 3 di ieri |
| Nuova proposta di titolo | subito | tutti gli admin |
| Esito della proposta | subito | il vincitore |

**Decisioni:** iPhone → solo con l'app installata sulla Home (iOS 16.4+), niente Telegram. Notifica del posto in classifica ai primi 3 dello Zip: sì.

Notifiche della proposta di titolo: a **tutti gli admin** (non solo Joe).

**Task:**
- [X] Chiavi VAPID + tabella `push_subscriptions` (utente, endpoint, chiavi) + preferenze (Zip / Wordle e solleciti).
- [X] Bottone "Attiva notifiche" + interruttori nel Profilo; gestione `push` e `notificationclick` in `sw.js`.
- [X] `lib/push.ts`: invio a un utente / a un gruppo, pulizia delle iscrizioni scadute.
- [X] Notifiche del titolo (proposta → admin, esito → vincitore) + posto in classifica Zip ai primi 3.
- [ ] Route cron protette + pg_cron per annunci e solleciti di Zip e Wordle.

**Cosa impari:** Web Push e service worker, permessi del browser, job programmati, perché le route cron vanno protette.

**Fatto quando:** attivi le notifiche sul telefono, ti arriva "lo Zip è online", la sera ti arriva il sollecito solo se non hai giocato, e Joe riceve la proposta di titolo appena il vincitore la scrive.

---

## Fase 10 — Privacy (GDPR)

**Obiettivo:** informare gli utenti su quali dati raccoglie l'app e permettere di cancellarli, prima di annunciare i giochi alla community.

**Decisioni:** titolare Niccolò Sfregola, contatto niccolo.sfregola03@gmail.com. Supabase in UE (eu-central-1, Francoforte). Solo cookie tecnici → niente banner. Testo in `lib/privacy.ts` (da aggiornare se cambiano i dati raccolti o i fornitori).

- [X] Pagina `/privacy` bilingue (informativa art. 13 + regole dei giochi e premi senza valore economico).
- [X] Link alla privacy sotto ogni "Accedi con Twitch" (Profilo, giochi, onboarding) e in fondo al Profilo.
- [X] Bottone "Elimina account" accanto a "Esci": cancella l'utente da Supabase Auth, il resto sparisce con `on delete cascade`.
- [ ] Provare l'eliminazione con un account di prova e pubblicare insieme alla Fase 9.

---

## Cosa NON è nella v1 (di proposito)

Per non affogare, questi restano per dopo — e va bene così:

- **Ticket / Help Desk completo** → nella v1 basta un pulsante che rimanda al Discord/Telegram esistente. Il sistema ticket vero solo se il volume lo giustifica.
- **Giveaway a estrazione** → per ora solo informativi/link (per i motivi legali già visti: le estrazioni con premi hanno vincoli seri in Italia).
- **Sondaggi** → dopo.
- **EventSub** → stato live con polling. (Le notifiche push sono nella Fase 9.)
- **News automatiche da Instagram/TikTok** → restano manuali dall'Admin; solo YouTube è automatizzabile facilmente (dopo).

Aggiungere tutto subito è la strada più veloce per mollare. La v1 così è **coerente, utile e finibile**.

---

## Il tuo prossimo passo, adesso

Fasi 1–8 complete: app online su Vercel (`majoekverse.vercel.app`), installabile come PWA, con dati veri da Supabase, login Twitch, stato live automatico, ultimo video YouTube, area Admin completa (CRUD + annunci Discord + diff schedule + azzeramento settimanale).

Fase 8 fatta: tab Giochi con Zip del giorno (classifica + badge podio) e parola della settimana per abbonati (classifica + proposta di titolo del vincitore, Accetta/Rifiuta in `/admin`). Eventi spostati in Home.

Fase 9 quasi fatta: notifiche push (iscrizione per dispositivo nel Profilo, notifiche del titolo, notifiche a orario via pg_cron → `/api/cron`). Provate in locale.

Prossimo: **mettere online la Fase 9** e chiuderla:
1. Su Vercel → Environment Variables: `GAMES_SECRET`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `CRON_SECRET` (stessi valori di `.env.local`).
2. `git push` → aspettare il deploy.
3. Supabase: `cron_secret` nel Vault = `CRON_SECRET` vero; `cron.job` con l'indirizzo vero del sito.
4. Chiamata di prova con `net.http_post` → `net._http_response` deve dare 200.
5. Dopo un'ora piena: `cron.job_run_details` → `succeeded`. Poi spuntare l'ultimo task della Fase 9.
