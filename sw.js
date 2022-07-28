const cacheName = 'rente-education-1-00-05';
const assets = [
    '/',
    '/index.html',
];

var mortalite = [];
for (var i = 0; i <= 106; i++) {
    assets.push('/mortalite/' + i + '.json');
}


// install event
self.addEventListener('install', evt => {
    evt.waitUntil(
        caches.open(cacheName).then((cache) => {
            console.log('Enregistrement des assets dans le cache');
            cache.addAll(assets);
        })
    );
});

// activate event
self.addEventListener('activate', evt => {
    evt.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== cacheName)
                .map(key => caches.delete(key))
            );
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((r) => {
            console.log('[Service Worker] Récupération de la ressource: ' + e.request.url);
            return r || fetch(e.request).then((response) => {
                return caches.open(cacheName).then((cache) => {
                    console.log('[Service Worker] Mise en cache de la nouvelle ressource: ' + e.request.url);
                    cache.put(e.request, response.clone());
                    return response;
                });
            });
        })
    );
});

