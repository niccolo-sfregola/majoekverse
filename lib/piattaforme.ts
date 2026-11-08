// Le piattaforme dove Joe fa le dirette. L'ordine conta: è quello in cui
// compaiono ovunque (admin, Home, Discord).
export const PIATTAFORME = [
  { id: "twitch", nome: "Twitch", url: "https://www.twitch.tv/majoekoto" },
  // Il profilo e non /live: il bottone in Home c'è anche quando Joe non è in
  // diretta, e /live da offline mostra solo "LIVE terminata". Dal profilo,
  // quando è live, l'avatar ha il bollino LIVE.
  { id: "tiktok", nome: "TikTok", url: "https://www.tiktok.com/@majoekoto" },
] as const;

export type Piattaforma = (typeof PIATTAFORME)[number]["id"];


// Pulisce quello che arriva dal database o da un form: tiene solo id validi,
// nell'ordine di PIATTAFORME. Se non resta niente → Twitch (com'era prima che
// esistesse la colonna, es. negli snapshot vecchi della schedule).
export function pulisciPiattaforme(valore: unknown): Piattaforma[] {
  const lista = Array.isArray(valore) ? valore.map(String) : [];
  const valide = PIATTAFORME.map((p) => p.id).filter((id) => lista.includes(id));
  return valide.length > 0 ? valide : ["twitch"];
}


// ["twitch", "tiktok"] -> "Twitch + TikTok"
export function nomiPiattaforme(lista: Piattaforma[]): string {
  return PIATTAFORME.filter((p) => lista.includes(p.id))
    .map((p) => p.nome)
    .join(" + ");
}
