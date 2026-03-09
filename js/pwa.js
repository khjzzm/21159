// Service Worker 등록
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch(error => {
                console.error('SW 등록 실패:', error);
            });
    });
}

// PWA 설치 프롬프트
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallPrompt();
});

window.addEventListener('appinstalled', () => {
    hideInstallPrompt();
    deferredPrompt = null;
    showToast('21-15-9 앱이 설치되었습니다!');
});

function showInstallPrompt() {
    if (document.getElementById('pwa-install-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'pwa-install-btn';
    btn.textContent = '앱 설치';
    btn.className = 'pwa-install-button';
    btn.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#e0fd53;color:#1a1a1a;border:none;border-radius:25px;padding:12px 20px;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(224,253,83,0.3);z-index:1000;transition:all 0.3s ease;';

    btn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        hideInstallPrompt();
    });

    document.body.appendChild(btn);

    setTimeout(() => {
        btn.style.animation = 'pulse 2s infinite';
    }, 3000);
}

function hideInstallPrompt() {
    const btn = document.getElementById('pwa-install-btn');
    if (btn) btn.remove();
}

function showUpdateNotification() {
    const btn = document.createElement('button');
    btn.textContent = '새 버전 업데이트';
    btn.className = 'pwa-update-button';
    btn.style.cssText = 'position:fixed;top:80px;right:20px;background:#28a745;color:white;border:none;border-radius:20px;padding:8px 16px;font-size:12px;cursor:pointer;z-index:1001;animation:slideIn 0.3s ease;';

    btn.addEventListener('click', () => window.location.reload());
    document.body.appendChild(btn);

    setTimeout(() => btn.remove(), 10000);
}

// 오프라인/온라인 상태 감지
window.addEventListener('online', () => showToast('인터넷에 연결되었습니다'));
window.addEventListener('offline', () => showToast('오프라인 모드 - 캐시된 데이터 사용'));
