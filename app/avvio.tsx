import { getDict } from "@/lib/i18n/server";
import { blowbrush } from "./fonts";

// Chiave in sessionStorage: c'è se in questa sessione l'avvio si è già visto.
export const AVVIO_KEY = "mjv-avvio";

// Va nel <head> del layout e gira prima che la pagina venga disegnata.
// Se l'avvio è già stato visto in questa sessione mette data-avviato su
// <html> e il CSS nasconde la schermata subito, senza nemmeno un lampo.
// Altrimenti si segna che da ora in poi è stato visto.
export const AVVIO_SCRIPT = `(function(){try{if(sessionStorage.getItem("${AVVIO_KEY}"))document.documentElement.setAttribute("data-avviato","");else sessionStorage.setItem("${AVVIO_KEY}","1")}catch(e){}})()`;

// Schermata di avvio (vedi DESIGN.md): logo neon e barra di caricamento,
// poi dissolvenza a 2.5s. Solo CSS: alla fine resta nella pagina ma
// invisibile (visibility: hidden), e siccome sta nel layout non si ripete
// cambiando pagina.
export default async function Avvio() {
  const t = await getDict();
  return (
    <div aria-hidden className="avvio">
      <p className={`${blowbrush.className} neon text-[42px] leading-none md:text-6xl`}>
        maJoekverse
      </p>
      <div className="h-1.5 w-[220px] bg-brand-blu">
        <div className="avvio-barra" />
      </div>
      <p className="text-sm text-brand-lavanda-chiara">{t.avvio.loading}</p>
    </div>
  );
}
