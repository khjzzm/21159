// 에러 트래킹 (콘솔 + localStorage)
(function() {
    var ERROR_KEY = 'error-log';
    var MAX_ERRORS = 50;

    function logError(entry) {
        try {
            var logs = JSON.parse(localStorage.getItem(ERROR_KEY) || '[]');
            logs.push(entry);
            if (logs.length > MAX_ERRORS) logs = logs.slice(-MAX_ERRORS);
            localStorage.setItem(ERROR_KEY, JSON.stringify(logs));
        } catch (e) { /* localStorage 용량 초과 시 무시 */ }
    }

    window.onerror = function(msg, src, line, col) {
        logError({ t: Date.now(), m: msg, s: src, l: line, c: col });
    };

    window.onunhandledrejection = function(e) {
        logError({ t: Date.now(), m: 'Promise: ' + (e.reason && e.reason.message || e.reason) });
    };
})();

// 공통 상수
const KG_TO_LB = 2.20462;
const LB_TO_KG = 0.453592;
let currentUnit = 'kg';

// 단위 변환 함수
function convertWeight(weight, fromUnit, toUnit) {
    if (fromUnit === toUnit) return weight;
    return fromUnit === 'kg'
        ? (weight * KG_TO_LB).toFixed(2)
        : (weight * LB_TO_KG).toFixed(2);
}

/**
 * 모든 단위 표시 요소 업데이트
 */
function updateUnitDisplay() {
    document.querySelectorAll('.unit-display').forEach(span => {
        // weightlifting.js에서는 소문자, 1rm.js에서는 그대로 사용
        // 페이지별로 다르게 처리
        if (window.location.pathname.includes('weightlifting.html')) {
            span.textContent = currentUnit.toLowerCase();
        } else {
            span.textContent = currentUnit;
        }
    });
}

// 토스트 메시지 표시 함수
function showToast(message) {
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = message;
    document.getElementById('toast-container').appendChild(toast);

    setTimeout(function() {
        toast.classList.add('show');
        setTimeout(function() {
            toast.classList.remove('show');
            setTimeout(function() { toast.remove(); }, 300);
        }, 2000);
    }, 100);
}

// 백분율 계산 함수
function calculatePercentage(value, total) {
    return ((value / total) * 100).toFixed(1);
}

// 공유 모달 관련 함수
function showShareModal() {
    var modal = document.getElementById('share-modal');
    if (modal) modal.style.display = 'block';
}

function hideShareModal() {
    var modal = document.getElementById('share-modal');
    if (modal) modal.style.display = 'none';
}

// Web Share API 헬퍼
// url: 생략하면 현재 페이지, false면 URL 제외
function shareContent(title, text, url) {
    var includeUrl = url !== false;
    if (includeUrl && !url) url = window.location.href;

    if (navigator.share) {
        var shareData = { title: title, text: text };
        if (includeUrl) shareData.url = url;
        navigator.share(shareData).catch(function () {});
    } else {
        var copyText = includeUrl ? text + '\n' + url : text;
        navigator.clipboard.writeText(copyText).then(function () {
            showToast('클립보드에 복사되었습니다');
        }).catch(function () {
            showToast('복사에 실패했습니다.');
        });
    }
}

// placeholder 업데이트 함수
function updatePlaceholders() {
    if (window.location.pathname.includes('convert')) return;
    document.querySelectorAll('.weight-input').forEach(function(el) {
        el.placeholder = '무게(' + currentUnit.toLowerCase() + ')';
    });
}

// 공통 이벤트 핸들러
document.addEventListener('DOMContentLoaded', function() {
    updatePlaceholders();

    document.querySelectorAll('.unit-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            if (window.location.pathname.includes('convert')) return;
            if (this.classList.contains('active')) return;

            var newUnit = this.dataset.unit;
            var oldUnit = currentUnit;

            document.querySelectorAll('.unit-btn').forEach(function(b) {
                b.classList.remove('active');
            });
            this.classList.add('active');

            document.querySelectorAll('.weight-input').forEach(function(input) {
                var weight = input.value;
                if (weight) {
                    input.value = convertWeight(weight, oldUnit, newUnit);
                }
            });

            currentUnit = newUnit;
            updatePlaceholders();
            updateUnitDisplay();

            if (typeof updateResults === 'function') updateResults();
            if (typeof calculateAll === 'function') calculateAll();
        });
    });

    window.addEventListener('click', function(event) {
        var shareModal = document.getElementById('share-modal');
        if (shareModal && event.target === shareModal) {
            hideShareModal();
        }
    });

    var printBtn = document.getElementById('print-btn');
    if (printBtn) {
        printBtn.addEventListener('click', function() {
            window.print();
            hideShareModal();
        });
    }

    initSidebarNavigation();
    initSkipLink();
});

// Skip-to-content 링크 초기화
function initSkipLink() {
    // 메인 콘텐츠 영역에 id 부여
    const main = document.querySelector('main');
    if (main && !main.id) {
        main.id = 'main-content';
    }

    const targetId = main ? 'main-content' : 'content';

    // skip link 삽입
    const skipLink = document.createElement('a');
    skipLink.href = '#' + targetId;
    skipLink.className = 'skip-link';
    skipLink.textContent = '본문으로 건너뛰기';
    document.body.insertBefore(skipLink, document.body.firstChild);
}

// 사이드바 네비게이션 초기화
function initSidebarNavigation() {
    // HTML에 사이드바 구조 추가
    const sidebarHTML = `
        <div class="sidebar-overlay" id="sidebarOverlay"></div>
        <nav class="sidebar-nav" id="sidebarNav" aria-label="모바일 메뉴" aria-hidden="true">
            <div class="sidebar-header">
                <span class="sidebar-title">21-15-9</span>
                <button class="sidebar-close" id="sidebarClose" aria-label="메뉴 닫기">✕</button>
            </div>
            <div class="sidebar-content">
                <div class="nav-group">
                    <div class="nav-group-title">CrossFit</div>
                    <a href="/crossfit-wod/" class="sidebar-nav-item">CrossFit Open</a>
                    <a href="/hero-wod/" class="sidebar-nav-item">Hero & Tribute Workouts</a>
                    <a href="/the-girls/" class="sidebar-nav-item">The Girls</a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">WOD</div>
                    <a href="/search-wod/" class="sidebar-nav-item">Search WOD</a>
                    <a href="/random-wod/" class="sidebar-nav-item">Random WOD <span class="sidebar-highlight-badge">N</span></a>
                    <a href="/timer/" class="sidebar-nav-item">Timer</a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Calculator</div>
                    <a href="/nsca/" class="sidebar-nav-item">NSCA 1RM</a>
                    <a href="/convert/" class="sidebar-nav-item">LB / KG Converter</a>
                    <a href="/plates/" class="sidebar-nav-item">Plate Calculator</a>
                    <a href="/erg/" class="sidebar-nav-item">Erg Calculator</a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Weightlifting</div>
                    <a href="/weightlifting/" class="sidebar-nav-item">Lift Correlation</a>
                    <a href="/weightlifting-record/" class="sidebar-nav-item">Weightlifting Record</a>
                </div>
                <nav class="sidebar-secondary" aria-label="Secondary">
                    <ul>
                        <li><a href="https://khjzzm.github.io/" target="_blank" rel="noopener" class="sidebar-ext-link">Blog</a></li>
                        <li class="sidebar-sep" aria-hidden="true">|</li>
                        <li><a href="https://github.com/khjzzm" target="_blank" rel="noopener" class="sidebar-ext-link">GitHub</a></li>
                        <li class="sidebar-sep" aria-hidden="true">|</li>
                        <li><a href="mailto:khjzzm@gmail.com" class="sidebar-ext-link">Mail</a></li>
                    </ul>
                </nav>
            </div>
        </nav>
    `;

    // 페이지에 사이드바 추가
    document.body.insertAdjacentHTML('beforeend', sidebarHTML);

    // 헤더에 햄버거 버튼 및 모바일 제목 추가
    const headerContent = document.querySelector('.header-content');
    if (headerContent) {
        // 모바일 헤더 제목 - 21-15-9 (홈 링크)
        const headerTitle = document.createElement('a');
        headerTitle.className = 'header-title';
        headerTitle.textContent = '21-15-9';
        headerTitle.href = '/';
        headerContent.insertBefore(headerTitle, headerContent.firstChild);

        // 햄버거 버튼 (오른쪽, margin-left:auto)
        const hamburgerButton = document.createElement('button');
        hamburgerButton.className = 'hamburger-menu';
        hamburgerButton.id = 'hamburgerMenu';
        hamburgerButton.innerHTML = '☰';
        hamburgerButton.setAttribute('aria-label', '메뉴 열기');
        hamburgerButton.setAttribute('aria-expanded', 'false');
        hamburgerButton.setAttribute('aria-controls', 'sidebarNav');
        headerContent.appendChild(hamburgerButton);
    }

    // 현재 페이지에 맞는 active 상태 설정
    setActiveSidebarItem();

    // 이벤트 리스너 등록
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebarNav = document.getElementById('sidebarNav');

    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', toggleSidebar);
    }

    if (sidebarClose) {
        sidebarClose.addEventListener('click', closeSidebar);
    }

    // ESC 키로 사이드바 닫기 + 포커스 트랩
    document.addEventListener('keydown', function(e) {
        if (!sidebarNav || !sidebarNav.classList.contains('open')) return;

        if (e.key === 'Escape') {
            closeSidebar();
            return;
        }

        // 포커스 트랩: Tab 키를 사이드바 내부로 제한
        if (e.key === 'Tab') {
            const focusable = sidebarNav.querySelectorAll('a[href], button, input, [tabindex]:not([tabindex="-1"])');
            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }
    });
}

// 사이드바 토글
function toggleSidebar() {
    const sidebarNav = document.getElementById('sidebarNav');
    const hamburger = document.getElementById('hamburgerMenu');
    if (sidebarNav) {
        const isOpen = sidebarNav.classList.toggle('open');
        document.body.style.overflow = isOpen ? 'hidden' : '';
        sidebarNav.setAttribute('aria-hidden', !isOpen);
        if (hamburger) {
            hamburger.innerHTML = isOpen ? '✕' : '☰';
            hamburger.setAttribute('aria-expanded', isOpen);
            hamburger.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
        }
        // 열릴 때 첫 번째 링크에 포커스
        if (isOpen) {
            const firstLink = sidebarNav.querySelector('.sidebar-nav-item');
            if (firstLink) firstLink.focus();
        }
    }
}

// 사이드바 닫기
function closeSidebar() {
    const sidebarNav = document.getElementById('sidebarNav');
    const hamburger = document.getElementById('hamburgerMenu');
    if (sidebarNav) {
        sidebarNav.classList.remove('open');
        sidebarNav.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (hamburger) {
            hamburger.innerHTML = '☰';
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.setAttribute('aria-label', '메뉴 열기');
            hamburger.focus();
        }
    }
}

// 현재 페이지에 맞는 사이드바 active 상태 설정
function setActiveSidebarItem() {
    const currentPath = window.location.pathname;
    const sidebarItems = document.querySelectorAll('.sidebar-nav-item');

    sidebarItems.forEach(item => {
        const href = item.getAttribute('href');
        let isActive = false;

        // 정확한 경로 매칭
        if (currentPath === '/' || currentPath === '/index.html') {
            isActive = (href === '/');
        } else {
            // 경로 정규화 (끝의 슬래시 제거, index.html 제거)
            const normalizedCurrent = currentPath.replace(/\/$/, '').replace('/index.html', '');
            const normalizedHref = href.replace(/\/$/, '');

            isActive = normalizedCurrent === normalizedHref;
        }

        if (isActive) {
            item.classList.add('active');
            item.setAttribute('aria-current', 'page');
        } else {
            item.classList.remove('active');
            item.removeAttribute('aria-current');
        }
    });
}
