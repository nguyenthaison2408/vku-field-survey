const CACHE_NAME = 'vku-survey-v1';
const ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    'https://cdn.jsdelivr.net/npm/localforage@1.10.0/dist/localforage.min.js',
    'https://cdn.jsdelivr.net/npm/uuid@8.3.2/dist/umd/uuidv4.min.js'
];

// Install Event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Caching App Shell');
            return cache.addAll(ASSETS);
        })
    );
});

// Activate Event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== CACHE_NAME)
                .map(key => caches.delete(key))
            );
        })
    );
});

// Fetch Event (Cache-First)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

// Background Sync (Optional but good)
self.addEventListener('sync', event => {
    if (event.tag === 'sync-surveys') {
        event.waitUntil(syncSurveys());
    }
});

async function syncSurveys() {
    // This is handled in app.js as well for broader compatibility,
    // but can be implemented here for true background sync.
    console.log('Background Sync triggered');
}