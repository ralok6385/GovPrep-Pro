const CACHE_NAME = 'railpath-v3';

// Static assets to pre-cache on install
const STATIC_ASSETS = [
    '/manifest.json',
    '/images/lalan_logo.png',
];

// Cache strategies
const CACHE_FIRST_PATHS = [
    '/images/',
    '/uploads/',
    '/_next/static/',
    '/favicon.ico',
];

const NETWORK_FIRST_PATHS = [
    '/api/',
];

// Install event — pre-cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS).catch((err) => {
                console.warn('[SW] Pre-cache failed for some assets:', err);
            });
        })
    );
    self.skipWaiting();
});

// Activate event — clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event — routing strategy
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip chrome-extension and other protocols
    if (!url.protocol.startsWith('http')) return;

    // Cache-first for static assets (images, uploads, Next.js static files)
    if (CACHE_FIRST_PATHS.some((path) => url.pathname.startsWith(path))) {
        event.respondWith(cacheFirst(request));
        return;
    }

    // Network-first for API calls (fresh data preferred, fallback to cache)
    if (NETWORK_FIRST_PATHS.some((path) => url.pathname.startsWith(path))) {
        event.respondWith(networkFirst(request));
        return;
    }

    // STRICTLY Network-First for HTML page navigations to ALWAYS get the latest Next.js build
    if (request.mode === 'navigate') {
        event.respondWith(networkFirst(request));
        return;
    }

    // Default: network with cache fallback
    event.respondWith(networkFirst(request));
});

// Strategy: Cache first (for static assets)
async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        return new Response('Offline', { status: 503 });
    }
}

// Strategy: Network first (for API and dynamic content)
async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        return new Response(JSON.stringify({ message: 'You are offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// Strategy: Stale while revalidate (for purely non-critical assets)
async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    const fetchPromise = fetch(request)
        .then((response) => {
            if (response.ok) {
                cache.put(request, response.clone());
            }
            return response;
        })
        .catch(() => cached);

    return cached || fetchPromise;
}
