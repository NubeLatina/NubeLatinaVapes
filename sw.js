// Nube Latina · service worker (PWA + Web Push)
const CACHE = "nube-latina-v1";

self.addEventListener("install", e => { self.skipWaiting(); });
self.addEventListener("activate", e => { self.clients.claim(); });

// Cache network-first (para que la app funcione y se actualice)
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Llega una notificación push (app cerrada o en segundo plano)
self.addEventListener("push", e => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch (err) { data = { title: "Nube Latina", body: e.data ? e.data.text() : "" }; }
  const title = data.title || "Nube Latina";
  const body  = data.body  || "Novedad en tu negocio.";
  e.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "icon-192.png",
      badge: "icon-192.png",
      data: { url: data.url || "./" }
    })
  );
});

// Al tocar la notificación, abrir/enfocar la app
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "./";
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      for (const c of list) { if ("focus" in c) return c.focus(); }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
