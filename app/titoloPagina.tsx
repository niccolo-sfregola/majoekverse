import { blowbrush } from "./fonts";

// Titolo di pagina in Blowbrush con le lettere che entrano una alla volta
// (vedi .lettera). I lettori di schermo leggono la parola intera (sr-only),
// non le singole lettere.
export default function TitoloPagina({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  return (
    <h1
      className={`${blowbrush.className} text-[46px] leading-none text-brand-crema lg:text-[clamp(52px,7vw,84px)] ${className}`}
    >
      <span className="sr-only">{children}</span>
      <span aria-hidden>
        {Array.from(children).map((c, i) => (
          <span key={i} className="lettera" style={{ animationDelay: `${120 + i * 55}ms` }}>
            {c}
          </span>
        ))}
      </span>
    </h1>
  );
}
