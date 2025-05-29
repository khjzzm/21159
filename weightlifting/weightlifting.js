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

/**
 * 퍼센트 범위를 바탕으로 최소/최대 무게 계산
 */
function calculateWeight(percent, weight) {
    const [min, max] = percent.replace('%', '').split('~').map(Number);
    const minWeight = (weight * min / 100).toFixed(1);
    const maxWeight = (weight * max / 100).toFixed(1);
    return { minWeight, maxWeight };
}

/**
 * 입력 필드의 변환된 무게 표시 업데이트
 */
function updateConvertedWeight(input) {
    const $input = $(input);
    const weight = parseFloat($input.val());
    const $convertedDiv = $input.closest('.calculator-input').find('.converted-weight');

    if (weight && weight > 0) {
        const otherUnit = currentUnit === 'kg' ? 'lb' : 'kg';
        const convertedWeight = currentUnit === 'kg' ? 
            convertWeight(weight, 'kg', 'lb') : 
            convertWeight(weight, 'lb', 'kg');
        
        $convertedDiv.text(`= ${convertedWeight}${otherUnit.toUpperCase()}`);
    } else {
        $convertedDiv.text('');
    }
}

/**
 * 모든 운동의 결과 업데이트
 */
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

            let movementName = '';
            for (const [key, value] of Object.entries(movementIds)) {
                if (value === id) {
                    movementName = key;
                    break;
                }
            }
            
            if (bToAMovements[movementName]) {
                let resultHtml = `
                    <div class="movement-result-header">
                        <span>종목</span>
                        <span>상관관계</span>
                        <span>수행 가능 범위</span>
                    </div>
                `;
                bToAMovements[movementName].forEach(data => {
                    const { minWeight, maxWeight } = calculateWeight(data['퍼센트'], calculatedWeight);
                    const displayMinWeight = currentUnit === 'lb' ? 
                        convertWeight(minWeight, 'kg', 'lb') : 
                        minWeight;
                    const displayMaxWeight = currentUnit === 'lb' ? 
                        convertWeight(maxWeight, 'kg', 'lb') : 
                        maxWeight;
                    
                    const unitDisplay = currentUnit.toUpperCase();
                    
                    resultHtml += `
                        <div class="movement-result-row">
                            <span class="result-name">${data['A동작']}</span>
                            <span class="result-percent">${data['퍼센트']}</span>
                            <span class="result-range">${displayMinWeight}~${displayMaxWeight} (${unitDisplay})</span>
                        </div>
                    `;
                });
                resultDiv.html(resultHtml);
                resultDiv.addClass('has-results');
            }
        } else {
            resultDiv.empty();
            resultDiv.removeClass('has-results');
        }

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

/**
 * 로컬스토리지에서 저장된 데이터 불러오기
 */
function loadData() {
    const savedData = localStorage.getItem('weightlifting-data');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            
            if (data.exercises) {
                const exerciseData = data.exercises;
                
                if (exerciseData.unit) {
                    currentUnit = exerciseData.unit;
                    $('.unit-btn').removeClass('active');
                    $(`.unit-btn[data-unit="${exerciseData.unit}"]`).addClass('active');
                    updateUnitDisplay();
                }
                
                Object.keys(exerciseData).forEach(key => {
                    if (key !== 'unit' && exerciseData[key]) {
                        $(`#${key}`).val(exerciseData[key]);
                        updateConvertedWeight($(`#${key}`)[0]);
                    }
                });
                
                updateResults();
            }
        } catch (e) {
            console.error('데이터 로드 실패:', e);
        }
    }
}

// 이벤트 핸들러
$(document).ready(function() {
    loadData();
    
    // 단위 변환 버튼 클릭 이벤트
    $('.unit-btn').click(function() {
        const newUnit = $(this).data('unit');
        const oldUnit = currentUnit;

        $('.unit-btn').removeClass('active');
        $(this).addClass('active');
        
        currentUnit = newUnit;
        
        $('.weight-input').each(function() {
            const weight = $(this).val();
            if (weight) {
                $(this).val(convertWeight(weight, oldUnit, newUnit));
            }
            updateConvertedWeight(this);
        });
        
        updateResults();
    });

    // 계산하기 이벤트
    $('.weight-input').on('input', function() {
        updateConvertedWeight(this);
        updateResults();
    });

    // 저장 버튼
    $('.save-btn').click(function() {
        const existingData = JSON.parse(localStorage.getItem('weightlifting-data') || '{}');
        
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
        
        $('.movement-group').each(function() {
            const title = $(this).find('h2').text();
            const weight = $(this).find('.weight-input').val();
            const results = $(this).find('.movement-result-row');
            
            if (weight) {
                shareText += `[${title}] ${weight}${currentUnit.toUpperCase()}\n`;
                results.each(function() {
                    const name = $(this).find('.result-name').text();
                    const percent = $(this).find('.result-percent').text();
                    const range = $(this).find('.result-range').text();
                    shareText += `${name} ${percent} ${range}\n`;
                });
                shareText += '\n';
            }
        });
        
        navigator.clipboard.writeText(shareText).then(() => {
            showToast('클립보드에 복사되었습니다.');
        }).catch(() => {
            showToast('복사에 실패했습니다.');
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

