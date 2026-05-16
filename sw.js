// sw.js - Service Worker para Habbo Da21 Titan
// =========================================================================
// MUY IMPORTANTE: Cuando subas cambios a tus archivos .js, .css o HTML,
// cambia esta variable (ej: a 'da21-titan-v2') para que los jugadores 
// reciban la actualización y no se queden con la versión vieja cacheada.
// =========================================================================
const CACHE_NAME = 'da21-titan-v5';

// Lista de archivos vitales a cachear
const ASSETS_TO_CACHE = [
  '/',
  '/apple-touch-icon.png',
  '/favicon-96x96.png',
  '/favicon.ico',
  '/favicon.svg',
  '/index.html',
  '/style.css',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png',
  '/assets/audio/coin_kaching.mp3',
  '/assets/img/tile_floor.png',
  '/assets/img/dado/dice_1.png',
  '/assets/img/dado/dice_2.png',
  '/assets/img/dado/dice_3.png',
  '/assets/img/dado/dice_4.png',
  '/assets/img/dado/dice_5.png',
  '/assets/img/dado/dice_6.png',
  '/assets/img/dado/dice_closed.png',
  '/assets/img/dado/dice_spinning.png',
  '/assets/img/editor/accessories.png',
  '/assets/img/editor/belts.png',
  '/assets/img/editor/body.png',
  '/assets/img/editor/bottoms-sn.png',
  '/assets/img/editor/bottoms.png',
  '/assets/img/editor/chest.png',
  '/assets/img/editor/female.png',
  '/assets/img/editor/glasses.png',
  '/assets/img/editor/hair-accessories.png',
  '/assets/img/editor/hair-sn.png',
  '/assets/img/editor/hair.png',
  '/assets/img/editor/hats.png',
  '/assets/img/editor/jackets.png',
  '/assets/img/editor/male.png',
  '/assets/img/editor/moustaches.png',
  '/assets/img/editor/removable.png',
  '/assets/img/editor/scrollbar-background.png',
  '/assets/img/editor/scrollbar-bar.png',
  '/assets/img/editor/scrollbar_bottom.png',
  '/assets/img/editor/scrollbar_top.png',
  '/assets/img/editor/shoes.png',
  '/assets/img/editor/top.png',
  '/assets/img/editor/tops.png',
  '/assets/img/holo/1_holo.png',
  '/assets/img/holo/2_holo.png',
  '/assets/img/holo/3_holo.png',
  '/assets/img/holo/4_holo.png',
  '/assets/img/holo/5_holo.png',
  '/assets/img/holo/6_holo.png',
  '/assets/img/holo/holo_off.png',
  '/assets/img/holo/holo_on.png',
  '/assets/img/ruleta/10_verde.png',
  '/assets/img/ruleta/1_amarillo.png',
  '/assets/img/ruleta/2_naranja.png',
  '/assets/img/ruleta/3_rojo.png',
  '/assets/img/ruleta/4_morado.png',
  '/assets/img/ruleta/5_verde.png',
  '/assets/img/ruleta/6_amarillo.png',
  '/assets/img/ruleta/7_naranja.png',
  '/assets/img/ruleta/8_rojo.png',
  '/assets/img/ruleta/9_morado.png',
  '/js/activity_feed.js',
  '/js/admin_panel.js',
  '/js/app.js',
  '/js/arena_game.js',
  '/js/arena_lobby.js',
  '/js/auth.js',
  '/js/da21_engine.js',
  '/js/furnidata.js',
  '/js/inventory.js',
  '/js/lang.js',
  '/js/minigames.js',
  '/js/profile.js',
  '/js/rooms.js',
  '/js/router.js',
  '/js/shop.js'
];

// 1. EVENTO INSTALL: Guarda los archivos en caché
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Obliga al SW nuevo a tomar el control inmediatamente
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Usamos un try/catch silencioso para los archivos (especialmente la música pesada)
      // para evitar que el Service Worker falle si un archivo da un error 404
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => cache.add(url).catch(err => console.warn('PWA: Error cacheando', url, err)))
      );
    })
  );
});

// 2. EVENTO ACTIVATE: Limpia el caché viejo si cambias la versión
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('PWA: Borrando caché viejo', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Toma el control de las pestañas abiertas
});

// 3. EVENTO FETCH: Intercepta las peticiones (Estrategia Cache First)
self.addEventListener('fetch', (e) => {
  // Ignorar las peticiones a la API de Supabase (no queremos cachear datos en vivo)
  if (e.request.url.includes('supabase.co')) {
    return;
  }

  // Ignorar las peticiones de música (las carga sobre la marcha para no reventar la memoria del móvil)
  if (e.request.url.includes('/assets/audio/radio/')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((response) => {
      // Si está en caché, lo devuelve. Si no, lo pide a internet (Netlify)
      return response || fetch(e.request);
    })
  );
});
