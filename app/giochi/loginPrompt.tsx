import { signInWithTwitch } from "@/app/auth/actions";
import SubmitButton from "@/app/submitButton";
import Pannello from "@/app/pannello";
import { TransLink } from "@/app/transizione";
import { getDict } from "@/lib/i18n/server";

// Riquadro "accedi per giocare", comune a tutti i giochi.
export default async function LoginPrompt({ text }: { text: string }) {
  const t = await getDict();
  return (
    <Pannello className="flex flex-col items-start gap-4 p-[18px] lg:p-[26px]">
      <p className="text-brand-lavanda-chiara">{text}</p>
      <form action={signInWithTwitch} className="w-full lg:w-auto">
        <SubmitButton pendingText={t.auth.opening} className="btn">
          {t.auth.login}
        </SubmitButton>
      </form>
      <p className="text-sm text-brand-lavanda-chiara">
        {t.auth.privacyBefore}{" "}
        <TransLink href="/privacy" className="underline underline-offset-4 hover:text-brand-crema">
          {t.auth.privacyLink}
        </TransLink>
        .
      </p>
    </Pannello>
  );
}
