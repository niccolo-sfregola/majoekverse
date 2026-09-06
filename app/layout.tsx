import type { Metadata, Viewport } from "next";
import "./globals.css";
import { inter, blowbrush } from "./fonts";
import BottomNav from "./bottomNav";
import TopNav from "./topNav";
import Planet from "./universoIcon";
import Onboarding from "./onboarding";
import PwaRegister from "./pwaRegister";

export const metadata: Metadata = {
  title: "maJoekverse",
  description:
    "Dirette, eventi e universo di maJoekoto: uno spazio solo per la community.",
  applicationName: "maJoekverse",
  appleWebApp: {
    capable: true,
    title: "maJoekverse",
    statusBarStyle: "black-translucent",
  },
};

// viewport-fit: cover serve perché env(safe-area-inset-*) funzioni su iPhone
// (altrimenti la barra in basso finisce sotto la tacca della home).
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#11102e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="it"
      className={`${inter.variable} ${blowbrush.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col pb-[calc(4rem_+_env(safe-area-inset-bottom))] md:pb-0">
        <TopNav />
        {children}
        <BottomNav />
        <Planet />
        <Onboarding />
        <PwaRegister />
      </body>
    </html>
  );
}
