// Pannello con angoli tagliati e bordo (vedi .pannello in globals.css).
// bordo="corallo" segna i contenuti riservati agli abbonati.
// soloTelefono: da desktop resta solo il contenuto, senza riquadro.
export default function Pannello({
  children,
  className = "",
  bordo,
  soloTelefono,
}: {
  children: React.ReactNode;
  className?: string;
  bordo?: "corallo";
  soloTelefono?: boolean;
}) {
  return (
    <div
      className={`pannello ${soloTelefono ? "pannello-solo-telefono" : ""}`}
      data-bordo={bordo}
    >
      <div className={`pannello-dentro ${className}`}>{children}</div>
    </div>
  );
}
