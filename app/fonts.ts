import { Oxanium } from "next/font/google";
import localFont from "next/font/local";

// Font di tutta l'interfaccia: squadrato e "da videogioco", ma leggibile anche
// a corpo piccolo. Variabile, quindi un solo file copre tutti i pesi.
export const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
});

// Font del logo maJoekverse. Solo per titoli/heading, mai per il testo lungo:
// è un font "brush" pensato per poche parole in grande.
export const blowbrush = localFont({
  src: "../public/fonts/blowbrush.woff2",
  variable: "--font-blowbrush",
  display: "swap",
});
