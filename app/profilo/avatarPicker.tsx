"use client";

import { useState } from "react";

const avatarOptions = ["🧸", "🐻", "🎮", "🦇", "⭐"];

// Scelta icona solo lato client, non ancora salvata da nessuna parte.
// Salvarla nel database sarà un'aggiunta più avanti.
export default function AvatarPicker() {
  const [avatar, setAvatar] = useState(avatarOptions[0]);

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl p-4 bg-brand-darkblu w-full">
      <p className="font-semibold" style={{ color: "#F6ECD8" }}>
        Scegli un&apos;icona <span className="text-3xl">{avatar}</span>
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
  );
}
