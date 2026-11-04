import type { Metadata, Viewport } from "next";
import "./globals.css";
import { oxanium, blowbrush } from "./fonts";
import BottomNav from "./bottomNav";
import TopNav from "./topNav";
import Pianeta from "./pianeta";
import Onboarding from "./onboarding";
import PwaRegister from "./pwaRegister";
import { LangProvider } from "./langProvider";
import { TransizioneProvider } from "./transizione";
import { getLang, getDict } from "@/lib/i18n/server";

// generateMetadata (invece di un oggetto fisso) perché la descrizione
// dipende dalla lingua scelta.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return {
    title: "maJoekverse",
    description: t.meta.description,
    applicationName: "maJoekverse",
    appleWebApp: {
      capable: true,
      title: "maJoekverse",
      statusBarStyle: "black-translucent",
    },
  };
}

// viewport-fit: cover serve perché env(safe-area-inset-*) funzioni su iPhone
// (altrimenti la barra in basso finisce sotto la tacca della home).
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#0A0826",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const lang = await getLang();
  return (
    <html
      lang={lang}
      className={`${oxanium.variable} ${blowbrush.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col pb-[calc(4.5rem_+_env(safe-area-inset-bottom))] md:pb-0">
        <LangProvider lang={lang}>
          <TransizioneProvider>
            <TopNav />
            {children}
            <BottomNav />
            <Pianeta />
            <Onboarding />
            <PwaRegister />
          </TransizioneProvider>
        </LangProvider>
      </body>
    </html>
  );
}
