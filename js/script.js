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
    const toast = $('<div class="toast"></div>').text(message);
    $('#toast-container').append(toast);

    setTimeout(() => {
        toast.addClass('show');
        setTimeout(() => {
            toast.removeClass('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }, 100);
}

// 백분율 계산 함수
function calculatePercentage(value, total) {
    return ((value / total) * 100).toFixed(1);
}

// 공유 모달 관련 함수
function showShareModal() {
    $('#share-modal').css('display', 'block');
}

function hideShareModal() {
    $('#share-modal').css('display', 'none');
}

// placeholder 업데이트 함수
function updatePlaceholders() {
    // convert 페이지에서는 실행하지 않음
    if (window.location.pathname.includes('convert')) {
        return;
    }

    $('.weight-input').each(function() {
        $(this).attr('placeholder', `무게(${currentUnit.toLowerCase()})`);
    });
}

// 공통 이벤트 핸들러
$(document).ready(function() {
    // 초기 placeholder 설정
    updatePlaceholders();

    // 단위 버튼 클릭 이벤트
    $('.unit-btn').click(function() {
        // convert 페이지에서는 실행하지 않음
        if (window.location.pathname.includes('convert')) {
            return;
        }

        if ($(this).hasClass('active')) return;

        const newUnit = $(this).data('unit');
        const oldUnit = currentUnit;

        $('.unit-btn').removeClass('active');
        $(this).addClass('active');

        // 입력 필드 단위 변환
        $('.weight-input').each(function() {
            const weight = $(this).val();
            if (weight) {
                $(this).val(convertWeight(weight, oldUnit, newUnit));
            }
        });

        currentUnit = newUnit;
        updatePlaceholders();
        updateUnitDisplay();

        // 페이지별 추가 업데이트 함수 호출
        if (typeof updateResults === 'function') {
            updateResults();
        }
        if (typeof calculateAll === 'function') {
            calculateAll();
        }
    });

    // 모달 닫기
    $(window).click(function(event) {
        if (event.target == $('#share-modal')[0]) {
            hideShareModal();
        }
    });

    // 프린트 버튼
    $('#print-btn').click(function() {
        window.print();
        hideShareModal();
    });

    // 햄버거 메뉴 및 사이드바 기능
    initSidebarNavigation();
});

// 사이드바 네비게이션 초기화
function initSidebarNavigation() {
    // HTML에 사이드바 구조 추가
    const sidebarHTML = `
        <div class="sidebar-overlay" id="sidebarOverlay"></div>
        <nav class="sidebar-nav" id="sidebarNav">
            <div class="sidebar-header">
                <span class="sidebar-title">21-15-9</span>
                <button class="sidebar-close" id="sidebarClose">✕</button>
            </div>
            <div class="sidebar-content">
                <div class="nav-group">
                    <div class="nav-group-title">Strength</div>
                    <a href="/weightlifting/" class="sidebar-nav-item">웨이트리프팅 동작 상관관계</a>
                    <a href="/nsca/" class="sidebar-nav-item">NSCA 기반 1RM 최대중량</a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Convert</div>
                    <a href="/convert/" class="sidebar-nav-item">LB / KG Converter</a>
                    <a href="/plates/" class="sidebar-nav-item">Plate Calculator</a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Archive</div>
                    <a href="/crossfit-wod/" class="sidebar-nav-item">CrossFit Open</a>
                    <a href="/hero-wod/" class="sidebar-nav-item">Hero & Tribute Workouts</a>
                    <a href="/weightlifting-record/" class="sidebar-nav-item">Weightlifting Record</a>
                </div>
                <div class="nav-group">
                    <div class="nav-group-title">Tools</div>
                    <a href="/timer/" class="sidebar-nav-item">Timer</a>
                    <a href="/random-wod/" class="sidebar-nav-item">Random WOD</a>
                </div>
                <nav class="sidebar-secondary" aria-label="Secondary">
                    <ul>
                        <li><span class="sidebar-dot"></span><a href="https://khjzzm.github.io/" target="_blank" rel="noopener">Blog</a></li>
                        <li><span class="sidebar-dot"></span><a href="https://github.com/khjzzm" target="_blank" rel="noopener">GitHub</a></li>
                        <li><span class="sidebar-dot"></span><a href="mailto:khjzzm@gmail.com">Mail</a></li>
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

    // ESC 키로 사이드바 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebarNav && sidebarNav.classList.contains('open')) {
            closeSidebar();
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
        if (hamburger) {
            hamburger.innerHTML = isOpen ? '✕' : '☰';
        }
    }
}

// 사이드바 닫기
function closeSidebar() {
    const sidebarNav = document.getElementById('sidebarNav');
    const hamburger = document.getElementById('hamburgerMenu');
    if (sidebarNav) {
        sidebarNav.classList.remove('open');
        document.body.style.overflow = '';
        if (hamburger) {
            hamburger.innerHTML = '☰';
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
        } else {
            item.classList.remove('active');
        }
    });
}
