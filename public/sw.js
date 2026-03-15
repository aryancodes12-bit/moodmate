// MoodMate Service Worker v1.0
// Strategy: Cache-first for static assets, Network-first for API calls

const CACHE_NAME = 'moodmate-v1';
const STATIC_CACHE = 'moodmate-static-v1';
const API_CACHE = 'moodmate-api-v1';

// Assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  'https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap',
];

// ── Install: Pre-cache key assets ──────────────────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Installing MoodMate Service Worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Pre-cache partial failure (ok):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: Clean up old caches ──────────────────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating MoodMate Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => name !== STATIC_CACHE && name !== API_CACHE)
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ── Fetch: Smart caching strategy ──────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip Supabase API calls — always fresh
  if (url.hostname.includes('supabase.co')) return;

  // Skip local API calls (/api/chat etc) — always fresh
  if (url.pathname.startsWith('/api/')) return;

  // Skip chrome-extension and non-http
  if (!url.protocol.startsWith('http')) return;

  // For HTML pages: Network-first (keep app up to date)
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For Google Fonts: Cache-first (they rarely change)
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then(cache => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // For JS/CSS/images: Cache-first with network fallback
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff|woff2|ttf)$/) ||
    url.hostname !== location.hostname
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        }).catch(() => cached || new Response('Offline', { status: 503 }));
      })
    );
    return;
  }

  // Default: Network with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then(cache => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request) || caches.match('/index.html'))
  );
});

// ── Push Notifications ─────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'MoodMate 🌙', {
      body: data.body || "Time to journal! How are you feeling today? ✍️",
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: 'moodmate-reminder',
      requireInteraction: false,
      actions: [
        { action: 'journal', title: '✍️ Journal Now' },
        { action: 'dismiss', title: 'Later' },
      ],
      data: { url: '/?view=journal' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      if (windowClients.length > 0) {
        windowClients[0].focus();
        windowClients[0].navigate('/?view=journal');
      } else {
        clients.openWindow('/?view=journal');
      }
    })
  );
});

console.log('[SW] MoodMate Service Worker loaded ✅');