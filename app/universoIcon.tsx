"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Planet() {
  const pathname = usePathname();

  if (pathname === "/universo") {
    return null;
  }

  return (
    <Link href="/universo" className="fixed right-4 top-4 md:top-auto md:bottom-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-brand-blu text-2xl shadow-lg animate-spin [animation-duration:6s] md:animate-none md:hover:animate-spin">
      🪐
    </Link>
  );
}
