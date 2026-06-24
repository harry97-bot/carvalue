// CARVALUE service worker — 설치형 PWA + 오프라인 폴백 (보수적: 인증/API 비간섭)
const CACHE = "carvalue-static-v2";
const PRECACHE = ["/", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE).catch(() => {}))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return; // 인증/포인트 등 변경요청은 건드리지 않음
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Supabase 등 외부 호출 비간섭

  // 페이지 이동: 네트워크 우선, 실패 시 캐시 폴백
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await fetch(req);
        } catch {
          const c = await caches.open(CACHE);
          return (await c.match(req)) || (await c.match("/")) || Response.error();
        }
      })()
    );
    return;
  }

  // 정적 자산: stale-while-revalidate
  event.respondWith(
    (async () => {
      const c = await caches.open(CACHE);
      const cached = await c.match(req);
      const fetching = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") c.put(req, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || fetching;
    })()
  );
});
