// Testo che si scrive a macchina, con il cursore (vedi .scrivi-car).
// Solo CSS: ogni lettera è uno <span> che compare al suo turno, quindi il
// testo arriva già completo dal server e non serve JavaScript.
// I lettori di schermo leggono il testo intero (sr-only), non le lettere.
export default function Scrivi({
  testo,
  durata = 1.3,
  ritardo = 0.7,
}: {
  testo: string;
  durata?: number;
  ritardo?: number;
}) {
  const lettere = Array.from(testo);
  const passo = durata / lettere.length;
  return (
    <>
      <span className="sr-only">{testo}</span>
      <span aria-hidden style={{ "--passo": `${passo}s` } as React.CSSProperties}>
        {lettere.map((c, i) => {
          const t = `${(ritardo + i * passo).toFixed(3)}s`;
          return (
            <span key={i} className="scrivi-car" style={{ animationDelay: `${t}, ${t}` }}>
              {c}
            </span>
          );
        })}
      </span>
    </>
  );
}
