"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { signInWithTwitch } from "@/app/auth/actions";
import { blowbrush } from "./fonts";
import SubmitButton from "./submitButton";
import Pannello from "./pannello";
import Button from "./button";
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

// I testi stanno nel dizionario: qui solo le chiavi, in ordine.
const SECTIONS: Array<keyof Dict["onboarding"]["sections"]> = [
  "home",
  "giochi",
  "profilo",
  "helpdesk",
  "universo",
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
    // Fondo quasi opaco invece della sfocatura (niente backdrop-filter, vedi
    // DESIGN.md): il pannello resta leggibile su qualsiasi pagina.
    <div className="overlay-fade-in fixed inset-0 z-[60] flex items-center justify-center bg-brand-fondo/90 p-4">
      <div className="w-full max-w-md">
        <Pannello className="relative flex flex-col p-[18px] lg:p-[26px]">
          {step < 2 ? (
            <button
              type="button"
              onClick={finish}
              className="link-azione absolute right-3 top-1.5 text-sm text-brand-lavanda"
            >
              {t.onboarding.skip}
            </button>
          ) : null}

          <div key={step} className="onboard-step flex flex-col gap-4">
            {step === 0 ? (
              <>
                <h2 className={`${blowbrush.className} neon mt-6 text-center text-4xl leading-tight`}>
                  {t.onboarding.welcome}
                </h2>
                <p className="text-center text-brand-lavanda-chiara">{t.onboarding.intro}</p>
                {/* Chi non parla italiano può cambiare lingua già da qui. */}
                <LangSwitch className="self-center" />
              </>
            ) : null}

            {step === 1 ? (
              <>
                <h2 className="titolo-sezione pr-16">{t.onboarding.whatsHere}</h2>
                <ul className="flex flex-col gap-1.5">
                  {SECTIONS.map((key) => (
                    <li key={key} className="bg-brand-fondo p-3">
                      <span className="block font-bold text-brand-crema">
                        {key === "universo" ? t.onboarding.universoName : t.nav[key]}
                      </span>
                      <span className="block text-sm text-brand-lavanda-chiara">
                        {t.onboarding.sections[key]}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <h2 className="titolo-sezione">{t.auth.login}</h2>
                <p className="text-brand-lavanda-chiara">{t.onboarding.loginText}</p>
                <form action={signInWithTwitch}>
                  <SubmitButton pendingText={t.auth.opening} className="btn">
                    {t.auth.login}
                  </SubmitButton>
                </form>
                <button
                  type="button"
                  onClick={finish}
                  className="link-azione self-center text-brand-lavanda"
                >
                  {t.onboarding.guest}
                </button>
                {/* Nuova scheda: l'onboarding copre la pagina, qui sotto
                    la privacy non si vedrebbe. */}
                <p className="text-center text-sm text-brand-lavanda-chiara">
                  {t.auth.privacyBefore}{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-4 hover:text-brand-crema"
                  >
                    {t.auth.privacyLink}
                  </a>
                  .
                </p>
              </>
            ) : null}
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            {/* A che passo siamo: tre indicatori, quello attuale in corallo. */}
            <div className="flex gap-1.5" aria-hidden>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`h-2 w-2 transition-colors ${
                    i === step ? "bg-brand-corallo" : "bg-brand-superficie-hover"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-4">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="link-azione text-brand-lavanda"
                >
                  {t.onboarding.back}
                </button>
              ) : null}
              {step < 2 ? (
                <Button onClick={() => setStep((s) => s + 1)} className="w-auto min-w-0 px-6 lg:min-w-0">
                  {t.onboarding.next}
                </Button>
              ) : null}
            </div>
          </div>
        </Pannello>
      </div>
    </div>
  );
}
