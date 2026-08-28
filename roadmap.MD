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

## Fase 2 — Database e dati veri (Supabase)

**Obiettivo:** togliere i dati finti e leggerli da un database vero.

- [X] Creare un account e un progetto **Supabase** (gratis).
- [X] Creare le prime tabelle: `schedule`, `news`, `events`, `sponsors`.
- [X] Collegare l'app a Supabase (`@supabase/supabase-js` + `@supabase/ssr`): client server in `lib/supabase/server.ts`, client browser in `lib/supabase/client.ts`.
- [X] Far leggere alla **Home** schedule e news dal database; a **Eventi** gli eventi; a **Universo** gli sponsor. (pagine ora Server Component `async`)
- [ ] Inserire qualche riga di prova dal pannello di Supabase e verificare che compaiano.

**Cosa impari:** cos'è un database, come si leggono i dati da un'app, un po' di SQL di base.

**Fatto quando:** aggiungi una news dal pannello Supabase e — senza toccare il codice — compare nella Home.

---

## Fase 3 — Login con Twitch e profilo

**Obiettivo:** permettere l'accesso con Twitch, tenendo l'app usabile anche senza login.

- [ ] Registrare un'applicazione sulla **Twitch Developer Console** (client ID/secret + redirect URL).
- [ ] Attivare **Twitch come provider** in Supabase (è supportato di serie).
- [ ] Aggiungere il pulsante "Accedi con Twitch" e la schermata **Profilo** (username, avatar) quando sei loggato.
- [ ] Verificare che le sezioni pubbliche (Home, Universo, lettura eventi) restino usabili **senza** login.
- [ ] Logout funzionante.

**Cosa impari:** come funziona l'autenticazione, la differenza tra utente pubblico e loggato.

**Fatto quando:** accedi con Twitch, vedi il tuo profilo, esci — e chi non fa login usa comunque l'app.

---

## Fase 4 — Stato "live" automatico

**Obiettivo:** la Home mostra da sola se maJoekoto è online, senza inserirlo a mano.

- [ ] Creare una piccola funzione lato server che chiede a Twitch "maJoekoto è live?" (endpoint *Get Streams*).
- [ ] La Home mostra il blocco rosso "sono online" quando è live, e "prossima live" quando è offline.
- [ ] Aggiornamento a intervalli (polling): semplice e sufficiente per ora — niente webhook complicati nella v1.

**Cosa impari:** come l'app parla con un servizio esterno (l'API di Twitch) tramite il tuo server.

**Fatto quando:** quando Joe è davvero in diretta, la Home passa da sola allo stato "live".

---

## Fase 5 — Mini area amministrativa

**Obiettivo:** dare a Joe (e a te) un posto per inserire schedule e news dal telefono.

- [ ] Aggiungere un **ruolo** admin agli utenti autorizzati (nel database).
- [ ] Creare una sezione **Admin** con form semplici: aggiungi/modifica schedule, aggiungi/modifica news, gestisci sponsor.
- [ ] La sezione Admin è visibile **solo** ai ruoli autorizzati, e il controllo del ruolo avviene **lato server** (non solo nascondendo il bottone).

**Cosa impari:** permessi e ruoli, come si scrivono dati nel database da un form.

**Fatto quando:** Joe accede, apre Admin, aggiunge una news → compare nella Home per tutti.

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

- [ ] Collegare il repository a **Vercel** → deploy automatico a ogni push.
- [ ] (Opzionale) dominio personalizzato.
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

Fase 1 completa: tema, guscio responsive, tutte le schermate con contenuto vero (dati finti o reali dove disponibili). Prossimo: **Fase 2**, primo task: creare un account e un progetto **Supabase**, poi le prime tabelle (`schedule`, `news`, `events`, `sponsors`).