// Service Worker for RinKorea Performance Optimization
// Version 1.0.0

const CACHE_NAME = 'rinkorea-v1';
const STATIC_CACHE_NAME = 'rinkorea-static-v1';
const DYNAMIC_CACHE_NAME = 'rinkorea-dynamic-v1';

// Critical resources to cache immediately
const CRITICAL_RESOURCES = [
    '/',
    '/assets/js/main-Ah0ZGKYh.js',
    '/assets/main-Dbkyp7nY.css',
    '/images/optimized/site-icon-512.webp',
    '/images/site-icon-512.png'
];

// Resources to cache on demand
const CACHE_PATTERNS = [
    /^https:\/\/www\.rinkorea\.com\/assets\//,
    /^https:\/\/www\.rinkorea\.com\/images\//,
    /^https:\/\/fonts\.googleapis\.com/,
    /^https:\/\/fonts\.gstatic\.com/
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching critical resources');
                return cache.addAll(CRITICAL_RESOURCES);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Take control of all pages
            self.clients.claim()
        ])
    );
});

// Fetch event - implement cache strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http requests
    if (!request.url.startsWith('http')) {
        return;
    }

    // Strategy for different resource types
    if (request.destination === 'document') {
        // HTML pages - Network First with fallback
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clone response for cache
                    const responseToCache = response.clone();
                    caches.open(DYNAMIC_CACHE_NAME)
                        .then((cache) => {
                            cache.put(request, responseToCache);
                        });
                    return response;
                })
                .catch(() => {
                    // Fallback to cache if network fails
                    return caches.match(request);
                })
        );
    } else if (request.destination === 'script' || request.destination === 'style') {
        // JS and CSS - Cache First
        event.respondWith(
            caches.match(request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    return fetch(request)
                        .then((response) => {
                            // Cache the response
                            const responseToCache = response.clone();
                            caches.open(STATIC_CACHE_NAME)
                                .then((cache) => {
                                    cache.put(request, responseToCache);
                                });
                            return response;
                        });
                })
        );
    } else if (request.destination === 'image') {
        // Images - Cache First with long-term storage
        event.respondWith(
            caches.match(request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    return fetch(request)
                        .then((response) => {
                            // Only cache successful responses
                            if (response.status === 200) {
                                const responseToCache = response.clone();
                                caches.open(STATIC_CACHE_NAME)
                                    .then((cache) => {
                                        cache.put(request, responseToCache);
                                    });
                            }
                            return response;
                        });
                })
        );
    } else if (CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
        // Other cacheable resources
        event.respondWith(
            caches.match(request)
                .then((cachedResponse) => {
                    return cachedResponse || fetch(request)
                        .then((response) => {
                            const responseToCache = response.clone();
                            caches.open(DYNAMIC_CACHE_NAME)
                                .then((cache) => {
                                    cache.put(request, responseToCache);
                                });
                            return response;
                        });
                })
        );
    }
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Handle background sync tasks
            console.log('Background sync triggered')
        );
    }
});

// Push notifications (if needed in future)
self.addEventListener('push', (event) => {
    if (event.data) {
        const options = {
            body: event.data.text(),
            icon: '/images/optimized/site-icon-512.webp',
            badge: '/images/optimized/site-icon-512.webp',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1
            }
        };

        event.waitUntil(
            self.registration.showNotification('린코리아', options)
        );
    }
});

// Performance monitoring
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'GET_CACHE_SIZE') {
        getCacheSize().then(size => {
            event.ports[0].postMessage({
                type: 'CACHE_SIZE',
                size: size
            });
        });
    }
});

async function getCacheSize() {
    const cacheNames = await caches.keys();
    let totalSize = 0;

    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();

        for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
                const blob = await response.blob();
                totalSize += blob.size;
            }
        }
    }

    return totalSize;
}

console.log('[SW] Service Worker loaded successfully'); 