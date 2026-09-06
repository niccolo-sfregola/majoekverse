import { Inter } from "next/font/google";
import localFont from "next/font/local";

// Font di tutta l'interfaccia: open source, stesso aspetto su ogni dispositivo.
export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Font del logo maJoekverse. Solo per titoli/heading, mai per il testo lungo:
// è un font "brush" pensato per poche parole in grande.
export const blowbrush = localFont({
  src: "../public/fonts/blowbrush.woff2",
  variable: "--font-blowbrush",
  display: "swap",
});
