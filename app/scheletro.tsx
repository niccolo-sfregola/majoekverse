// Blocchi grigi pulsanti al posto dei contenuti mentre arrivano dal server
// (usati dai loading.tsx). Stessi angoli tagliati del resto dell'app.
export function Blocco({ className = "" }: { className?: string }) {
  return <div className={`taglio bg-brand-superficie motion-safe:animate-pulse ${className}`} />;
}

// Scheletro di una pagina interna: titolo, un pannello e qualche riga.
export default function ScheletroPagina({ righe = 4 }: { righe?: number }) {
  return (
    <div className="pagina">
      <div className="h-11 w-56 bg-brand-superficie motion-safe:animate-pulse lg:h-16 lg:w-80" />
      <Blocco className="h-40" />
      <div className="flex flex-col gap-1.5">
        {Array.from({ length: righe }, (_, i) => (
          <div key={i} className="h-12 bg-brand-superficie motion-safe:animate-pulse" />
        ))}
      </div>
    </div>
  );
}
