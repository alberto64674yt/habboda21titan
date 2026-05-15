// sw.js - Service Worker para Habbo Da21 Titan
const CACHE_NAME = 'da21-titan-v2';

// Solo cacheamos lo básico para que sea instalable sin romper la lógica de Supabase
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/style.css',
        '/favicon.ico'
      ]);
    })
  );
});

// Este evento es obligatorio para que Chrome/Edge permitan la instalación
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
