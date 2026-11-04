import { cache } from "react";
import sharp from "sharp";

// Che tipo di logo è, per mostrarlo bene sul pannello scuro (vedi .logo-*
// in globals.css):
// - "chiaro": logo chiaro su sfondo trasparente → va bene così
// - "scuro": logo scuro su sfondo trasparente → si inverte la luminosità
//   (i colori restano), così diventa chiaro
// - "riquadro": logo su un riquadro bianco pieno → si inverte e il nero
//   del riquadro sparisce sul pannello, resta solo il logo chiaro
export type TipoLogo = "chiaro" | "scuro" | "riquadro";

// cache(): nella stessa richiesta lo stesso logo si analizza una volta sola.
export const tipoLogo = cache(async (url: string): Promise<TipoLogo> => {
  try {
    // force-cache: il file del logo non cambia (ogni caricamento ha un nome
    // nuovo), quindi lo si scarica una volta e poi resta in cache.
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return "chiaro";
    // Basta una versione piccolina per capire com'è fatto.
    const { data, info } = await sharp(Buffer.from(await res.arrayBuffer()))
      .ensureAlpha()
      .resize(64, 64, { fit: "inside" })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const px = (x: number, y: number) => {
      const i = (y * info.width + x) * 4;
      return [data[i], data[i + 1], data[i + 2], data[i + 3]];
    };
    const angoli = [
      px(0, 0),
      px(info.width - 1, 0),
      px(0, info.height - 1),
      px(info.width - 1, info.height - 1),
    ];
    // Quattro angoli bianchi e opachi: è un logo dentro un riquadro bianco.
    if (angoli.every(([r, g, b, a]) => a > 200 && Math.min(r, g, b) > 235)) {
      return "riquadro";
    }

    // Altrimenti conta quanto è luminoso il disegno (solo i pixel visibili).
    let somma = 0;
    let visibili = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue;
      somma += 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
      visibili++;
    }
    // Soglia 80 (su 255): sotto, il logo si perde sul pannello blu notte.
    // Un rosa acceso (~110) si legge già bene e resta com'è.
    return visibili && somma / visibili < 80 ? "scuro" : "chiaro";
  } catch {
    // Logo irraggiungibile o formato strano: lo mostriamo così com'è.
    return "chiaro";
  }
});
