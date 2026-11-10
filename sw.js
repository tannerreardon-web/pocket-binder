const CACHE = "pocket-binder-20261110153624";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // card databases and fonts go straight to the network
  // the page and published binders: try the network first so updates show up, fall back to the copy
  if (req.mode === "navigate" || url.pathname.includes("/users/")) {
    e.respondWith(fetch(req).then(r => { const c = r.clone(); if (r.ok) caches.open(CACHE).then(x => x.put(req, c)); return r; }).catch(() => caches.match(req).then(r => r || caches.match("index.html"))));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(n => { const c = n.clone(); if (n.ok) caches.open(CACHE).then(x => x.put(req, c)); return n; })));
});