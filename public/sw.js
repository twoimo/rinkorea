const CACHE_NAME = 'rinkorea-v1.0.0';
const STATIC_CACHE_NAME = 'rinkorea-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'rinkorea-dynamic-v1.0.0';
const IMAGE_CACHE_NAME = 'rinkorea-images-v1.0.0';

// Static assets to cache
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/images/rin-korea-logo-black.png',
    '/images/rin-korea-logo-white.png',
    '/favicon.ico'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE_NAME &&
                            cacheName !== DYNAMIC_CACHE_NAME &&
                            cacheName !== IMAGE_CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache with fallback strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip external requests
    if (!url.origin.includes(self.location.origin) && !url.hostname.includes('supabase.co')) {
        return;
    }

    // Handle different types of requests with appropriate caching strategies
    if (isStaticAsset(request)) {
        event.respondWith(cacheFirstStrategy(request, STATIC_CACHE_NAME));
    } else if (isImageRequest(request)) {
        event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE_NAME));
    } else if (isApiRequest(request)) {
        event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE_NAME));
    } else {
        event.respondWith(staleWhileRevalidateStrategy(request, DYNAMIC_CACHE_NAME));
    }
});

// Check if request is for static assets
function isStaticAsset(request) {
    const url = new URL(request.url);
    return url.pathname.includes('/assets/') ||
        url.pathname.endsWith('.js') ||
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.woff2') ||
        url.pathname.endsWith('.woff');
}

// Check if request is for images
function isImageRequest(request) {
    const url = new URL(request.url);
    return url.pathname.includes('/images/') ||
        request.destination === 'image' ||
        url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
}

// Check if request is for API
function isApiRequest(request) {
    const url = new URL(request.url);
    return url.hostname.includes('supabase.co') ||
        url.pathname.startsWith('/api/');
}

// Cache First Strategy - for static assets
async function cacheFirstStrategy(request, cacheName) {
    try {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('Cache first strategy failed:', error);
        return new Response('Offline content not available', { status: 503 });
    }
}

// Network First Strategy - for API requests
async function networkFirstStrategy(request, cacheName) {
    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache:', error);
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        return new Response(JSON.stringify({ error: 'Offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Stale While Revalidate Strategy - for general content
async function staleWhileRevalidateStrategy(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(() => {
        // Network failed, return cached response if available
        return cachedResponse;
    });

    return cachedResponse || fetchPromise;
}
