"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendToEndpoint } from "@/lib/push";
import { dictionaries, isLang, type Lang } from "@/lib/i18n/dictionaries";

export type PushPrefs = { zip: boolean; wordle: boolean };

// Come il browser descrive un'iscrizione (PushSubscription.toJSON()).
type BrowserSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

async function currentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

function safeLang(lang: unknown): Lang {
  return isLang(lang) ? lang : "it";
}

// Salva (o aggiorna) l'iscrizione di QUESTO dispositivo per l'utente loggato.
export async function savePushSubscription(
  sub: BrowserSubscription,
  lang: string,
): Promise<boolean> {
  const userId = await currentUserId();
  if (!userId) return false;
  if (
    typeof sub?.endpoint !== "string" ||
    !sub.endpoint.startsWith("https://") ||
    typeof sub.keys?.p256dh !== "string" ||
    typeof sub.keys?.auth !== "string"
  ) {
    return false;
  }

  // onConflict endpoint: se il dispositivo era già iscritto (anche con un
  // altro account), la riga passa all'utente attuale.
  const { error } = await createAdminClient()
    .from("push_subscriptions")
    .upsert(
      {
        user_id: userId,
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        lang: safeLang(lang),
      },
      { onConflict: "endpoint" },
    );
  if (error) console.error("[push] iscrizione non salvata", error);
  return !error;
}

// Preferenze del dispositivo (null = non iscritto, o iscritto da un altro
// account).
export async function getPushPrefs(endpoint: string): Promise<PushPrefs | null> {
  const userId = await currentUserId();
  if (!userId) return null;
  const { data } = await createAdminClient()
    .from("push_subscriptions")
    .select("notify_zip, notify_wordle")
    .eq("endpoint", endpoint)
    .eq("user_id", userId)
    .maybeSingle();
  return data ? { zip: data.notify_zip, wordle: data.notify_wordle } : null;
}

export async function updatePushPrefs(
  endpoint: string,
  prefs: PushPrefs,
  lang: string,
): Promise<boolean> {
  const userId = await currentUserId();
  if (!userId) return false;
  const { error } = await createAdminClient()
    .from("push_subscriptions")
    .update({
      notify_zip: !!prefs.zip,
      notify_wordle: !!prefs.wordle,
      lang: safeLang(lang),
    })
    .eq("endpoint", endpoint)
    .eq("user_id", userId);
  if (error) console.error("[push] preferenze non salvate", error);
  return !error;
}

export async function deletePushSubscription(endpoint: string): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;
  await createAdminClient()
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint)
    .eq("user_id", userId);
}

export async function sendTestPush(endpoint: string): Promise<boolean> {
  const userId = await currentUserId();
  if (!userId) return false;
  if (!(await getPushPrefs(endpoint))) {
    console.error("[push] prova: dispositivo non trovato in push_subscriptions");
    return false;
  }
  const res = await sendToEndpoint(endpoint, (lang) => ({
    title: "maJoekverse",
    body: dictionaries[lang].notifiche.testBody,
    url: "/profilo",
  }));
  return res.sent > 0;
}
