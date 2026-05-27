const CACHE_NAME = 'pizarra-moncofa-v17';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/styles.css',
    '/assets/icon.png',
    '/assets/ball.jpg',
    '/img/field_bg.png',
    '/img/logo.png',
    // Local Scripts
    '/js/constants.js',
    '/js/logo-data.js',
    '/js/state.js',
    '/js/squad-manager.js',
    '/js/drawing_new.js?v=9999',
    '/js/animation.js',
    '/js/tactics-manager.js',
    '/js/ui.js',
    '/js/export-manager.js',
    '/js/drag-drop-manager.js',
    '/js/main.js',
    // CDNs (External) - cached for offline availability
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap',
    'https://unpkg.com/lucide@latest',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching App Shell');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating Service Worker...');
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[Service Worker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    // Use Cache First, fallback to Network
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(
                    (response) => {
                        // Check if we received a valid response
                        // Check if we received a valid response
                        // ALLOW status 0 (opaque) for CDNs like Google Fonts/Unpkg if they don't support CORS or if mode is no-cors
                        // ALLOW type 'cors' for standard CDNs
                        if (!response || (response.status !== 200 && response.status !== 0) || response.type === 'error') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});
