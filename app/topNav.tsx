"use client";

import { usePathname } from "next/navigation";
import type { Dict } from "@/lib/i18n/dictionaries";
import { useDict } from "./langProvider";
import LangSwitch from "./langSwitch";
import { blowbrush } from "./fonts";
import { TransLink, useTransizione } from "./transizione";

// key = chiave del dizionario (t.nav.*) da cui prendere l'etichetta.
const LINKS: { href: string; key: keyof Dict["nav"] }[] = [
  { href: "/", key: "home" },
  { href: "/giochi", key: "giochi" },
  { href: "/profilo", key: "profilo" },
  { href: "/helpdesk", key: "helpdesk" },
];

// Nav da tablet/desktop: logo neon a sinistra, voci a destra con una sola
// barretta corallo che scorre sotto quella attiva (vedi .nav-barretta).
export default function TopNav() {
  const pathname = usePathname();
  const t = useDict();
  const { destinazione } = useTransizione();
  const corrente = destinazione ?? pathname;
  const isActive = (href: string) =>
    href === "/" ? corrente === "/" : corrente.startsWith(href);
  const indice = LINKS.findIndex(({ href }) => isActive(href));

  return (
    <header className="relative z-30 mx-auto hidden w-full max-w-5xl items-center justify-between gap-4 px-4 pt-4 md:flex">
      <TransLink
        href="/"
        aria-label={t.nav.home}
        className={`${blowbrush.className} text-[28px] leading-none text-brand-neon-testo [text-shadow:0_0_12px_var(--neon-alone)]`}
      >
        maJoekverse
      </TransLink>
      <div className="flex items-center gap-4">
        <nav className="relative grid grid-cols-4">
          {LINKS.map(({ href, key }) => {
            const active = isActive(href);
            return (
              <TransLink
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`nav-voce-desktop ${active ? "text-white" : "text-brand-lavanda"}`}
              >
                {t.nav[key]}
              </TransLink>
            );
          })}
          <span
            aria-hidden
            className="nav-barretta"
            data-nascosta={indice < 0}
            style={{ transform: `translateX(${Math.max(indice, 0) * 100}%)` }}
          />
        </nav>
        <LangSwitch />
      </div>
    </header>
  );
}
