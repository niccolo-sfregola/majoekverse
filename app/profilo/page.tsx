"use client";

import { useState } from "react";

const isLoggedIn = true;
const isAdmin = true;

const profiloFinto = {
  username: "MaJoekotoFan",
  avatar: "🧸",
  isSubscriber: true,
};

const avatarOptions = ["🧸", "🐻", "🎮", "🦇", "⭐"];

const adminActions = ["Crea evento", "Crea notizia", "Modifica schedule"];

export default function Profilo() {
  const [avatar, setAvatar] = useState(profiloFinto.avatar);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 text-center">
      <h1 style={{ fontSize: "2rem", fontWeight: 500 }}>Profilo</h1>

      {isLoggedIn ? (
        <>
          <div className="flex flex-col items-center gap-2 rounded-xl p-4 bg-brand-darkblu">
            <span className="text-4xl">{avatar}</span>
            <p style={{ color: "#F6ECD8" }}>{profiloFinto.username}</p>
            <p style={{ color: "#B9A8E6" }}>
              {profiloFinto.isSubscriber ? "Abbonato ⭐" : "Non abbonato"}
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 rounded-xl p-4 bg-brand-darkblu w-full">
            <p className="font-semibold" style={{ color: "#F6ECD8" }}>
              Personalizza il tuo profilo
            </p>
            <div className="flex justify-center gap-2">
              {avatarOptions.map((emoji) => (
                <span
                  key={emoji}
                  onClick={() => setAvatar(emoji)}
                  className="text-2xl rounded-xl p-2 cursor-pointer"
                  style={{
                    backgroundColor: emoji === avatar ? "#2E2AB5" : "transparent",
                  }}
                >
                  {emoji}
                </span>
              ))}
            </div>
          </div>

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

          <span
            className="rounded-xl p-4 bg-brand-corallo"
            style={{ color: "#F6ECD8" }}
          >
            Esci
          </span>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl p-4 bg-brand-darkblu">
          <p style={{ color: "#B9A8E6" }}>
            Accedi con Twitch per vedere il tuo profilo.
          </p>
          <span className="rounded-xl p-4 bg-brand-blu" style={{ color: "#F6ECD8" }}>
            Accedi con Twitch
          </span>
        </div>
      )}
    </main>
  );
}
