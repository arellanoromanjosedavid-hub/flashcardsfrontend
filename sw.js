// Minimal service worker — its main job is just to exist, which is one of
// the requirements Chrome checks before it'll offer "Add to Home Screen."
// This also caches the app shell so it opens instantly on repeat visits
// (though live flashcard data still needs the network every time).

const CACHE_NAME = 'vocab-study-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle same-origin app-shell files from cache; everything else
  // (Supabase calls, audio files, images) goes straight to the network.
  const url = new URL(event.request.url);
  if (url.origin === self.location.origin && APP_SHELL.some(p => url.pathname.endsWith(p.replace('./','')))) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
