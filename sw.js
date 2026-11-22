/* 장기요양기관 휴·폐업 도우미 v2 - offline cache (network-first) */
const CACHE = 'hyupeup-guide-v2-3';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './assets/transfer_list_example.png',
  './assets/forms/application.pdf',
  './assets/forms/transfer-list.pdf',
  './assets/forms/lost-damaged-list.pdf',
  './assets/forms/confirmation.pdf',
  './assets/forms/authorization.pdf',
  './assets/forms/binding/annex22.pdf',
  './assets/forms/binding/annex23.pdf',
  './assets/forms/binding/annex24.pdf',
  './assets/forms/binding/annex24-2.pdf',
  './assets/forms/binding/annex24-3.pdf',
  './assets/forms/binding/annex25.pdf',
  './assets/forms/binding/annex26.pdf',
  './assets/previews/application.png',
  './assets/previews/transfer.png',
  './assets/previews/lost.png',
  './assets/previews/confirmation.png',
  './assets/previews/authorization.png',
  './assets/previews/annex22.png',
  './assets/previews/annex23.png',
  './assets/previews/annex24.png',
  './assets/previews/annex24_2.png',
  './assets/previews/annex24_3.png',
  './assets/previews/annex25.png',
  './assets/previews/annex26.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => Promise.allSettled(ASSETS.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 네트워크 우선: 새 배포가 즉시 반영되고, 오프라인일 때만 캐시를 사용합니다.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((resp) => {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          const copy = resp.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => {});
        }
        return resp;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
