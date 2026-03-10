document.addEventListener('DOMContentLoaded', function() {
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

    document.getElementById('kg-input').addEventListener('input', function() {
        if (isUpdating) return;

        const kgValue = parseFloat(this.value);
        if (!isNaN(kgValue) && kgValue >= 0) {
            isUpdating = true;
            const lbValue = formatWeight(kgToLb(kgValue), 1);
            document.getElementById('lb-input').value = lbValue;
            isUpdating = false;
        } else if (this.value === '') {
            document.getElementById('lb-input').value = '';
        }
    });

    document.getElementById('lb-input').addEventListener('input', function() {
        if (isUpdating) return;

        const lbValue = parseFloat(this.value);
        if (!isNaN(lbValue) && lbValue >= 0) {
            isUpdating = true;
            const kgValue = formatWeight(lbToKg(lbValue), 1);
            document.getElementById('kg-input').value = kgValue;
            isUpdating = false;
        } else if (this.value === '') {
            document.getElementById('kg-input').value = '';
        }
    });

    // 변환표 생성 함수 (파운드 기준)
    function generateTableByLb(startLb, endLb, step = 5) {
        const tbody = document.getElementById('table-body');
        tbody.innerHTML = '';

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
            const row = document.createElement('tr');

            for (let j = 0; j < itemsPerRow; j++) {
                const index = i + j;
                if (index < weights.length) {
                    const weight = weights[index];
                    row.insertAdjacentHTML('beforeend', `<td class="lb-cell">${weight.lb}</td>`);
                    row.insertAdjacentHTML('beforeend', `<td class="kg-cell">${weight.kg}</td>`);
                } else {
                    row.insertAdjacentHTML('beforeend', '<td></td><td></td>');
                }
            }

            tbody.appendChild(row);
        }
    }

    // 테이블 토글 버튼 이벤트
    document.querySelectorAll('.table-toggle').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.table-toggle').forEach(function(el) {
                el.classList.remove('active');
            });
            this.classList.add('active');

            const range = this.dataset.range;

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
    });

    // 초기 테이블 생성 (일반 WOD)
    generateTableByLb(5, 220, 5);

    // 공통 변환값 클릭 이벤트
    document.querySelectorAll('.common-item').forEach(function(item) {
        item.addEventListener('click', function() {
            const kgText = this.querySelector('.common-kg').textContent;
            const lbText = this.querySelector('.common-lb').textContent;

            // kg 값 추출 (숫자만)
            const kgMatch = kgText.match(/(\d+(?:\.\d+)?)/);
            const lbMatch = lbText.match(/(\d+(?:\.\d+)?)/);

            if (kgMatch) {
                const kgInput = document.getElementById('kg-input');
                kgInput.value = kgMatch[1];
                kgInput.dispatchEvent(new Event('input'));
            } else if (lbMatch) {
                const lbInput = document.getElementById('lb-input');
                lbInput.value = lbMatch[1];
                lbInput.dispatchEvent(new Event('input'));
            }
        });
    });

    // 테이블 셀 클릭 이벤트
    document.addEventListener('click', function(e) {
        if (e.target.matches('.kg-cell')) {
            const kgValue = e.target.textContent;
            const kgInput = document.getElementById('kg-input');
            kgInput.value = kgValue;
            kgInput.dispatchEvent(new Event('input'));
        }
    });

    document.addEventListener('click', function(e) {
        if (e.target.matches('.lb-cell')) {
            const lbValue = e.target.textContent;
            const lbInput = document.getElementById('lb-input');
            lbInput.value = lbValue;
            lbInput.dispatchEvent(new Event('input'));
        }
    });

    // 모바일 input 더블탭 확대 방지
    document.querySelectorAll("input[type='number']").forEach(function(input) {
        input.addEventListener('touchstart', function(e) {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        });
    });
});
