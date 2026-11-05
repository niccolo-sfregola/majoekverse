# Design di maJoekverse

Regole visive dell'app. Valgono per ogni modifica alla UI. I prototipi di riferimento stanno in `design/`: `AppTelefono.dc.html`, `AppDesktop.dc.html` e `Pianeta.dc.html`. Sono solo riferimenti, non vanno importati nell'app: da lì si copiano valori, CSS e shader. Se questo file e un prototipo non coincidono, vale questo file.

## Idea

L'app sembra il menu di un videogioco ambientato nell'universo di Joe. La struttura resta pulita e leggibile, l'energia arriva da pianeta, neon, stelle e transizioni. Il protagonista è il pianeta 3D con il logo al neon: niente deve competere con lui.

## Colori

Aggiorna i token in `app/globals.css` e usa sempre i token, mai esadecimali sparsi nei componenti.

| Token | Valore | Uso |
| --- | --- | --- |
| `--fondo` | `#0A0826` | Sfondo di tutta l'app |
| `--superficie` | `#15123F` | Pannelli, righe, nav |
| `--superficie-hover` | `#231E63` | Hover di righe e liste |
| `--blu` | `#2D29A4` | Elemento evidenziato, riga attiva |
| `--lavanda` | `#B9A8E6` | Azione principale, bordi, titoli di sezione |
| `--lavanda-chiara` | `#D9CFF5` | Testo secondario |
| `--crema` | `#F6ECD8` | Testo principale |
| `--neon-testo` | `#FFF4EA` | Testo neon |
| `--neon-alone` | `#FF4F6A` | Bagliore neon |
| `--corallo` | `#FF7A5C` | Solo accenti: contenuti riservati, indicatori, strisce di transizione |

Il testo deve avere contrasto di almeno 4.5:1.

## Tipografia

- **Blowbrush:** logo e titoli di pagina, mai testo lungo.
- **Oxanium:** tutto il resto, caricato con `next/font/google` in `app/fonts.ts` al posto di Inter.
- I titoli di sezione usano Oxanium 700, 22 px su telefono e 24 px su desktop, in lavanda. Niente etichette in maiuscoletto spaziato.
- Conti alla rovescia e numeri che cambiano usano `font-variant-numeric: tabular-nums`.

## Forme e componenti

- **Angoli tagliati:** in alto a sinistra e in basso a destra, con `clip-path`. Misura 16 px sui pannelli, 12 px sui bottoni, 10 px su social e nav attiva.
- **Bordo dei pannelli:** contenitore lavanda con padding 1 px e pannello interno `--superficie`, entrambi con lo stesso `clip-path`.
- **Bottone principale:** un solo componente `Button`, sfondo lavanda, testo `--fondo`, peso 700, altezza 52 px. Ha un lampo bianco che attraversa il bottone ogni 3.6 s e si riduce a `scale(.96)` alla pressione.
- **Righe della schedule:** griglia giorno, titolo, orario. La prossima diretta è blu con bordo crema a sinistra. Hover: spostamento di 6 px a destra su `--superficie-hover`.
- **Bersagli touch:** almeno 44 px di altezza.

Da non usare: `.card-glass` e `backdrop-filter` sui pannelli, bottoni corallo con testo crema, griglie di card tutte uguali, emoji nelle interfacce, stringhe `→` nei testi dei bottoni.

## Pianeta

- Canvas WebGL senza librerie, con il codice in `design/Pianeta.dc.html`.
- Superficie procedurale con venature coralle. Il logo maJoekverse è disegnato su un canvas 2D con Blowbrush e applicato come insegna neon lungo l'equatore.
- L'alone resta stretto e si azzera prima del bordo del canvas, così il riquadro non si vede mai.
- Velocità di rotazione 0.22 rad/s. Su desktop si trascina con il mouse. Un clic senza spostamento apre l'Universo.
- Vive in `app/layout.tsx` come componente client, non in una pagina e non in `app/template.tsx`, altrimenti si ricrea a ogni navigazione e non può spostarsi tra le schermate.
- Stati: grande nella Home, piccolo in alto a destra nelle altre pagine, nascosto dopo il tuffo. Il passaggio dura 0.9 s su telefono e 1 s su desktop, con `cubic-bezier(.7, 0, .2, 1)`.

Requisiti di prestazione:

- Densità di pixel massima 1.5, da abbassare su dispositivi deboli.
- Rendering in pausa quando la scheda è nascosta o il pianeta è fuori schermo.
- Se WebGL non è disponibile, o il pianeta è troppo lento, mostra un'immagine statica.
- Va provato su un telefono economico reale prima del rilascio.

## Stelle

- Cielo fisso dietro tutta l'app, generato con un seme fisso (`mulberry32`, come in `app/universo/cosmicBackground.tsx`). Non usare `Math.random()` nel rendering, per evitare differenze tra server e client.
- 260 stelle su telefono, 420 su desktop, con grandezze diverse e qualche tinta lavanda o pesca.
- In Home il cielo è zoomato a `scale(1.22)`. Andando in un'altra pagina torna a 1 insieme al pianeta che rimpicciolisce, con la stessa durata e la stessa curva. Tornando alla Home si riavvicina.
- Circa il 30% brilla con un ciclo di 3.6 s. Tutto il cielo deriva lentamente in 90 s.

## Movimento

Il movimento risponde sempre a un'azione o a uno stato dell'app. Durate di riferimento:

| Momento | Animazione | Durata |
| --- | --- | --- |
| Primo avvio | Logo neon e barra di caricamento, poi dissolvenza | 2.5 s |
| Cambio pagina | Cinque strisce diagonali che coprono e scoprono lo schermo | 1.1 s |
| Titolo di pagina | Lettere che entrano una alla volta, ritardo 55 ms | 0.55 s per lettera |
| Sottotitolo Home | Scrittura a macchina con cursore | 1.3 s |
| Contenuti | Entrata a cascata con rivelazione da sinistra, ritardo 0.1 s | 0.55 s |
| Titoli neon | Sfarfallio iniziale | 2.4 s |
| Nav | Indicatore unico che scorre tra le voci, con rimbalzo | 0.45 s |
| Tuffo nell'Universo | Vedi sotto | 1.7 s |

Regole:

- La schermata di avvio compare solo alla prima apertura della sessione, non a ogni navigazione.
- Con le strisce, la pagina cambia a 430 ms, quando lo schermo è coperto. La navigazione non deve mai aspettare i dati oltre la fine della transizione: i contenuti lenti usano gli scheletri di `Suspense`.
- La nav usa un solo indicatore, non un elemento per voce in dissolvenza.
- Le animazioni di gioco già presenti (`zip-*`, `tile-*`, `row-shake`) restano, adattate ai nuovi colori.

### Tuffo nell'Universo

Parte cliccando il pianeta o "Esplora l'universo di Joe!".

1. Il pianeta si centra e si ingrandisce fino a `scale(7)` in 1.15 s, con `cubic-bezier(.7, 0, .9, .3)`.
2. Da 0.25 s, 28 raggi di stelle partono dal centro verso i bordi.
3. Da 0.6 s sale un lampo lavanda che copre lo schermo.
4. A circa 1 s, durante il lampo, si apre `/universo`.
5. Il lampo si dissolve, il cielo si assesta da `scale(2.6)` a 1 e i contenuti arrivano dal centro.

Il tasto "Torna alla Home" fa il percorso inverso del pianeta, senza strisce.

### Movimento ridotto

Con `prefers-reduced-motion: reduce` si fermano rotazione, stelle, cascate, lettere e sfarfallii. La schermata di avvio sparisce. Strisce e lampo durano quasi zero. Ogni contenuto deve restare visibile e funzionante.

## Pagine

- **Home:** pianeta, logo neon e sottotitolo in alto, poi conto alla rovescia, azione principale, schedule, ultimo video e news. Su desktop il testo sta a sinistra e il pianeta a destra, con schedule, video e news in tre colonne sotto.
- **Conto alla rovescia:** legge la prossima diretta vera dalla schedule. Se Joe è in diretta, lo sostituisce con lo stato "In diretta ora" e il tasto per guardarlo su Twitch.
- **Giochi:** un pannello per gioco con bordo tagliato. Il bordo corallo indica i contenuti per abbonati.
- **Universo:** bio, social, sponsor e progetti, sullo stesso cielo stellato, senza pianeta visibile.
- **Profilo e Help Desk:** titolo animato, testo e un'azione principale.
- **Admin:** token e componenti nuovi, con titolo animato e sezioni a cascata come le altre pagine. La priorità resta usare i form.

## Come lavorare

- Una tappa alla volta, su un branch separato: token e `Button`, pianeta, nav e transizioni, tuffo, poi una pagina per volta.
- Prima di usare transizioni o API di Next, leggi la documentazione della versione installata, come chiede `AGENTS.md`.
- Controlla ogni tappa a schermo su telefono e desktop prima di passare alla successiva.