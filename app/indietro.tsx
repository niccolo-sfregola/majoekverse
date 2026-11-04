import { TransLink } from "./transizione";

// Link "indietro" con la freccetta (es. da Zip a Giochi), con le strisce.
export default function Indietro({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <TransLink href={href} className="link-azione self-start text-brand-lavanda">
      <svg
        aria-hidden
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 5l-7 7 7 7" />
      </svg>
      {children}
    </TransLink>
  );
}
