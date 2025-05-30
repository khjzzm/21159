const CACHE_NAME = '21-15-9-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/weightlifting/',
  '/weightlifting/index.html', 
  '/1rm/',
  '/1rm/index.html',
  '/convert/',
  '/convert/index.html',
  '/plates/',
  '/plates/index.html',
  '/styles.css',
  '/script.js',
  '/weightlifting/weightlifting.js',
  '/1rm/1rm.js',
  '/convert/convert.js',
  '/favicon.svg',
  '/og-image.svg',
  'https://code.jquery.com/jquery-3.5.1.min.js'
];

// Service Worker 설치
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: 파일 캐싱 중...');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
      .catch(err => console.log('Service Worker: 캐시 실패', err))
  );
});

// Service Worker 활성화
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // 이전 버전 캐시 삭제
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 요청 가로채기 (오프라인 지원)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 캐시에 있으면 캐시에서 반환
        if (response) {
          return response;
        }

        // 캐시에 없으면 네트워크에서 가져오기
        return fetch(event.request).then(response => {
          // 응답이 유효하지 않으면 그대로 반환
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 응답을 복제하여 캐시에 저장
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      }).catch(() => {
        // 오프라인이고 캐시에도 없는 경우
        return caches.match('/');
      })
  );
});

// 푸시 알림 (향후 사용)
self.addEventListener('push', event => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: '21-15-9-notification'
    };

    event.waitUntil(
      self.registration.showNotification('21-15-9', options)
    );
  }
}); 