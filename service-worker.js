// Fertilizer Planner · Service Worker
// Bump CACHE_VERSION whenever the app shell changes to force an update.
const CACHE_VERSION = 'v1.1.0';
const CACHE_NAME = `fert-planner-${CACHE_VERSION}`;

// App shell — relative paths so it works at any GitHub Pages sub-path.
// All assets are now same-origin (no CDN), so first launch works fully offline.
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './vendor/lucide.min.js',
  './vendor/fonts/fonts.css',
  // Latin fonts — small, always loaded.
  './vendor/fonts/files/dm-sans-latin-wght-normal.woff2',
  './vendor/fonts/files/dm-sans-latin-ext-wght-normal.woff2'
  // Note: CJK woff2 subsets are loaded lazily by the browser based on
  // unicode-range, then cached on-demand by the runtime handler below.
];

// ─── INSTALL ─────────────────────────────────────────────────────────────
// Pre-cache the app shell. Use individual adds so one missing file
// doesn't kill the whole install.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        APP_SHELL.map((url) =>
          cache.add(url).catch((err) =>
            console.warn('[SW] Failed to cache', url, err)
          )
        )
      )
    ).then(() => self.skipWaiting())
  );
});

// ─── ACTIVATE ────────────────────────────────────────────────────────────
// Clean up old cache versions.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('fert-planner-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── FETCH ───────────────────────────────────────────────────────────────
// Strategy:
//   - Navigation requests → network-first, fallback to cached index.html
//   - All other requests  → cache-first, then network (and cache on success)
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET.
  if (request.method !== 'GET') return;

  // Navigations: try network first so HTML updates show up online,
  // then fall back to the cached index.html offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) => cached || caches.match('./index.html')
          )
        )
    );
    return;
  }

  // Everything else: cache-first.
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((res) => {
          // Only cache successful basic responses.
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return res;
        }).catch(() => cached)
    )
  );
});
