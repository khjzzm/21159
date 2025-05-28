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
        
        // 페이지별 추가 업데이트 함수 호출
        if (typeof updateResults === 'function') {
            updateResults();
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