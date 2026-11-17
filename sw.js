// Sürümü değiştirirsen eski önbellek silinir (oyunu güncellediğinde v1 -> v2 yap)
const CACHE = 'haxball-v5';
const CORE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Önbellekten hemen ver, arkada güncelle (Tailwind ve yazı tipi de ilk açılışta kaydedilir)
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(e.request, { ignoreSearch: true }).then((hit) => {
        const net = fetch(e.request)
          .then((res) => {
            if (res && (res.ok || res.type === 'opaque')) cache.put(e.request, res.clone());
            return res;
          })
          .catch(() => hit);
        return hit || net;
      })
    )
  );
});
