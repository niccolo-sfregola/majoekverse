"use client";

import { useFormStatus } from "react-dom";

// Bottone di submit che mostra uno stato "in corso" mentre la server action
// gira (login, logout, ecc.). Va usato dentro un <form action={...}>.
export default function SubmitButton({
  children,
  pendingText,
  className,
}: {
  children: React.ReactNode;
  pendingText: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      aria-busy={pending}
    >
      {pending ? pendingText : children}
    </button>
  );
}
