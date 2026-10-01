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

// --- Notifiche push ----------------------------------------------------------
// Il server (lib/push.ts) manda { title, body, url }: qui la mostriamo.
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let data;
  try {
    data = event.data.json();
  } catch {
    return;
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "maJoekverse", {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url || "/" },
      // Stesso tag = la notifica nuova sostituisce la vecchia.
      ...(data.tag ? { tag: data.tag, renotify: true } : {}),
    }),
  );
});

// Tocco sulla notifica: se l'app è già aperta la riusiamo (e la portiamo
// alla pagina giusta), altrimenti apriamo una finestra nuova.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/", self.location.origin)
    .href;
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windows) => {
        const open = windows.find((w) => w.url.startsWith(self.location.origin));
        if (open) {
          return open.focus().then((w) => (w ? w.navigate(url) : null));
        }
        return self.clients.openWindow(url);
      }),
  );
});
