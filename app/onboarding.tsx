"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { signInWithTwitch } from "@/app/auth/actions";
import { blowbrush } from "./fonts";
import SubmitButton from "./submitButton";
import LangSwitch from "./langSwitch";
import { useDict } from "./langProvider";
import type { Dict } from "@/lib/i18n/dictionaries";

const SEEN_KEY = "mjv-onboarding-v1";

// Ricordiamo su questo dispositivo che l'onboarding è già stato visto, sia con
// un cookie (persistente, 1 anno) sia con localStorage: basta uno dei due.
function alreadySeen(): boolean {
  try {
    if (localStorage.getItem(SEEN_KEY)) return true;
  } catch {}
  return (
    typeof document !== "undefined" &&
    document.cookie.split("; ").some((c) => c.startsWith(`${SEEN_KEY}=`))
  );
}

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {}
  try {
    document.cookie = `${SEEN_KEY}=1; path=/; max-age=31536000; samesite=lax`;
  } catch {}
}

function TwitchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M2.149 0 .537 4.119V20.16h5.4V24h3.017l3.844-3.84h4.633L23.463 12V0zm19.164 11.161-3.226 3.226h-5.4l-2.688 2.685v-2.685H5.4V1.92h15.913z" />
      <path d="M9.6 6.719h1.92v5.645H9.6zm5.28 0h1.92v5.645h-1.92z" />
    </svg>
  );
}

// I testi stanno nel dizionario: qui solo icona + chiave.
const SECTIONS: { icon: string; key: keyof Dict["onboarding"]["sections"] }[] = [
  { icon: "🏠", key: "home" },
  { icon: "🧩", key: "giochi" },
  { icon: "👤", key: "profilo" },
  { icon: "🛟", key: "helpdesk" },
  { icon: "🌌", key: "universo" },
];

export default function Onboarding() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const t = useDict();

  useEffect(() => {
    if (alreadySeen()) return;
    // getSession() legge il token in locale, senza chiamate di rete né errori
    // in console quando non c'è sessione (il caso più comune qui).
    createClient()
      .auth.getSession()
      .then(({ data }) => {
        if (data.session) {
          markSeen();
          return;
        }
        setVisible(true);
      });
  }, []);

  function finish() {
    markSeen();
    setVisible(false);
    router.replace("/");
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-fondo/85 p-4 backdrop-blur-sm">
      <div className="card-glass page-enter relative w-full max-w-md p-6">
        {step < 2 ? (
          <button
            type="button"
            onClick={finish}
            className="absolute right-4 top-4 text-xs uppercase tracking-wide text-brand-lavanda transition-colors hover:text-brand-crema"
          >
            {t.onboarding.skip}
          </button>
        ) : null}

        <div key={step} className="onboard-step flex flex-col gap-4">
          {step === 0 ? (
            <>
              <div className="mx-auto h-16 w-16 rounded-full bg-[radial-gradient(circle_at_50%_40%,#fff,#B9A8E6_45%,transparent_75%)] shadow-[0_0_28px_6px_rgba(46,42,181,0.6)]" />
              <h2
                className={`${blowbrush.className} text-center text-3xl tracking-wide text-brand-crema`}
              >
                {t.onboarding.welcome}
              </h2>
              <p className="text-center text-brand-lavanda">
                {t.onboarding.intro}
              </p>
              {/* Chi non parla italiano può cambiare lingua già da qui. */}
              <LangSwitch className="self-center" />
            </>
          ) : null}

          {step === 1 ? (
            <>
              <h2 className="text-lg font-semibold text-brand-crema">
                {t.onboarding.whatsHere}
              </h2>
              <ul className="flex flex-col gap-3">
                {SECTIONS.map((s) => (
                  <li key={s.key} className="flex gap-3">
                    <span className="text-xl leading-none">{s.icon}</span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-brand-crema">
                        {s.key === "universo"
                          ? t.onboarding.universoName
                          : t.nav[s.key]}
                      </span>
                      <span className="block text-sm text-brand-lavanda">
                        {t.onboarding.sections[s.key]}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <h2 className="text-lg font-semibold text-brand-crema">
                {t.auth.login}
              </h2>
              <p className="text-sm text-brand-lavanda">
                {t.onboarding.loginText}
              </p>
              <form action={signInWithTwitch}>
                <SubmitButton
                  pendingText={t.auth.opening}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#9146ff] py-3 font-semibold text-white transition hover:bg-[#7d3ce0] active:scale-[0.98] disabled:opacity-60"
                >
                  <TwitchIcon />
                  {t.auth.login}
                </SubmitButton>
              </form>
              <button
                type="button"
                onClick={finish}
                className="w-full rounded-xl border border-brand-lavanda/30 py-3 font-semibold text-brand-lavanda transition hover:bg-brand-lavanda/10 active:scale-[0.98]"
              >
                {t.onboarding.guest}
              </button>
              {/* Nuova scheda: l'onboarding copre la pagina, qui sotto
                  la privacy non si vedrebbe. */}
              <p className="text-center text-xs text-brand-lavanda">
                {t.auth.privacyBefore}{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-brand-crema"
                >
                  {t.auth.privacyLink}
                </a>
                .
              </p>
            </>
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === step ? "bg-brand-corallo" : "bg-brand-lavanda/30"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-brand-lavanda transition-colors hover:text-brand-crema"
              >
                {t.onboarding.back}
              </button>
            ) : null}
            {step < 2 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="rounded-lg bg-brand-blu px-4 py-1.5 text-sm font-semibold text-brand-crema transition hover:brightness-110 active:scale-[0.98]"
              >
                {t.onboarding.next}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
