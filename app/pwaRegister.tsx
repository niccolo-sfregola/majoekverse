"use client";

import { useEffect } from "react";

// Registra il service worker (public/sw.js) una volta caricata la pagina.
export default function PwaRegister() {
  useEffect(() => {
    if (
      "serviceWorker" in navigator &&
      window.location.protocol === "https:"
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return null;
}
