const CACHE_NAME = 'readflow-v1';
const ASSETS = [
    './',
    './index.html',
    './css/styles.css',
    './js/state.js',
    './js/ui.js',
    './js/settings.js',
    './js/timer.js',
    './js/minimap.js',
    './js/reader.js',
    './js/file-handler.js',
    './js/export.js',
    './js/shortcuts.js',
    './js/dynamic-reading.js',
    './js/app.js',
    './manifest.json',
    './icon.svg'
];

// Instalação do Service Worker e Cache de assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Estratégia de Fetch: Cache First, falling back to Network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
    );
});
