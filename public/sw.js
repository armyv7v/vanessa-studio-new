// Nombra y versiona tu caché. Cambia la versión para invalidar cachés antiguos.
const CACHE_NAME = 'vanessa-nails-studio-cache-v2';

// Lista de archivos esenciales para el funcionamiento offline inicial.
const urlsToCache = [
  '/',
  '/extra-cupos',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Evento 'install': Se dispara cuando el Service Worker se instala.
// Aquí precargamos el "App Shell".
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Abriendo caché y guardando App Shell');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento 'activate': Se dispara cuando el Service Worker se activa.
// Aquí limpiamos los cachés antiguos para liberar espacio.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Borrando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Evento 'fetch': Intercepta todas las solicitudes de red.
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignora peticiones que no son GET y las de extensiones de Chrome.
  if (request.method !== 'GET' || request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Estrategia para páginas (HTML): Network First
  if (request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(request)) // Si falla la red, busca en caché
    );
    return;
  }

  // Estrategia para archivos estáticos (CSS, JS, Imágenes): Stale-While-Revalidate
  if (request.destination === 'script' || request.destination === 'style' || request.destination === 'image' || request.destination === 'font') {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchedResponsePromise = fetch(request).then((networkResponse) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
          // Devuelve la respuesta del caché inmediatamente, o espera la de la red si no hay nada en caché.
          return cachedResponse || fetchedResponsePromise;
        });
      })
    );
  }
});

// Evento 'push': Se dispara cuando llega una notificación del servidor.
self.addEventListener('push', (event) => {
  const data = event.data.json(); // Asumimos que el servidor envía JSON
  console.log('[Service Worker] Notificación push recibida:', data);

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png', // Ícono para la notificación
    badge: '/icons/icon-192x192.png', // Ícono pequeño (Android)
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});