// Minimal service worker - required for PWA but no caching
self.addEventListener('install', () => {
    console.log('Service Worker installed');
});

self.addEventListener('activate', () => {
    console.log('Service Worker activated');
});

self.addEventListener('fetch', (event) => {
    // Just let requests go through to the network
    event.respondWith(fetch(event.request));
});