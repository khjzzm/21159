// PWA 기능 초기화
document.addEventListener('DOMContentLoaded', function() {
    // Service Worker 등록
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {                    
                    // 업데이트 체크
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // 새 버전 사용 가능 알림
                                showUpdateNotification();
                            }
                        });
                    });
                })
                .catch(error => {
                    console.error('❌ PWA: Service Worker 등록 실패', error);
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

    // 앱이 설치되었을 때
    window.addEventListener('appinstalled', (evt) => {
        hideInstallPrompt();
        showToast('21-15-9 앱이 설치되었습니다! 🎉');
    });

    // 설치 프롬프트 표시
    function showInstallPrompt() {
        // 이미 설치 버튼이 있는지 확인
        if (document.getElementById('pwa-install-btn')) return;
        
        const installBtn = document.createElement('button');
        installBtn.id = 'pwa-install-btn';
        installBtn.innerHTML = '📱 앱 설치';
        installBtn.className = 'pwa-install-button';
        installBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #3182f6;
            color: white;
            border: none;
            border-radius: 25px;
            padding: 12px 20px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(49, 130, 246, 0.3);
            z-index: 1000;
            transition: all 0.3s ease;
        `;
        
        installBtn.addEventListener('click', installApp);
        document.body.appendChild(installBtn);
        
        // 3초 후 자동으로 애니메이션 표시
        setTimeout(() => {
            installBtn.style.animation = 'pulse 2s infinite';
        }, 3000);
    }

    // 설치 실행
    async function installApp() {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        deferredPrompt = null;
        hideInstallPrompt();
    }

    // 설치 프롬프트 숨기기
    function hideInstallPrompt() {
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.remove();
        }
    }

    // 업데이트 알림
    function showUpdateNotification() {
        const updateBtn = document.createElement('button');
        updateBtn.innerHTML = '🔄 업데이트';
        updateBtn.className = 'pwa-update-button';
        updateBtn.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #28a745;
            color: white;
            border: none;
            border-radius: 20px;
            padding: 8px 16px;
            font-size: 12px;
            cursor: pointer;
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        
        updateBtn.addEventListener('click', () => {
            window.location.reload();
        });
        
        document.body.appendChild(updateBtn);
        
        // 10초 후 자동 제거
        setTimeout(() => {
            updateBtn.remove();
        }, 10000);
    }

    // 오프라인/온라인 상태 감지
    window.addEventListener('online', () => {
        showToast('🌐 인터넷에 연결되었습니다');
    });

    window.addEventListener('offline', () => {
        showToast('📡 오프라인 모드 - 캐시된 데이터 사용');
    });
});

// 토스트 메시지 (기존 함수 재사용)
function showToast(message) {
    // script.js의 showToast 함수가 있는지 확인하고 사용
    if (typeof window.originalShowToast === 'function') {
        window.originalShowToast(message);
    } else if (document.getElementById('toast-container')) {
        // 직접 토스트 생성
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast show';
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        // 3초 후 제거
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    } else {
        console.log('PWA:', message);
    }
}

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .pwa-install-button:hover {
        background: #1b64da !important;
        transform: scale(1.05);
    }
`;
document.head.appendChild(style); 