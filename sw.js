const CACHE_NAME = '21-15-9-v1.2.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/weightlifting/',
  '/weightlifting/index.html',
  '/nsca/',
  '/nsca/index.html',
  '/convert/',
  '/convert/index.html',
  '/plates/',
  '/plates/index.html',
  '/crossfit-wod/',
  '/crossfit-wod/index.html',
  '/timer/',
  '/timer/index.html',
  '/weightlifting-record/',
  '/weightlifting-record/index.html',
  '/hero-wod/',
  '/hero-wod/index.html',
  '/random-wod/',
  '/random-wod/index.html',
  '/css/common.css',
  '/css/nav.css',
  '/css/index.css',
  '/js/script.js',
  '/js/landing.js',
  '/js/input-validation.js',
  '/js/pwa.js',
  '/js/visitor-counter.js',
  '/manifest.json',
  '/weightlifting/weightlifting.js',
  '/weightlifting/weightlifting.css',
  '/nsca/1rm.js',
  '/nsca/1rm.css',
  '/convert/convert.js',
  '/convert/convert.css',
  '/crossfit-wod/open.js',
  '/crossfit-wod/open.css',
  '/timer/timer.js',
  '/timer/timer.css',
  '/weightlifting-record/records.js',
  '/weightlifting-record/records.css',
  '/plates/plates.js',
  '/plates/plates.css',
  '/hero-wod/hero-wod.js',
  '/hero-wod/hero-wod.css',
  '/hero-wod/hero_data.js',
  '/random-wod/random-wod.css',
  '/assets/favicon.svg',
  '/assets/icon-192.svg',
  '/assets/icon-512.svg',
  '/assets/og-image.svg'
];

// Service Worker 설치
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
      .catch(err => console.error('SW: 캐시 실패', err))
  );
});

// Service Worker 활성화 - 이전 버전 캐시 삭제
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

// 요청 가로채기
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 외부 요청은 무시 (GA, AdSense, jQuery CDN 등)
  if (url.origin !== self.location.origin) return;

  // HTML 네비게이션 → Network First (배포 즉시 반영)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request).then(r => r || caches.match('/')))
    );
    return;
  }

  // 정적 자산(CSS, JS, 이미지) → Cache First, 네트워크 폴백
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true })
      .then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        });
      })
      .catch(() => caches.match('/'))
  );
});
