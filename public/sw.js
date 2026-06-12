const SW_VERSION = "taurus-v4";
const STATIC_CACHE = `${SW_VERSION}-static`;
const DYNAMIC_CACHE = `${SW_VERSION}-dynamic`;
const OFFLINE_URL = "/offline.html";

const APP_SHELL = [
  "/",
  "/changelog",
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icon.svg",
  "/icon-maskable.svg",
  "/icon-monochrome.svg",
  "/icon-1024.png",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-192.png",
  "/icon-maskable-512.png",
  "/icon-monochrome-512.png",
  "/apple-touch-icon.png",
  "/favicon-32.png",
  "/favicon.ico",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.startsWith(SW_VERSION)) {
              return caches.delete(cacheName);
            }

            return Promise.resolve(false);
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function shouldCacheResponse(response) {
  return response && response.ok && response.type === "basic";
}

async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    if (shouldCacheResponse(networkResponse)) {
      const cache = await caches.open(cacheName);
      await cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    throw new Error("Network unavailable and no cache hit.");
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then((networkResponse) => {
      if (shouldCacheResponse(networkResponse)) {
        cache.put(request, networkResponse.clone());
      }

      return networkResponse;
    })
    .catch(() => null);

  if (cached) {
    return cached;
  }

  const networkResponse = await networkPromise;
  if (networkResponse) {
    return networkResponse;
  }

  return Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  const isNavigation = request.mode === "navigate";
  const isShareApi = url.pathname.startsWith("/api/share");
  const isOgRoute = url.pathname === "/og";
  const isStaticAsset =
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "image" ||
    request.destination === "font";

  if (isNavigation) {
    event.respondWith(
      (async () => {
        try {
          return await networkFirst(request, DYNAMIC_CACHE);
        } catch {
          const offlinePage = await caches.match(OFFLINE_URL);
          return offlinePage || Response.error();
        }
      })(),
    );

    return;
  }

  if (isShareApi || isOgRoute) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    return;
  }

  if (isStaticAsset) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
  }
});
