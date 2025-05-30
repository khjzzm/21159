$(document).ready(function() {
    // 상태 관리
    let state = {
        barbellWeight: 0, // 초기값 0으로 변경
        barbellWeightKg: 0, // 초기값 0으로 변경
        leftPlates: [], // [{weight: 45, kg: 20, color: 'blue'}, ...]
        rightPlates: [],
        collarAdded: false // 조임쇠 추가 여부
    };

    // 바벨 선택 이벤트
    $('.barbell-btn').click(function() {
        // 조임쇠가 추가된 상태에서는 바벨 변경 불가
        if (state.collarAdded) {
            showToast('조임쇠를 빼고 다시 시도하세요.');
            return;
        }
        $('.barbell-btn').removeClass('active');
        $(this).addClass('active');
        
        state.barbellWeight = Number($(this).data('weight'));
        state.barbellWeightKg = Number($(this).data('kg'));
        
        // 바벨 이미지 클래스 변경
        const isMale = state.barbellWeight === 45;
        $('.barbell-image')
            .removeClass('male female')
            .addClass(isMale ? 'male' : 'female');
        
        updateDisplay();
    });

    // 단위 선택 이벤트 추가
    $('.unit-btn').click(function() {
        $('.unit-btn').removeClass('active');
        $(this).addClass('active');
        
        const unit = $(this).data('unit');
        if (unit === 'kg') {
            $('.kg-plates').show();
            $('.lb-plates').hide();
        } else {
            $('.kg-plates').hide();
            $('.lb-plates').show();
        }
    });


    // 플레이트 추가 이벤트 수정
    $('.plate-btn').click(function() {
        // 바벨이 선택되지 않은 경우
        if (state.barbellWeight === 0 || state.barbellWeightKg === 0) {
            showToast('먼저 바벨을 선택하세요.');
            return;
        }

        const isCollar = $(this).data('collar');
        if (state.collarAdded && !isCollar) {
            showToast('조임쇠가 추가된 상태에서는 다른 플레이트를 추가할 수 없습니다.');
            return;
        }
        if (isCollar && state.collarAdded) {
            showToast('조임쇠는 한 번만 추가할 수 있습니다.');
            return;
        }

        const kg = $(this).data('kg');
        const lb = $(this).data('lb');
        let color = '';
        if (isCollar) {
            color = 'collar-plate';
        } else if (kg) {
            const classes = $(this).attr('class').split(' ');
            color = classes.filter(c => c !== 'plate-btn' && c !== 'active' && c !== 'plate').join(' ');
            if (!color) color = 'red';
        } else {
            color = `black-${lb}`;
        }
        const weight = kg || lb;
        const isKg = !!kg;
        const plateData = {
            weight: weight,
            kg: isKg ? weight : weight * 0.453592,
            isKg: isKg,
            color: color,
            isCollar: !!isCollar
        };
        state.leftPlates.unshift(plateData);
        state.rightPlates.unshift(plateData);

        if (isCollar) {
            state.collarAdded = true;
            // 버튼 비활성화 코드를 제거하세요!
            // $('.plate-btn').not('.collar-btn').prop('disabled', true);
            // $('.collar-btn').prop('disabled', true);
        }
        updateDisplay();
    });

    // 플레이트 제거 이벤트
    $(document).on('click', '.plate', function() {
        const side = $(this).parent().hasClass('left') ? 'left' : 'right';
        const index = $(this).index();

        // 조임쇠 제거 시 상태 복구
        const plateArr = side === 'left' ? state.leftPlates : state.rightPlates;
        if (plateArr[index] && plateArr[index].isCollar) {
            state.collarAdded = false;
            $('.plate-btn').prop('disabled', false);
        }

        if (side === 'left') {
            state.leftPlates.splice(index, 1);
            state.rightPlates.splice(index, 1);
        } else {
            state.rightPlates.splice(index, 1);
            state.leftPlates.splice(index, 1);
        }
        updateDisplay();
    });

    // 화면 업데이트 함수 수정
    function updateDisplay() {
        // 총 무게 계산
        const totalWeight = calculateTotalWeight();
        const totalWeightKg = calculateTotalWeightKg();
        
        // 무게 표시 업데이트
        $('.weight-lb').text(`${totalWeight} lb`);
        $('.weight-kg').text(`${totalWeightKg} kg`);
        
        // 조임쇠(2.5kg, red-small) 플레이트 데이터
        const collarPlate = {
            weight: 2.5,
            kg: 2.5,
            isKg: true,
            color: 'red-small'
        };

        // 왼쪽 플레이트 업데이트
        const leftStack = $('.plates-side.left');
        leftStack.empty();
        state.leftPlates.forEach(plate => {
            const plateElement = $('<div>')
                .addClass(`plate ${plate.color}`)
                .attr('data-weight', plate.isKg ? `${plate.weight}kg` : `${plate.weight}lb`);
            leftStack.append(plateElement);
        });
        
        // 오른쪽 플레이트 업데이트
        const rightStack = $('.plates-side.right');
        rightStack.empty();
        [...state.rightPlates].reverse().forEach(plate => {
            const plateElement = $('<div>')
                .addClass(`plate ${plate.color}`)
                .attr('data-weight', plate.isKg ? `${plate.weight}kg` : `${plate.weight}lb`);
            rightStack.append(plateElement);
        });
    }

    // 총 무게 계산 (kg 기준)
    function calculateTotalWeightKg() {
        // 바벨 + 플레이트 모두 kg로 합산
        const platesWeightKg = state.leftPlates.reduce((sum, plate) => {
            return sum + plate.kg;
        }, 0) * 2;
        return Math.round((state.barbellWeightKg + platesWeightKg) * 10) / 10;
    }

    // 총 무게 계산 (lb 변환)
    function calculateTotalWeight() {
        // kg로 합산한 뒤 lb로 변환
        const totalKg = calculateTotalWeightKg();
        const totalLb = totalKg * 2.20462;
        return Math.round(totalLb * 10) / 10;
    }

    // HTML 초기화 시 바벨 구조 생성
    $('.barbell-image').html(`
        <div class="collar left"></div>
        <div class="collar right"></div>
    `);

    // 초기 화면 업데이트
    updateDisplay();

    // 초기화 버튼 이벤트
    $('#reset-btn').click(function() {
        // 상태 초기화
        state.barbellWeight = 0;
        state.barbellWeightKg = 0;
        state.leftPlates = [];
        state.rightPlates = [];
        state.collarAdded = false; // 조임쇠 상태도 초기화
        $('.barbell-btn').removeClass('active');
        $('.barbell-image').removeClass('male female');
        updateDisplay();
    });

    // 바벨 이미지의 조임쇠 클릭 시 조임쇠 해제
    $(document).on('click', '.barbell-image .collar', function() {
        // 조임쇠가 추가된 상태일 때만 동작
        if (state.collarAdded) {
            // 조임쇠 플레이트(양쪽) 제거
            // left/rightPlates에서 isCollar인 플레이트만 제거
            state.leftPlates = state.leftPlates.filter(plate => !plate.isCollar);
            state.rightPlates = state.rightPlates.filter(plate => !plate.isCollar);
            state.collarAdded = false;
            $('.plate-btn').prop('disabled', false); // 혹시 모를 disabled 해제
            updateDisplay();
            showToast('조임쇠가 해제되었습니다.');
        }
    });

    // 플레이트 더블탭 확대 방지 (모바일)
    $('.plate-btn').on('touchstart', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    });
}); 