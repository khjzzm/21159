// 공통 상수
const KG_TO_LB = 2.20462;
const LB_TO_KG = 0.453592;
let currentUnit = 'kg';

// 다크모드 관련 함수
function initTheme() {
    // 저장된 테마 불러오기 또는 시스템 설정 확인
    const savedTheme = localStorage.getItem('theme');
    const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    } else if (systemDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeIcon('dark');
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    
    // 테마 변경 애니메이션 효과
    document.body.style.transition = 'all 0.3s ease';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 300);
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

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

// PWA에서 사용할 수 있도록 백업
window.originalShowToast = showToast;

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
    // 다크모드 초기화
    initTheme();
    
    // 다크모드 토글 버튼 이벤트
    $('#theme-toggle').click(function() {
        toggleTheme();
    });
    
    // 시스템 다크모드 변경 감지
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            updateThemeIcon(newTheme);
        }
    });
    
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
}); 