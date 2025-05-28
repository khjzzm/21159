// B동작을 키로 하고 A동작들을 값으로 하는 데이터 구조
const bToAMovements = {
    '클린 앤 저크': [
        { 'A동작': '스내치', '퍼센트': '80~85%' }
    ],
    '스내치': [
        { 'A동작': '파워 스내치', '퍼센트': '80~85%' }
    ],
    '클린': [
        { 'A동작': '파워 클린', '퍼센트': '80~90%' }
    ],
    '저크': [
        { 'A동작': '푸시 프레스', '퍼센트': '75~85%' }
    ],
    '백 스쿼트': [
        { 'A동작': '스내치', '퍼센트': '60~65%' },
        { 'A동작': '클린 앤 저크', '퍼센트': '80~85%' },
        { 'A동작': '프론트 스쿼트', '퍼센트': '85~93%' }
    ],
    '프론트 스쿼트': [
        { 'A동작': '클린 앤 저크', '퍼센트': '85~90%' }
    ],
    '데드리프트': [
        { 'A동작': '클린', '퍼센트': '70~75%' }
    ],
    '푸시 프레스': [
        { 'A동작': '프레스', '퍼센트': '70~75%' }
    ]
};

const movementIds = {
    '백 스쿼트': 'back-squat',
    '프론트 스쿼트': 'front-squat',
    '클린': 'clean',
    '클린 앤 저크': 'clean-and-jerk',
    '스내치': 'snatch',
    '데드리프트': 'deadlift',
    '푸시 프레스': 'push-press',
    '저크': 'jerk'
};

// 퍼센트 범위로 무게 계산
function calculateWeight(percent, weight) {
    const [min, max] = percent.replace('%', '').split('~').map(Number);
    const minWeight = (weight * min / 100).toFixed(1);
    const maxWeight = (weight * max / 100).toFixed(1);
    return { minWeight, maxWeight };
}

function updateUnitDisplay() {
    document.querySelectorAll('.unit-display').forEach(span => {
        span.textContent = currentUnit.toLowerCase();
    });
    updateAllConvertedWeights();
}

function updateAllConvertedWeights() {
    document.querySelectorAll('.weight-input').forEach(input => {
        updateConvertedWeight(input);
    });
}

function updateConvertedWeight(input) {
    const weight = parseFloat(input.value);
    const activeUnit = document.querySelector('.unit-btn.active').dataset.unit;
    const convertedDiv = input.parentElement.querySelector('.converted-weight');

    if (weight && weight > 0) {
        const otherUnit = activeUnit === 'kg' ? 'lb' : 'kg';
        const convertedWeight = activeUnit === 'kg' ? 
            convertWeight(weight, 'kg', 'lb') : 
            convertWeight(weight, 'lb', 'kg');
        convertedDiv.textContent = `= ${convertedWeight.toFixed(1)}${otherUnit}`;
    } else {
        convertedDiv.textContent = '';
    }
}

// 결과 업데이트 함수
function updateResults() {
    $('.weight-input').each(function() {
        const id = $(this).attr('id');
        const weight = parseFloat($(this).val()) || 0;
        const resultDiv = $(`#${id}-result`);
        
        if (weight > 0) {
            let calculatedWeight = weight;
            if (currentUnit === 'lb') {
                calculatedWeight = convertWeight(weight, 'lb', 'kg');
            }

            // 동작 이름 찾기
            let movementName = '';
            for (const [key, value] of Object.entries(movementIds)) {
                if (value === id) {
                    movementName = key;
                    break;
                }
            }
            
            if (bToAMovements[movementName]) {
                let resultHtml = '';
                bToAMovements[movementName].forEach(data => {
                    const { minWeight, maxWeight } = calculateWeight(data['퍼센트'], calculatedWeight);
                    const displayMinWeight = currentUnit === 'lb' ? 
                        convertWeight(minWeight, 'kg', 'lb') : 
                        minWeight;
                    const displayMaxWeight = currentUnit === 'lb' ? 
                        convertWeight(maxWeight, 'kg', 'lb') : 
                        maxWeight;
                    
                    resultHtml += `
                        <div>
                            <p><strong>${data['A동작']}</strong></p>
                            <p>상관관계: ${data['퍼센트']}</p>
                            <p>수행 가능 범위: ${displayMinWeight}${currentUnit} ~ ${displayMaxWeight}${currentUnit}</p>
                        </div>
                    `;
                });
                resultDiv.html(resultHtml);
            }
        } else {
            resultDiv.empty();
        }

        // 단위 변환 표시 업데이트
        const convertedWeight = weight ? convertWeight(
            weight, 
            currentUnit, 
            currentUnit === 'kg' ? 'lb' : 'kg'
        ) : '';
        const convertedUnit = currentUnit === 'kg' ? 'LB' : 'KG';
        $(this).closest('.weight-input-group').find('.converted-weight').text(
            convertedWeight ? `= ${convertedWeight} ${convertedUnit}` : ''
        );
    });
}

function updatePlaceholders() {
    document.querySelectorAll('.weight-input').forEach(input => {
        input.placeholder = `무게(${currentUnit.toLowerCase()})`;
    });
}

// 이벤트 핸들러
$(document).ready(function() {
    // 초기 설정
    updatePlaceholders();
    updateUnitDisplay();
    
    // 무게 입력 이벤트
    $('.weight-input').on('input', function() {
        updateResults();
    });

    // 단위 변환 버튼 클릭 이벤트 수정
    $('.unit-btn').click(function() {
        if ($(this).hasClass('active')) return;
        
        const newUnit = $(this).data('unit');
        const oldUnit = currentUnit;
        
        // 버튼 활성화 상태 변경
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
        updateResults();
    });

    // 저장 버튼
    $('.save-btn').click(function() {
        // 기존 저장된 데이터 불러오기
        const existingData = JSON.parse(localStorage.getItem('weightlifting-data') || '{}');
        
        // 새로운 weightlifting 데이터
        const weightData = {
            exercises: {
                unit: currentUnit,
                'clean-and-jerk': $('#clean-and-jerk').val() || '',
                'snatch': $('#snatch').val() || '',
                'clean': $('#clean').val() || '',
                'jerk': $('#jerk').val() || '',
                'back-squat': $('#back-squat').val() || '',
                'front-squat': $('#front-squat').val() || '',
                'deadlift': $('#deadlift').val() || '',
                'push-press': $('#push-press').val() || ''
            },
            // 기존 rmCalculator 데이터 유지
            rmCalculator: existingData.rmCalculator || {
                unit: 'kg',
                exercises: {
                    squat: { reps: '', weight: '' },
                    benchpress: { reps: '', weight: '' },
                    deadlift: { reps: '', weight: '' }
                }
            }
        };

        localStorage.setItem('weightlifting-data', JSON.stringify(weightData));
        showToast('저장되었습니다.');
    });

    // 열기 버튼
    $('.load-btn').click(function() {
        const savedData = localStorage.getItem('weightlifting-data');
        if (!savedData) {
            showToast('저장된 데이터가 없습니다.');
            return;
        }

        const data = JSON.parse(savedData);
        Object.entries(data.exercises).forEach(([key, value]) => {
            if (key !== 'unit' && value) {
                $(`#${key}`).val(value);
            }
        });
        
        updateResults();
        showToast('데이터를 불러왔습니다.');
    });

    // 공유 버튼
    $('.share-btn').click(function() {
        let shareText = '웨이트리프팅 동작 계산 결과\n\n';
        
        // 각 동작별로 결과 수집
        $('.movement-group').each(function() {
            const title = $(this).find('h2').text();
            const weight = $(this).find('.weight-input').val();
            const results = $(this).find('.movement-result div');
            
            if (weight) {
                shareText += `[${title}] ${weight}${currentUnit.toUpperCase()}\n`;
                results.each(function() {
                    const resultText = $(this).text();
                    const lines = resultText.split('\n').map(line => line.trim()).filter(line => line);
                    
                    // 첫 번째 줄은 동작 이름
                    shareText += `${lines[0]}\n`;
                    // 나머지 줄들은 상관관계와 수행 가능 범위
                    for (let i = 1; i < lines.length; i++) {
                        shareText += `${lines[i]}\n`;
                    }
                });
                shareText += '\n';
            }
        });
        
        navigator.clipboard.writeText(shareText).then(() => {
            showToast('클립보드에 복사되었습니다.');
        });
    });

    // 페이지 로드 시 저장된 단위 설정
    const savedData = localStorage.getItem('weightlifting-data');
    if (savedData) {
        const data = JSON.parse(savedData);
        if (data.exercises && data.exercises.unit && data.exercises.unit !== currentUnit) {
            $(`.unit-btn[data-unit="${data.exercises.unit}"]`).click();
        }
    }
});

// 토스트 메시지 표시
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
