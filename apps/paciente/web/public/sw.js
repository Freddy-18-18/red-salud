/// <reference lib="webworker" />

// IMPORTANT: bump this string on every release that ships a behavioural SW
// change OR an asset-strategy change. The activate handler deletes any cache
// whose key does not match, so a version bump is what evicts stale chunks
// for users who already had the app open. Pair this with `skipWaiting` +
// `clients.claim()` below so the rollover happens without manual refresh.
const CACHE_NAME = "red-salud-paciente-v2";

const OFFLINE_URLS = [
  "/",
  "/dashboard",
  "/dashboard/recordatorios",
  "/offline",
];

// ─── Install ─────────────────────────────────────────────────────────────────
// Pre-cache the app shell so the offline page and key routes work without net.

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS)),
  );
  // Activate immediately without waiting for old SW to die
  self.skipWaiting();
});

// ─── Activate ────────────────────────────────────────────────────────────────
// Clean up old caches when a new version of the SW takes over.

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  // Take control of all open tabs immediately
  self.clients.claim();
});

// ─── Manual update channel ───────────────────────────────────────────────────
// Lets the page push the SW past `waiting` on its own (e.g. an "update
// available" banner) without forcing a full reload first.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// ─── Fetch Strategy ──────────────────────────────────────────────────────────
//
// - Navigation requests: Network first, cache fallback, then /offline
// - API / Supabase calls: Network first, cache fallback (stale data > no data)
// - Static assets (JS, CSS, images, fonts): Cache first, network update
// - Everything else: Network first

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (POST, etc.)
  if (request.method !== "GET") return;

  // Skip chrome-extension and other non-http(s) schemes
  if (!url.protocol.startsWith("http")) return;

  // ── Navigation (HTML pages) ───────────────────────────────────────────
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache a clone of the successful response
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match("/offline")),
        ),
    );
    return;
  }

  // ── API calls (Supabase, internal APIs) ───────────────────────────────
  if (
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("supabase")
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || new Response('{"error":"offline"}', {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }))),
    );
    return;
  }

  // ── Next.js bundle chunks ─────────────────────────────────────────────
  // Each build emits chunks under `/_next/static/chunks/` with content-hashed
  // filenames (e.g. `apps_paciente_web_src_<hash>._.js`). After a deploy the
  // freshly served HTML references new hashes; an old SW that returns a
  // cached chunk for one of those names ships the WRONG bytes back, which
  // manifests as React hydration mismatches in production. Always go to the
  // network for chunks and only fall back to cache when offline.
  if (url.pathname.startsWith("/_next/static/chunks/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }

  // ── Static assets (CSS, fonts, images, icons) ─────────────────────────
  const isStatic =
    url.pathname.match(/\.(css|png|jpg|jpeg|svg|gif|woff2?|ttf|ico)$/) ||
    url.pathname.startsWith("/_next/static/");

  if (isStatic) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const clone = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, clone));
            return response;
          }),
      ),
    );
    return;
  }

  // ── Default: network first ────────────────────────────────────────────
  event.respondWith(
    fetch(request).catch(() => caches.match(request)),
  );
});

// ─── Push Notifications ──────────────────────────────────────────────────────

self.addEventListener("push", (event) => {
  let data = { title: "Red Salud", body: "Nueva notificacion", url: "/dashboard/notificaciones" };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch {
    // Keep defaults
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: "red-salud-notification",
      data: { url: data.url },
      vibrate: [200, 100, 200],
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/dashboard/notificaciones";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If there's already a tab open, focus it
        for (const client of clientList) {
          if (client.url.includes("/dashboard") && "focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Otherwise open a new tab
        return self.clients.openWindow(url);
      }),
  );
});
