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
  // Le lettere sono raggruppate per parola (whitespace-nowrap): ogni lettera
  // è un blocco a sé, e senza il gruppo un titolo lungo potrebbe andare a
  // capo a metà parola. Il ritardo invece continua da una parola all'altra.
  let indice = 0;
  const parole = children.split(" ").map((parola) =>
    Array.from(parola).map((c) => ({ c, ritardo: 120 + indice++ * 55 })),
  );

  return (
    <h1
      className={`${blowbrush.className} text-[46px] leading-none text-brand-crema lg:text-[clamp(52px,7vw,84px)] ${className}`}
    >
      <span className="sr-only">{children}</span>
      <span aria-hidden>
        {parole.map((lettere, p) => (
          <span key={p}>
            {p > 0 ? " " : null}
            <span className="inline-block whitespace-nowrap">
              {lettere.map(({ c, ritardo }, i) => (
                <span key={i} className="lettera" style={{ animationDelay: `${ritardo}ms` }}>
                  {c}
                </span>
              ))}
            </span>
          </span>
        ))}
      </span>
    </h1>
  );
}
