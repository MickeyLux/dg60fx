const CACHE_NAME = 'dg60fx-amp-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './icon.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                const resClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    if (event.request.method === 'GET' && event.request.url.startsWith('http')) {
                        cache.put(event.request, resClone);
                    }
                });
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
