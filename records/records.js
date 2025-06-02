// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // 초기화
    initializeToggle();
    applyLiftTypeColors();
    initializeTableInteractions();
    
    // 캐시 버스터 업데이트
    updateCacheBuster();
});

// 남녀 토글 기능
function initializeToggle() {
    const menBtn = document.getElementById('men-btn');
    const womenBtn = document.getElementById('women-btn');
    const menRecords = document.getElementById('men-records');
    const womenRecords = document.getElementById('women-records');

    menBtn.addEventListener('click', () => {
        menBtn.classList.add('active');
        womenBtn.classList.remove('active');
        menRecords.classList.add('active');
        womenRecords.classList.remove('active');
    });

    womenBtn.addEventListener('click', () => {
        womenBtn.classList.add('active');
        menBtn.classList.remove('active');
        womenRecords.classList.add('active');
        menRecords.classList.remove('active');
    });
}

// 부문별 색상 적용
function applyLiftTypeColors() {
    const liftTypes = document.querySelectorAll('.lift-type');
    
    liftTypes.forEach(cell => {
        const row = cell.parentElement;
        const text = cell.textContent.trim();
        
        // 행 배경색 적용
        if (text === '인상') {
            row.classList.add('snatch-row');
            cell.style.color = '#d97706';
        } else if (text === '용상') {
            row.classList.add('clean-jerk-row');
            cell.style.color = '#0369a1';
        } else if (text === '합계') {
            row.classList.add('total-row');
            cell.style.color = '#059669';
        }
    });
}

// 테이블 상호작용 초기화
function initializeTableInteractions() {
    const tableRows = document.querySelectorAll('.records-table tbody tr');
    
    tableRows.forEach(row => {
        row.addEventListener('click', function() {
            const weightClass = this.querySelector('.weight-class')?.textContent || 
                               this.closest('tbody').querySelector('.weight-class').textContent;
            const liftType = this.querySelector('.lift-type')?.textContent;
            const record = this.querySelector('.snatch, .clean-jerk, .total')?.textContent;
            const athlete = this.querySelector('.athlete')?.textContent;
            const country = this.querySelector('.country')?.textContent;
            const competition = this.querySelector('.competition')?.textContent;
            const date = this.querySelector('.date')?.textContent;
            
            if (liftType && record && athlete) {
                showToast(`
                    <strong>${weightClass} ${liftType}</strong><br>
                    ${record} - ${athlete} (${country})<br>
                    ${competition} | ${date}
                `);
            }
        });
    });
}

// 토스트 메시지 표시
function showToast(message) {
    // 기존 토스트 제거
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) {
        existingToast.remove();
    }

    // 새 토스트 생성
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = message;
    
    // 토스트 스타일
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 1000;
        opacity: 0;
        transition: all 0.3s ease;
        max-width: 90vw;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(toast);
    
    // 애니메이션
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(-10px)';
    }, 10);
    
    // 자동 제거
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 3000);
}

// 검색 기능 (향후 확장용)
function searchRecords(query) {
    const rows = document.querySelectorAll('.records-table tbody tr');
    const searchTerm = query.toLowerCase();
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm) || searchTerm === '') {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// 캐시 버스터 업데이트
function updateCacheBuster() {
    const timestamp = Date.now();
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    const scripts = document.querySelectorAll('script[src]');
    
    links.forEach(link => {
        if (link.href.includes('?v=')) {
            link.href = link.href.replace(/\?v=\d+/, `?v=${timestamp}`);
        }
    });
    
    scripts.forEach(script => {
        if (script.src.includes('?v=')) {
            script.src = script.src.replace(/\?v=\d+/, `?v=${timestamp}`);
        }
    });
}

// 다크모드 토글 (공통 스크립트와 연동)
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
}

// 다크모드 초기화
function initializeDarkMode() {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
        document.body.classList.add('dark-mode');
    }
}

// 페이지 로드 시 다크모드 초기화
initializeDarkMode(); 