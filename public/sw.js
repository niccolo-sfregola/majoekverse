// Service worker minimo: rende l'app installabile e mostra una pagina di
// fallback quando si naviga senza rete. Niente precaching di tutti gli asset
// (per quello servirebbe Serwist) — solo /offline.html, che è autosufficiente
// (stili inline, nessun altro file da caricare).
const CACHE = "mjv-shell-v2";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.add(OFFLINE_URL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Solo le navigazioni: prova la rete, se fallisce mostra la pagina offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL, { ignoreSearch: true }),
      ),
    );
  }
});
