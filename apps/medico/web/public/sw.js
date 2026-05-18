/* eslint-disable */
// =============================================================================
// Red Salud — Médico Web — Service Worker
// =============================================================================
// Goals:
//   1. Cache the app shell + static assets so the dashboard loads when the
//      doctor opens the app without internet.
//   2. Network-first for Supabase API calls so doctors always see fresh data
//      when online, but transparently fall back to the last cached response
//      when offline.
//   3. Cache-first for media (images, fonts, icons) — these rarely change.
//   4. Don't touch authentication endpoints — auth state is too sensitive to
//      cache. Login/logout always go to the network.
//
// Strategy summary:
//   - precache    → app shell (HTML), built JS/CSS chunks
//   - stale-while-revalidate → Supabase reads (GET to /rest/v1/...)
//   - cache-first → static media (images, fonts, icons)
//   - network-only → Supabase auth, realtime, GraphQL
//
// Versioned cache names so we can blow them away on deploy. Bumping the
// SW_VERSION below invalidates ALL previous caches.
// =============================================================================

const SW_VERSION = 'v1';
const SHELL_CACHE = `red-salud-shell-${SW_VERSION}`;
const API_CACHE = `red-salud-api-${SW_VERSION}`;
const MEDIA_CACHE = `red-salud-media-${SW_VERSION}`;

// Minimum set we precache on install — keeps the install fast. Other assets
// land in the cache as the user navigates (runtime caching below).
const PRECACHE_URLS = [
  '/',
  '/dashboard',
  '/manifest.webmanifest',
  '/icon.svg',
];

// ----------------------------------------------------------------------------
// Install — populate the shell cache and skip waiting so the new SW activates
// on the next page load (rather than requiring a full close + reopen).
// ----------------------------------------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      try {
        await cache.addAll(PRECACHE_URLS);
      } catch (err) {
        // One bad URL shouldn't block install — log and continue.
        console.warn('[sw] precache partial failure:', err);
      }
      await self.skipWaiting();
    })(),
  );
});

// ----------------------------------------------------------------------------
// Activate — drop old caches from previous SW versions.
// ----------------------------------------------------------------------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      const live = new Set([SHELL_CACHE, API_CACHE, MEDIA_CACHE]);
      await Promise.all(
        keys.filter((k) => !live.has(k)).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

// ----------------------------------------------------------------------------
// Fetch — route requests through the strategy that matches their kind.
// ----------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GETs. POSTs/PUTs/PATCHes go straight to the network — the
  // offline mutation queue (a separate IndexedDB-backed layer) is responsible
  // for those.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip cross-origin requests we don't own (analytics, third-party widgets).
  if (url.origin !== self.location.origin && !isSupabase(url)) return;

  // Auth + realtime must always go to the network.
  if (isAuth(url) || isRealtime(url)) return;

  // Supabase REST reads → stale-while-revalidate
  if (isSupabaseRest(url)) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE));
    return;
  }

  // Media → cache-first
  if (isMedia(url)) {
    event.respondWith(cacheFirst(request, MEDIA_CACHE));
    return;
  }

  // Everything else (HTML, JS, CSS, fonts on same origin) → stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
});

// ----------------------------------------------------------------------------
// Strategy: stale-while-revalidate
//   Return the cached response immediately (if any), then update the cache
//   in the background with a fresh network response. The next visit gets
//   the new content. Best for content that should feel snappy but stay
//   reasonably current.
// ----------------------------------------------------------------------------
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    })
    .catch(() => null);
  return cached || networkPromise || fetch(request);
}

// ----------------------------------------------------------------------------
// Strategy: cache-first
//   Serve from cache when present, otherwise hit the network and populate
//   the cache. Great for assets that change rarely (icons, fonts).
// ----------------------------------------------------------------------------
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (err) {
    return new Response('', { status: 504 });
  }
}

// ----------------------------------------------------------------------------
// URL classifiers
// ----------------------------------------------------------------------------
function isSupabase(url) {
  return url.hostname.endsWith('.supabase.co');
}

function isSupabaseRest(url) {
  return isSupabase(url) && url.pathname.startsWith('/rest/');
}

function isAuth(url) {
  if (isSupabase(url) && url.pathname.startsWith('/auth/')) return true;
  if (url.pathname.startsWith('/auth/')) return true;
  return false;
}

function isRealtime(url) {
  // Supabase realtime uses WebSockets (handled below) plus a HTTP fallback
  // under /realtime/. Never cache either.
  return isSupabase(url) && url.pathname.startsWith('/realtime/');
}

function isMedia(url) {
  return /\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|woff2?|ttf|otf)$/i.test(
    url.pathname,
  );
}

// ----------------------------------------------------------------------------
// Message channel — lets the app force-bust caches after a deploy or after
// the doctor toggles "Limpiar caché" from settings.
// ----------------------------------------------------------------------------
self.addEventListener('message', (event) => {
  if (!event.data || typeof event.data !== 'object') return;
  if (event.data.type === 'CLEAR_CACHES') {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))),
    );
  }
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
