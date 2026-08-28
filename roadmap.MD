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
- [ ] *(opzionale, rifinitura finale)* Piccola animazione di benvenuto all'avvio: il "mondo" dell'icona Universo gira, poi appare "Benvenuto nel maJoekverse!". Idea carina avuta strada facendo — non blocca il passaggio alla Fase 2, va aggiunta quando c'è voglia.

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

## Fase 4 — Stato "live" automatico

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
- [ ] Prova: login admin → `/admin` → aggiungi una news → compare nella Home. Login non-admin → `/admin` rimbalza.

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

## Fase 6 — UI, rifinitura estetica + PWA installabile

**Obiettivo:** portare l'app da "funziona e si vede" a bella davvero, e farla diventare un'app installabile su telefono e PC.

- [ ] **Passata di rifinitura UI vera e propria**: margini, spaziature, animazioni, dettagli estetici, l'animazione di benvenuto rimandata dalla Fase 1. A differenza delle fasi precedenti (dove hai scritto tu quasi tutto il codice per capire i meccanismi), qui il supporto sarà più massiccio — a quel punto conoscerai già l'architettura, quindi appoggiarti di più sul lato estetico non toglie nulla a quanto imparato finora.
- [ ] Aggiungere il **manifest** (nome, icona = logo J, colore tema scuro) così compare "Installa / Aggiungi a Home".
- [ ] Aggiungere il **service worker** (con Serwist) per l'installabilità e un minimo di funzionamento offline.
- [ ] (Opzionale) notifiche push "sono live" su Android e PC. Su iPhone le copriamo con il **bot Telegram** già esistente, come deciso.

**Cosa impari:** rifinitura di design con Tailwind, cosa rende un sito una PWA, service worker e manifest.

**Fatto quando:** l'app è visivamente rifinita, e la installi sulla home del tuo telefono **e** su PC, con l'icona della J.

---

## Fase 7 — Pubblicazione

**Obiettivo:** metterla online per la community.

- [X] Collegare il repository a **Vercel** → deploy automatico a ogni push. Online su `majoekverse.vercel.app`. Env su Vercel (incl. `NEXT_PUBLIC_SITE_URL`), Supabase URL Configuration aggiornata per il dominio di produzione.
- [ ] (Opzionale) dominio personalizzato — l'utente lo vuole, serve scegliere il nome + comprarlo.
- [ ] Provare l'app su **telefoni veri** (Android e iPhone) e sistemare le ultime cose.

**Fatto quando:** c'è un link pubblico, installabile, con dati veri, che Joe può condividere.

---

## Cosa NON è nella v1 (di proposito)

Per non affogare, questi restano per dopo — e va bene così:

- **Ticket / Help Desk completo** → nella v1 basta un pulsante che rimanda al Discord/Telegram esistente. Il sistema ticket vero solo se il volume lo giustifica.
- **Giveaway a estrazione** → per ora solo informativi/link (per i motivi legali già visti: le estrazioni con premi hanno vincoli seri in Italia).
- **Sondaggi** → dopo.
- **Notifiche push complesse / EventSub** → nella v1 polling + Telegram.
- **News automatiche da Instagram/TikTok** → restano manuali dall'Admin; solo YouTube è automatizzabile facilmente (dopo).

Aggiungere tutto subito è la strada più veloce per mollare. La v1 così è **coerente, utile e finibile**.

---

## Il tuo prossimo passo, adesso

Fasi 1–5 complete + app online su Vercel (`majoekverse.vercel.app`). Funzionano: dati veri da Supabase, login Twitch, stato live automatico, ultimo video YouTube, area Admin completa (CRUD + annunci Discord + diff schedule + azzeramento settimanale).

Prossimo: **Fase 6** — (1) passata di rifinitura estetica UI, (2) PWA installabile (manifest + service worker con Serwist), (3) opzionale notifiche push. Poi resta di Fase 7: dominio personalizzato + test su telefoni veri.