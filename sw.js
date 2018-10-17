var mwsCacheName = 'mws-restaurant-v1';

self.addEventListener('install', function(event) {
	event.waitUntil(
		caches.open(mwsCacheName).then(function(cache) {
			return cache.addAll([
				'/',//change back to minified files
	             'restaurant.html',
	             'manifest.json',
	             'css-min/styles.css',
	             'js-min/idb.js',
	             'js-min/dbhelper.js',
	             'js-min/main.js',
	             'js-min/restaurant_info.js'
	        ]);
		})
	);
});

self.addEventListener('activate', function(event) {
	event.waitUntil(
		caches.keys().then(function(cacheNames) {
			return Promise.all(
				cacheNames.filter(function(cacheName) {
					return cacheName.startsWith('mws-') && cacheName != mwsCacheName;
				}).map(function(cacheName) {
					return caches.delete(cacheName);
				})
			);
		})
	);
});

self.addEventListener('fetch', function(event) {
	var requestUrl = new URL(event.request.url);
		event.respondWith(servePhoto(event.request).then(function(response){
			return response || fetch(event.request);
		})
	);
});

function servePhoto(request) {
	var storageUrl = request.url.replace(/\.jpg$/, '');

	return caches.open(mwsCacheName).then(function(cache) {
		return cache.match(storageUrl).then(function(response) {
			if (response) return response;

			return fetch(request).then(function(networkResponse) {
				cache.put(storageUrl, networkResponse.clone());
				return networkResponse;
			});
		});
	});
}