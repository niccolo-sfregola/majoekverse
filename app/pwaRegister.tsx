"use client";

import { useEffect } from "react";

// Registra il service worker (public/sw.js) una volta caricata la pagina.
// Su https (online) e su localhost (per provare le notifiche in locale: il
// browser considera localhost sicuro anche senza https).
export default function PwaRegister() {
  useEffect(() => {
    if (
      "serviceWorker" in navigator &&
      (window.location.protocol === "https:" ||
        window.location.hostname === "localhost")
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return null;
}
