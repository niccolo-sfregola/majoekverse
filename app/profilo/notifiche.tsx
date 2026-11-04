"use client";

import { useEffect, useState } from "react";
import { useDict, useLang } from "@/app/langProvider";
import Pannello from "@/app/pannello";
import Button from "@/app/button";
import {
  deletePushSubscription,
  getPushPrefs,
  savePushSubscription,
  sendTestPush,
  updatePushPrefs,
  type PushPrefs,
} from "./pushActions";

type Status =
  | "loading"
  | "unsupported"
  | "iosInstall" // iPhone/iPad: le notifiche arrivano solo con l'app installata
  | "denied"
  | "off"
  | "on";

// La chiave pubblica VAPID arriva come testo base64-url; il browser la vuole
// come byte (dalla guida PWA di Next.js).
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}
function isInstalled() {
  return window.matchMedia("(display-mode: standalone)").matches;
}

// Notifiche push di QUESTO dispositivo: attiva/disattiva, cosa ricevere,
// notifica di prova. Ogni dispositivo (telefono, PC) ha le sue preferenze.
export default function Notifiche() {
  const t = useDict();
  const n = t.notifiche;
  const lang = useLang();

  const [status, setStatus] = useState<Status>("loading");
  const [prefs, setPrefs] = useState<PushPrefs>({ zip: true, wordle: true });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Situazione iniziale: il browser le supporta? Questo dispositivo è già
  // iscritto (e con questo account)?
  useEffect(() => {
    let cancelled = false;
    async function check(): Promise<Status> {
      const supported =
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window;
      if (!supported) return isIos() && !isInstalled() ? "iosInstall" : "unsupported";
      if (Notification.permission === "denied") return "denied";

      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (!sub) return "off";
      const saved = await getPushPrefs(sub.endpoint);
      if (!saved) return "off";
      if (!cancelled) setPrefs(saved);
      return "on";
    }
    check()
      .catch(() => "unsupported" as const)
      .then((s) => {
        if (!cancelled) setStatus(s);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function currentSubscription() {
    const reg = await navigator.serviceWorker.getRegistration();
    return (await reg?.pushManager.getSubscription()) ?? null;
  }

  async function enable() {
    setBusy(true);
    setMessage(null);
    try {
      // Il permesso si può chiedere solo dopo un tocco dell'utente: siamo
      // dentro il click del bottone, quindi va bene.
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        return;
      }
      await navigator.serviceWorker.register("/sw.js");
      const reg = await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
          ),
        }));
      const ok = await savePushSubscription(
        JSON.parse(JSON.stringify(sub)),
        lang,
      );
      if (!ok) throw new Error("savePushSubscription ha risposto false");
      setPrefs({ zip: true, wordle: true });
      setStatus("on");
    } catch (e) {
      console.error("[notifiche]", e);
      setMessage(n.error);
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setMessage(null);
    try {
      const sub = await currentSubscription();
      if (sub) {
        await deletePushSubscription(sub.endpoint);
        await sub.unsubscribe();
      }
      setStatus("off");
    } catch (e) {
      console.error("[notifiche]", e);
      setMessage(n.error);
    } finally {
      setBusy(false);
    }
  }

  async function toggle(key: keyof PushPrefs) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next); // subito a schermo, poi salviamo
    const sub = await currentSubscription();
    const ok = sub ? await updatePushPrefs(sub.endpoint, next, lang) : false;
    if (!ok) {
      console.error("[notifiche] preferenze non salvate", { hasSub: !!sub });
      setPrefs(prefs);
      setMessage(n.error);
    }
  }

  async function test() {
    setBusy(true);
    setMessage(null);
    const sub = await currentSubscription();
    const ok = sub
      ? await sendTestPush(sub.endpoint).catch((e) => {
          console.error("[notifiche] prova", e);
          return false;
        })
      : false;
    if (!ok) console.error("[notifiche] prova non inviata", { hasSub: !!sub });
    setMessage(ok ? n.testSent : n.error);
    setBusy(false);
  }

  const info: Partial<Record<Status, string>> = {
    unsupported: n.unsupported,
    iosInstall: n.iosInstall,
    denied: n.denied,
    off: n.intro,
  };

  return (
    <Pannello className="flex flex-col gap-3 p-[18px] lg:p-[26px]">
      <h2 className="titolo-sezione">{n.title}</h2>

      {status === "loading" ? (
        <div className="h-[52px] bg-brand-fondo motion-safe:animate-pulse" />
      ) : status === "on" ? (
        <>
          <p className="text-brand-lavanda-chiara">{n.on}</p>
          {(["zip", "wordle"] as const).map((key) => (
            <label
              key={key}
              className="flex min-h-11 cursor-pointer items-center justify-between gap-3 text-brand-crema"
            >
              <span>{n[key]}</span>
              <input
                type="checkbox"
                checked={prefs[key]}
                onChange={() => toggle(key)}
                className="h-5 w-5 shrink-0 accent-brand-lavanda"
              />
            </label>
          ))}
          {/* Azioni secondarie: link, non bottoni pieni. */}
          <div className="flex flex-wrap gap-x-8">
            <button type="button" onClick={test} disabled={busy} className="link-azione disabled:opacity-50">
              {n.test}
            </button>
            <button type="button" onClick={disable} disabled={busy} className="link-azione disabled:opacity-50">
              {n.disable}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-brand-lavanda-chiara">{info[status]}</p>
          {status === "off" ? (
            <Button onClick={enable} disabled={busy} className="mt-1 lg:self-start">
              {busy ? n.enabling : n.enable}
            </Button>
          ) : null}
        </>
      )}

      {message ? (
        <p className="text-brand-lavanda-chiara" aria-live="polite">
          {message}
        </p>
      ) : null}
    </Pannello>
  );
}
