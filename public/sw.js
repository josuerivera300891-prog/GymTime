const CACHE_NAME = 'gymtime-v1';
const DATA_CACHE_NAME = 'gymtime-data-v1';

const PRECACHE_ASSETS = [
    '/c',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/favicon.ico'
];

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
    );
    self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Dynamic Data Cache (API) - Stale-While-Revalidate
    if (url.pathname.startsWith('/api/member')) {
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then((cache) => {
                return fetch(request)
                    .then((response) => {
                        if (response.status === 200) {
                            cache.put(request.url, response.clone());
                        }
                        return response;
                    })
                    .catch(() => cache.match(request));
            })
        );
        return;
    }

    // Static Assets Cache - Cache First
    event.respondWith(
        caches.match(request).then((response) => {
            return response || fetch(request);
        })
    );
});

// Push Notifications
self.addEventListener('push', function (event) {
    try {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-192x192.png',
            data: data.data
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    } catch (e) {
        console.error('Push error:', e);
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data?.url || '/c')
    );
});
