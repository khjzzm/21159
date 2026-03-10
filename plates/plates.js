document.addEventListener('DOMContentLoaded', function() {
    // 상태 관리
    let state = {
        barbellWeight: 0, // 초기값 0으로 변경
        barbellWeightKg: 0, // 초기값 0으로 변경
        leftPlates: [], // [{weight: 45, kg: 20, color: 'blue'}, ...]
        rightPlates: [],
        collarAdded: false // 조임쇠 추가 여부
    };

    // 바벨 선택 이벤트
    document.querySelectorAll('.barbell-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            // 조임쇠가 추가된 상태에서는 바벨 변경 불가
            if (state.collarAdded) {
                showToast('조임쇠를 빼고 다시 시도하세요.');
                return;
            }
            document.querySelectorAll('.barbell-btn').forEach(function(b) {
                b.classList.remove('active');
            });
            this.classList.add('active');

            state.barbellWeight = Number(this.dataset.weight);
            state.barbellWeightKg = Number(this.dataset.kg);

            // 바벨 이미지 클래스 변경 - 45lb와 20kg는 male, 35lb와 15kg는 female
            const weightLb = state.barbellWeight;
            const isMale = (weightLb >= 44); // 44lb 이상이면 male (45lb, 44.09lb)
            var barbellImage = document.querySelector('.barbell-image');
            barbellImage.classList.remove('male', 'female');
            barbellImage.classList.add(isMale ? 'male' : 'female');

            updateDisplay();
        });
    });

    // KG/LB 토글
    document.querySelectorAll('.plate-toggle-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.plate-toggle-btn').forEach(function(b) {
                b.classList.remove('active');
            });
            this.classList.add('active');
            const unit = this.dataset.unit;
            if (unit === 'kg') {
                document.querySelectorAll('.kg-plates').forEach(function(el) { el.style.display = ''; });
                document.querySelectorAll('.lb-plates').forEach(function(el) { el.style.display = 'none'; });
            } else {
                document.querySelectorAll('.kg-plates').forEach(function(el) { el.style.display = 'none'; });
                document.querySelectorAll('.lb-plates').forEach(function(el) { el.style.display = ''; });
            }
        });
    });


    // 플레이트 추가 이벤트 수정
    document.querySelectorAll('.plate-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            // 바벨이 선택되지 않은 경우
            if (state.barbellWeight === 0 || state.barbellWeightKg === 0) {
                showToast('먼저 바벨을 선택하세요.');
                return;
            }

            const isCollar = this.dataset.collar;
            if (state.collarAdded && !isCollar) {
                showToast('조임쇠가 추가된 상태에서는 다른 플레이트를 추가할 수 없습니다.');
                return;
            }
            if (isCollar && state.collarAdded) {
                showToast('조임쇠는 한 번만 추가할 수 있습니다.');
                return;
            }

            const kg = this.dataset.kg ? parseFloat(this.dataset.kg) : 0;
            const lb = this.dataset.lb ? parseFloat(this.dataset.lb) : 0;
            let color = '';
            if (isCollar) {
                color = 'collar-plate';
            } else if (kg) {
                const classes = this.getAttribute('class').split(' ');
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
                // document.querySelectorAll('.plate-btn:not(.collar-btn)').forEach(function(el) { el.disabled = true; });
                // document.querySelectorAll('.collar-btn').forEach(function(el) { el.disabled = true; });
            }
            updateDisplay();
        });
    });

    // 플레이트 제거 이벤트
    document.addEventListener('click', function(e) {
        var plate = e.target.closest('.plate');
        if (!plate) return;
        var parent = plate.parentElement;
        var side = parent.classList.contains('left') ? 'left' : 'right';
        var index = Array.prototype.indexOf.call(parent.children, plate);

        // 조임쇠 제거 시 상태 복구
        const plateArr = side === 'left' ? state.leftPlates : state.rightPlates;
        if (plateArr[index] && plateArr[index].isCollar) {
            state.collarAdded = false;
            document.querySelectorAll('.plate-btn').forEach(function(el) { el.disabled = false; });
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
        document.querySelectorAll('.weight-lb').forEach(function(el) { el.textContent = `${totalWeight} lb`; });
        document.querySelectorAll('.weight-kg').forEach(function(el) { el.textContent = `${totalWeightKg} kg`; });

        // 조임쇠(2.5kg, red-small) 플레이트 데이터
        const collarPlate = {
            weight: 2.5,
            kg: 2.5,
            isKg: true,
            color: 'red-small'
        };

        // 왼쪽 플레이트 업데이트
        var leftStack = document.querySelector('.plates-side.left');
        leftStack.innerHTML = '';
        state.leftPlates.forEach(plate => {
            var plateElement = document.createElement('div');
            plateElement.className = `plate ${plate.color}`;
            plateElement.setAttribute('data-weight', plate.isKg ? `${plate.weight}kg` : `${plate.weight}lb`);
            leftStack.appendChild(plateElement);
        });

        // 오른쪽 플레이트 업데이트
        var rightStack = document.querySelector('.plates-side.right');
        rightStack.innerHTML = '';
        [...state.rightPlates].reverse().forEach(plate => {
            var plateElement = document.createElement('div');
            plateElement.className = `plate ${plate.color}`;
            plateElement.setAttribute('data-weight', plate.isKg ? `${plate.weight}kg` : `${plate.weight}lb`);
            rightStack.appendChild(plateElement);
        });
    }

    // 총 무게 계산 (kg 기준)
    function calculateTotalWeightKg() {
        // 바벨 + 플레이트 모두 kg로 합산
        const platesWeightKg = state.leftPlates.reduce((sum, plate) => {
            return sum + plate.kg;
        }, 0) * 2;
        const total = state.barbellWeightKg + platesWeightKg;
        return Math.round(total * 100) / 100; // 소수점 둘째 자리까지 정확히
    }

    // 총 무게 계산 (lb 변환)
    function calculateTotalWeight() {
        // 정확한 kg 값에서 lb로 변환
        const totalKg = calculateTotalWeightKg();

        // 바벨이 lb 기준이면 바벨만 원래 lb 값 사용, 플레이트는 변환
        let totalLb;
        if (state.barbellWeight && (state.barbellWeight === 45 || state.barbellWeight === 35)) {
            // 45lb, 35lb 바벨의 경우 정확한 lb 값 사용
            const platesWeightKg = state.leftPlates.reduce((sum, plate) => {
                return sum + plate.kg;
            }, 0) * 2;
            totalLb = state.barbellWeight + (platesWeightKg * 2.20462262);
        } else {
            // kg 바벨의 경우 전체를 변환
            totalLb = totalKg * 2.20462262;
        }

        return Math.round(totalLb * 10) / 10; // 소수점 첫째 자리까지
    }

    // HTML 초기화 시 바벨 구조 생성
    document.querySelector('.barbell-image').innerHTML = `
        <div class="collar left"></div>
        <div class="collar right"></div>
    `;

    // 초기 화면 업데이트
    updateDisplay();

    // 초기화 버튼 이벤트
    document.getElementById('reset-btn').addEventListener('click', function() {
        // 상태 초기화
        state.barbellWeight = 0;
        state.barbellWeightKg = 0;
        state.leftPlates = [];
        state.rightPlates = [];
        state.collarAdded = false; // 조임쇠 상태도 초기화
        document.querySelectorAll('.barbell-btn').forEach(function(b) { b.classList.remove('active'); });
        var barbellImage = document.querySelector('.barbell-image');
        barbellImage.classList.remove('male', 'female');
        updateDisplay();
    });

    // 바벨 이미지의 조임쇠 클릭 시 조임쇠 해제
    document.addEventListener('click', function(e) {
        var collar = e.target.closest('.barbell-image .collar');
        if (!collar) return;
        // 조임쇠가 추가된 상태일 때만 동작
        if (state.collarAdded) {
            // 조임쇠 플레이트(양쪽) 제거
            // left/rightPlates에서 isCollar인 플레이트만 제거
            state.leftPlates = state.leftPlates.filter(plate => !plate.isCollar);
            state.rightPlates = state.rightPlates.filter(plate => !plate.isCollar);
            state.collarAdded = false;
            document.querySelectorAll('.plate-btn').forEach(function(el) { el.disabled = false; }); // 혹시 모를 disabled 해제
            updateDisplay();
            showToast('조임쇠가 해제되었습니다.');
        }
    });

    // 플레이트 더블탭 확대 방지 (모바일)
    document.querySelectorAll('.plate-btn').forEach(function(btn) {
        btn.addEventListener('touchstart', function(e) {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        });
    });
});