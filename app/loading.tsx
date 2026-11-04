import ScheletroPagina from "./scheletro";

// Mostrato subito a ogni navigazione mentre la pagina di destinazione carica
// i suoi dati sul server: così il cambio pagina (a metà delle strisce) non
// deve mai aspettare il server. Senza, al click non succederebbe niente per un po'.
export default function Loading() {
  return <ScheletroPagina />;
}
