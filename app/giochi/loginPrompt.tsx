import { signInWithTwitch } from "@/app/auth/actions";
import SubmitButton from "@/app/submitButton";
import { getDict } from "@/lib/i18n/server";

// Riquadro "accedi per giocare", comune a tutti i giochi.
export default async function LoginPrompt({ text }: { text: string }) {
  const t = await getDict();
  return (
    <div className="panel flex flex-col items-center gap-4 p-6 text-center">
      <p className="text-brand-lavanda">{text}</p>
      <form action={signInWithTwitch}>
        <SubmitButton
          pendingText={t.auth.opening}
          className="rounded-xl bg-[#9146ff] px-6 py-3 font-semibold text-white transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
        >
          {t.auth.login}
        </SubmitButton>
      </form>
    </div>
  );
}
