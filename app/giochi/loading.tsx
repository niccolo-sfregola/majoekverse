import ScheletroPagina from "../scheletro";

// Come app/loading.tsx, ma per tutto quello che sta sotto /giochi.
// Serve un file qui perché quello della radice copre solo il cambio fra
// sezioni (es. Home → Giochi): da Giochi a Zip cambia solo la parte dentro
// /giochi, e senza questo Next aspetterebbe che il server abbia finito
// classifiche e partita prima di cambiare pagina (dopo la fine delle strisce).
export default function Loading() {
  return <ScheletroPagina righe={6} />;
}
