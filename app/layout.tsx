import type { Metadata } from "next";
import "./globals.css";
import { inter, blowbrush } from "./fonts";
import BottomNav from "./bottomNav";
import TopNav from "./topNav";
import Planet from "./universoIcon";
import Onboarding from "./onboarding";

export const metadata: Metadata = {
  title: "maJoekverse",
  description: "Dirette, eventi e universo di maJoekoto: uno spazio solo per la community.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="it"
      className={`${inter.variable} ${blowbrush.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pb-16 md:pb-0">
        <TopNav />
        {children}
        <BottomNav />
        <Planet />
        <Onboarding />
      </body>
    </html>
  );
}
