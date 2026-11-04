"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { Dict } from "@/lib/i18n/dictionaries";
import { useDict } from "./langProvider";
import { TransLink, useTransizione } from "./transizione";

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const ICONS: Record<string, ReactNode> = {
  home: (
    <svg {...iconProps}>
      <path d="M3 10.5 12 4l9 6.5" />
      <path d="M5 9.5V20h14V9.5" />
      <path d="M10 20v-5h4v5" />
    </svg>
  ),
  giochi: (
    <svg {...iconProps}>
      <path d="M5 8h3.5a2 2 0 1 1 4 0H16v3.5a2 2 0 1 1 0 4V19H5z" />
    </svg>
  ),
  profilo: (
    <svg {...iconProps}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" />
    </svg>
  ),
  help: (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.6" />
      <path d="m8.6 8.6-3.2-3.2M18.6 5.4l-3.2 3.2M15.4 15.4l3.2 3.2M5.4 18.6l3.2-3.2" />
    </svg>
  ),
};

// key = chiave del dizionario (t.nav.*) da cui prendere l'etichetta.
const LINKS: { href: string; key: keyof Dict["nav"]; icon: string }[] = [
  { href: "/helpdesk", key: "helpdesk", icon: "help" },
  { href: "/giochi", key: "giochi", icon: "giochi" },
  { href: "/", key: "home", icon: "home" },
  { href: "/profilo", key: "profilo", icon: "profilo" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const t = useDict();
  const { destinazione } = useTransizione();
  // Durante una transizione conta la pagina cliccata: l'indicatore parte
  // subito, senza aspettare che la pagina cambi davvero.
  const corrente = destinazione ?? pathname;
  const isActive = (href: string) =>
    href === "/" ? corrente === "/" : corrente.startsWith(href);
  const indice = LINKS.findIndex(({ href }) => isActive(href));

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 grid grid-cols-4 border-t border-brand-lavanda bg-brand-superficie p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden">
      {/* Un solo indicatore che scorre fra le voci (vedi .nav-pastiglia).
          Fuori dalle quattro sezioni (es. /universo) sparisce, ferma sulla Home. */}
      <span
        aria-hidden
        className="nav-pastiglia"
        data-nascosta={indice < 0}
        style={{ transform: `translateX(${(indice < 0 ? 2 : indice) * 100}%)` }}
      >
        <span />
      </span>
      {LINKS.map(({ href, key, icon }) => {
        const active = isActive(href);
        return (
          <TransLink
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`nav-voce ${active ? "text-brand-fondo" : "text-brand-lavanda"}`}
          >
            {ICONS[icon]}
            <span className={active ? "font-bold" : undefined}>{t.nav[key]}</span>
          </TransLink>
        );
      })}
    </nav>
  );
}
