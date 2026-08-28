import { createClient } from "@/lib/supabase/server";
import { signInWithTwitch, signOut } from "@/app/auth/actions";
import AvatarPicker from "./avatarPicker";

// Il controllo del ruolo admin vero arriva alla Fase 5.
const isAdmin = false;
const adminActions = ["Crea evento", "Crea notizia", "Modifica schedule"];

export default async function Profilo() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const username =
    user?.user_metadata.nickname ??
    user?.user_metadata.name ??
    user?.user_metadata.preferred_username ??
    user?.email;
  const avatarUrl =
    user?.user_metadata.avatar_url ?? user?.user_metadata.picture;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 text-center">
      <h1 style={{ fontSize: "2rem", fontWeight: 500 }}>Profilo</h1>

      {user ? (
        <>
          <div className="flex flex-col items-center gap-2 rounded-xl p-4 bg-brand-darkblu">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                width={80}
                height={80}
                className="rounded-full"
              />
            ) : null}
            <p style={{ color: "#F6ECD8" }}>{username}</p>
          </div>

          <AvatarPicker />

          {isAdmin ? (
            <div className="flex flex-col items-center gap-3 rounded-xl p-4 bg-brand-darkblu w-full">
              <p className="font-semibold" style={{ color: "#F6ECD8" }}>
                + Aggiungi
              </p>
              <div className="flex flex-col gap-2 w-full">
                {adminActions.map((azione) => (
                  <span
                    key={azione}
                    className="rounded-xl p-3 bg-brand-blu"
                    style={{ color: "#F6ECD8" }}
                  >
                    {azione}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <form action={signOut}>
            <button
              type="submit"
              className="rounded-xl p-4 bg-brand-corallo"
              style={{ color: "#F6ECD8" }}
            >
              Esci
            </button>
          </form>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl p-4 bg-brand-darkblu">
          <p style={{ color: "#B9A8E6" }}>
            Accedi con Twitch per vedere il tuo profilo.
          </p>
          <form action={signInWithTwitch}>
            <button
              type="submit"
              className="rounded-xl p-4 bg-brand-blu"
              style={{ color: "#F6ECD8" }}
            >
              Accedi con Twitch
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
