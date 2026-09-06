"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
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
  eventi: (
    <svg {...iconProps}>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
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

const LINKS = [
  { href: "/helpdesk", label: "Help Desk", icon: "help" },
  { href: "/eventi", label: "Eventi", icon: "eventi" },
  { href: "/", label: "Home", icon: "home" },
  { href: "/profilo", label: "Profilo", icon: "profilo" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 flex items-stretch justify-around border-t border-brand-lavanda/15 bg-brand-fondo/90 px-2 pb-[max(0.375rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-md md:hidden">
      {LINKS.map(({ href, label, icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className="relative flex flex-1 flex-col items-center gap-1 px-2 py-1.5"
          >
            {/* "Riflesso" della sezione attiva: pastiglia lucida con luce in alto e alone. */}
            <span
              className={`pointer-events-none absolute inset-x-1 inset-y-0 rounded-2xl bg-gradient-to-b from-brand-blu/70 to-brand-blu/15 shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_0_16px_rgb(46_42_181/0.55)] transition-opacity duration-200 ${
                active ? "opacity-100" : "opacity-0"
              }`}
            />
            <span
              className={`relative transition-colors ${
                active ? "text-brand-crema" : "text-brand-lavanda"
              }`}
            >
              {ICONS[icon]}
            </span>
            <span
              className={`relative text-[10px] leading-none transition-colors ${
                active ? "font-semibold text-brand-crema" : "text-brand-lavanda"
              }`}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
