$(document).ready(function() {
    // 변환 상수
    const KG_TO_LB = 2.20462;
    const LB_TO_KG = 1 / KG_TO_LB;

    // 변환 함수들
    function kgToLb(kg) {
        return kg * KG_TO_LB;
    }

    function lbToKg(lb) {
        return lb * LB_TO_KG;
    }

    function formatWeight(weight, decimals = 1) {
        return Number(weight.toFixed(decimals));
    }

    // 실시간 변환기
    let isUpdating = false;

    $('#kg-input').on('input', function() {
        if (isUpdating) return;
        
        const kgValue = parseFloat($(this).val());
        if (!isNaN(kgValue) && kgValue >= 0) {
            isUpdating = true;
            const lbValue = formatWeight(kgToLb(kgValue), 1);
            $('#lb-input').val(lbValue);
            isUpdating = false;
        } else if ($(this).val() === '') {
            $('#lb-input').val('');
        }
    });

    $('#lb-input').on('input', function() {
        if (isUpdating) return;
        
        const lbValue = parseFloat($(this).val());
        if (!isNaN(lbValue) && lbValue >= 0) {
            isUpdating = true;
            const kgValue = formatWeight(lbToKg(lbValue), 1);
            $('#kg-input').val(kgValue);
            isUpdating = false;
        } else if ($(this).val() === '') {
            $('#kg-input').val('');
        }
    });

    // 변환표 생성 함수 (파운드 기준)
    function generateTableByLb(startLb, endLb, step = 5) {
        const tbody = $('#table-body');
        tbody.empty();
        
        const weights = [];
        for (let lb = startLb; lb <= endLb; lb += step) {
            weights.push({
                kg: formatWeight(lbToKg(lb), 1),
                lb: lb
            });
        }

        // 3컬럼으로 나누어 표시
        const itemsPerRow = 3;
        for (let i = 0; i < weights.length; i += itemsPerRow) {
            const row = $('<tr></tr>');
            
            for (let j = 0; j < itemsPerRow; j++) {
                const index = i + j;
                if (index < weights.length) {
                    const weight = weights[index];
                    row.append(`<td class="lb-cell">${weight.lb}</td>`);
                    row.append(`<td class="kg-cell">${weight.kg}</td>`);
                } else {
                    row.append('<td></td><td></td>');
                }
            }
            
            tbody.append(row);
        }
    }

    // 테이블 토글 버튼 이벤트
    $('.table-toggle').on('click', function() {
        $('.table-toggle').removeClass('active');
        $(this).addClass('active');
        
        const range = $(this).data('range');
        
        switch(range) {
            case 'light':
                generateTableByLb(5, 220, 5); // 5-220lb (5lb 단위) - 일반 WOD
                break;
            case 'medium':
                generateTableByLb(225, 350, 5); // 225-350lb (5lb 단위) - RX+ 레벨
                break;
            case 'heavy':
                generateTableByLb(355, 500, 5); // 355-500lb (5lb 단위) - 컴피티션
                break;
        }
    });

    // 초기 테이블 생성 (일반 WOD)
    generateTableByLb(5, 220, 5);

    // 공통 변환값 클릭 이벤트
    $('.common-item').on('click', function() {
        const kgText = $(this).find('.common-kg').text();
        const lbText = $(this).find('.common-lb').text();
        
        // kg 값 추출 (숫자만)
        const kgMatch = kgText.match(/(\d+(?:\.\d+)?)/);
        const lbMatch = lbText.match(/(\d+(?:\.\d+)?)/);
        
        if (kgMatch) {
            $('#kg-input').val(kgMatch[1]).trigger('input');
        } else if (lbMatch) {
            $('#lb-input').val(lbMatch[1]).trigger('input');
        }
    });

    // 테이블 셀 클릭 이벤트
    $(document).on('click', '.kg-cell', function() {
        const kgValue = $(this).text();
        $('#kg-input').val(kgValue).trigger('input');
    });

    $(document).on('click', '.lb-cell', function() {
        const lbValue = $(this).text();
        $('#lb-input').val(lbValue).trigger('input');
    });

    // 모바일 input 더블탭 확대 방지
    $("input[type='number']").on('touchstart', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    });
}); 