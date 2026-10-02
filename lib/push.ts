import webpush from "web-push";
import { createAdminClient } from "./supabase/admin";
import type { Lang } from "./i18n/dictionaries";

// Invio delle notifiche push. SOLO lato server (usa la chiave privata VAPID).
//
// Come funziona: ogni dispositivo iscritto ha un "endpoint" (un indirizzo del
// servizio push di Google/Apple/Mozilla). Noi mandiamo lì il messaggio,
// cifrato con le chiavi del dispositivo e firmato con la nostra chiave VAPID;
// il servizio lo consegna al service worker (public/sw.js), che lo mostra.

let configured = false;
function setup() {
  if (configured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) {
    throw new Error(
      "Mancano NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT",
    );
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

// Contenuto di una notifica. `url` = pagina da aprire quando la si tocca.
// `tag`: una notifica nuova con lo stesso tag SOSTITUISCE la vecchia invece
// di accumularsi (es. il sollecito dello Zip prende il posto dell'avviso).
export type PushMessage = {
  title: string;
  body: string;
  url: string;
  tag?: string;
};

// Il messaggio può dipendere dalla lingua del dispositivo e dall'utente.
// `null` = a questo utente non mandare niente.
export type MessageFor = (lang: Lang, userId: string) => PushMessage | null;

export type SubRow = {
  id: number;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  lang: string;
};

// Manda a un elenco di iscrizioni.
// Le iscrizioni che il servizio push dice "non esistono più" (404/410: app
// disinstallata, permesso revocato…) vengono cancellate.
export async function sendToSubscriptions(
  subs: SubRow[],
  message: MessageFor,
): Promise<{ sent: number; failed: number }> {
  setup();
  const gone: number[] = [];
  let sent = 0;
  let failed = 0;

  await Promise.all(
    subs.map(async (sub) => {
      const lang: Lang = sub.lang === "en" ? "en" : "it";
      const payload = message(lang, sub.user_id);
      if (!payload) return;
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload),
        );
        sent++;
      } catch (e) {
        failed++;
        const status = (e as { statusCode?: number }).statusCode;
        // Finisce nei log di Vercel (Runtime Logs): utile per capire perché.
        console.error("[push] invio fallito", status, (e as { body?: string }).body ?? e);
        if (status === 404 || status === 410) gone.push(sub.id);
      }
    }),
  );

  if (gone.length > 0) {
    await createAdminClient().from("push_subscriptions").delete().in("id", gone);
  }
  return { sent, failed };
}

const SUB_COLUMNS = "id, user_id, endpoint, p256dh, auth, lang";

// Tutte le iscrizioni che vogliono un certo tipo di notifiche.
export async function subscriptionsFor(
  kind: "zip" | "wordle",
): Promise<SubRow[]> {
  const { data } = await createAdminClient()
    .from("push_subscriptions")
    .select(SUB_COLUMNS)
    .eq(kind === "zip" ? "notify_zip" : "notify_wordle", true);
  return (data ?? []) as SubRow[];
}

// Tutti i dispositivi di alcuni utenti (es. il vincitore, o gli admin).
export async function sendToUsers(
  userIds: string[],
  message: MessageFor,
) {
  if (userIds.length === 0) return { sent: 0, failed: 0 };
  const { data } = await createAdminClient()
    .from("push_subscriptions")
    .select(SUB_COLUMNS)
    .in("user_id", userIds);
  return sendToSubscriptions((data ?? []) as SubRow[], message);
}

// Un solo dispositivo (per la notifica di prova).
export async function sendToEndpoint(
  endpoint: string,
  message: MessageFor,
) {
  const { data } = await createAdminClient()
    .from("push_subscriptions")
    .select(SUB_COLUMNS)
    .eq("endpoint", endpoint);
  return sendToSubscriptions((data ?? []) as SubRow[], message);
}

// Tutti i dispositivi di tutti gli admin.
export async function sendToAdmins(message: MessageFor) {
  const { data } = await createAdminClient().from("admins").select("user_id");
  return sendToUsers(
    (data ?? []).map((r) => r.user_id as string),
    message,
  );
}
