const VERSION = 'conduct-home-v1.86-dashboard-calendrier';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((names) => Promise.all(names.map((name) => caches.delete(name)))).then(() => self.clients.claim()));
});
