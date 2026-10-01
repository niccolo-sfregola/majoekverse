"use server";

import { cookies } from "next/headers";
import { isLang, LANG_COOKIE } from "@/lib/i18n/dictionaries";

// Salva la lingua nel cookie. Essendo una Server Action che tocca i cookie,
// Next ri-renderizza da solo la pagina con la lingua nuova.
export async function setLang(lang: string) {
  if (!isLang(lang)) return;
  (await cookies()).set(LANG_COOKIE, lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 anno
    sameSite: "lax",
  });
}
