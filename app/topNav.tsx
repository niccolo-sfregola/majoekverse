"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/eventi", label: "Eventi" },
  { href: "/profilo", label: "Profilo" },
  { href: "/helpdesk", label: "Help Desk" },
];

export default function TopNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="sticky top-0 inset-x-0 z-30 hidden border-b border-brand-lavanda/15 bg-brand-fondo/80 backdrop-blur-md md:block">
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-8 px-4 py-3">
        {LINKS.map(({ href, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`relative py-1 text-sm tracking-wide transition-colors ${
                active
                  ? "text-brand-crema"
                  : "text-brand-lavanda hover:text-brand-crema"
              }`}
            >
              {label}
              <span
                className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-brand-corallo transition-opacity ${
                  active ? "opacity-100" : "opacity-0"
                }`}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
