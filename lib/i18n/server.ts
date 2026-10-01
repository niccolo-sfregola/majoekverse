import { cookies } from "next/headers";
import {
  dictionaries,
  isLang,
  DEFAULT_LANG,
  LANG_COOKIE,
  type Lang,
  type Dict,
} from "./dictionaries";

// Lingua scelta dall'utente, letta dal cookie. Se non c'è (o è strana)
// → italiano. Solo lato server (Server Component / Server Action).
export async function getLang(): Promise<Lang> {
  const value = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(value) ? value : DEFAULT_LANG;
}

// Il dizionario della lingua attuale, per i Server Component.
export async function getDict(): Promise<Dict> {
  return dictionaries[await getLang()];
}
