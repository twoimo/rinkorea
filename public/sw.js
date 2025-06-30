// Service Worker for RinKorea Performance Optimization
// Version 1.0.0

const CACHE_NAME = 'rinkorea-v1';
const RUNTIME_CACHE = 'rinkorea-runtime';
const IMAGES_CACHE = 'rinkorea-images';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
    '/',
    '/images/optimized/site-icon-512.webp',
    '/images/optimized/rin-korea-logo-black.webp',
    '/images/optimized/homepage-main.webp'
];

// Network-first strategies for these routes
const NETWORK_FIRST_ROUTES = [
    '/api/',
    '/auth',
    '/profile'
];

// Cache-first strategies for these file types
const CACHE_FIRST_PATTERNS = [
    /\.(?:js|css|woff2?|eot|ttf|otf)$/,
    /\/assets\//,
    /\/images\/optimized\//
];

// Stale-while-revalidate for these patterns
const STALE_WHILE_REVALIDATE_PATTERNS = [
    /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
    /\/images\//
];

// Install event - precache critical assets
self.addEventListener('install', event => {
    console.log('[SW] Installing service worker...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Precaching assets...');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => {
                console.log('[SW] Skip waiting...');
                return self.skipWaiting();
            })
            .catch(err => {
                console.error('[SW] Precaching failed:', err);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[SW] Activating service worker...');

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => {
                            return cacheName.startsWith('rinkorea-') && cacheName !== CACHE_NAME;
                        })
                        .map(cacheName => {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Claiming clients...');
                return self.clients.claim();
            })
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other protocols
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Handle different types of requests with appropriate strategies
    if (isNetworkFirst(request)) {
        event.respondWith(networkFirst(request));
    } else if (isCacheFirst(request)) {
        event.respondWith(cacheFirst(request));
    } else if (isStaleWhileRevalidate(request)) {
        event.respondWith(staleWhileRevalidate(request));
    } else {
        // Default to network first for unknown requests
        event.respondWith(networkFirst(request));
    }
});

// Strategy: Network first (for dynamic content)
async function networkFirst(request) {
    const cacheName = RUNTIME_CACHE;

    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            // Clone the response because it can only be consumed once
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('[SW] Network failed, trying cache:', request.url);

        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Return offline page for navigation requests
        if (request.destination === 'document') {
            return new Response(
                `
        <!DOCTYPE html>
        <html>
        <head>
          <title>오프라인 - 린코리아</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: system-ui, sans-serif; 
              text-align: center; 
              padding: 2rem;
              background: #f8f9fa;
            }
            .container {
              max-width: 400px;
              margin: 0 auto;
              background: white;
              padding: 2rem;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            h1 { color: #1e40af; margin-bottom: 1rem; }
            p { color: #6b7280; line-height: 1.5; }
            button {
              background: #1e40af;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 4px;
              cursor: pointer;
              margin-top: 1rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🔌 오프라인</h1>
            <p>인터넷 연결을 확인하고 다시 시도해주세요.</p>
            <button onclick="window.location.reload()">다시 시도</button>
          </div>
        </body>
        </html>
        `,
                {
                    status: 200,
                    headers: { 'Content-Type': 'text/html; charset=utf-8' }
                }
            );
        }

        throw error;
    }
}

// Strategy: Cache first (for static assets)
async function cacheFirst(request) {
    const cacheName = CACHE_NAME;

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('[SW] Cache first failed:', error);
        throw error;
    }
}

// Strategy: Stale while revalidate (for images)
async function staleWhileRevalidate(request) {
    const cacheName = IMAGES_CACHE;

    const cachedResponse = await caches.match(request);

    // Start fetching fresh content in background
    const fetchPromise = fetch(request)
        .then(networkResponse => {
            if (networkResponse.ok) {
                const cache = caches.open(cacheName);
                // Clone the response before using it
                const responseClone = networkResponse.clone();
                cache.then(c => c.put(request, responseClone));
            }
            return networkResponse;
        })
        .catch(err => {
            console.log('[SW] Background fetch failed:', err);
            // Return null instead of potentially undefined cachedResponse
            return null;
        });

    // Return cached version immediately if available
    if (cachedResponse) {
        return cachedResponse;
    }

    // If no cache, wait for network
    return fetchPromise;
}

// Helper functions to determine caching strategy
function isNetworkFirst(request) {
    return NETWORK_FIRST_ROUTES.some(route =>
        request.url.includes(route)
    );
}

function isCacheFirst(request) {
    return CACHE_FIRST_PATTERNS.some(pattern =>
        pattern.test(request.url)
    );
}

function isStaleWhileRevalidate(request) {
    return STALE_WHILE_REVALIDATE_PATTERNS.some(pattern =>
        pattern.test(request.url)
    );
}

// Background sync for failed requests
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('[SW] Background sync triggered');
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    // Implement background sync logic here
    // This could include retrying failed API calls, uploading queued data, etc.
    console.log('[SW] Performing background sync...');
}

// Push notification handling
self.addEventListener('push', event => {
    if (!event.data) {
        return;
    }

    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/images/optimized/site-icon-512.webp',
        badge: '/images/optimized/site-icon-512.webp',
        data: data.url,
        requireInteraction: true,
        actions: [
            {
                action: 'open',
                title: '열기'
            },
            {
                action: 'close',
                title: '닫기'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            self.clients.openWindow(event.notification.data || '/')
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