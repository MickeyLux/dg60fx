const CACHE_NAME = 'yamaha-dg-v1';

// Liste aller Assets, die zwingend offline verfügbar sein müssen
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './app.js',
    './manifest.json',
    './icon.svg'
];

// 1. INSTALL-EVENT: Core-Assets in den Cache laden
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching app shell assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting(); // Aktiviert den neuen Service Worker sofort
});

// 2. ACTIVATE-EVENT: Alte Caches aufräumen, falls sich die Versionsnummer ändert
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 3. FETCH-EVENT: Cache-First Strategie mit Netzwerk-Fallback
self.addEventListener('fetch', (event) => {
    // Nur GET-Requests cachen
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Wenn das Asset im Cache ist, gib es direkt zurück (blitzschnell & offline)
            if (cachedResponse) {
                return cachedResponse;
            }

            // Ansonsten versuche es aus dem Netzwerk zu laden
            return fetch(event.request).then((networkResponse) => {
                // Optionale dynamische Cache-Erweiterung für neue Assets
                return networkResponse;
            }).catch(() => {
                // Fallback für Seitenaufrufe (Navigation), falls offline und nicht im Cache
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});