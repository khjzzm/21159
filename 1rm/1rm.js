// 계수 정의
const coefficient = {
    squat: [0, 1, 1.0475, 1.13, 1.1575, 1.2, 1.242, 1.284, 1.326, 1.368, 1.41],
    benchpress: [0, 1, 1.035, 1.08, 1.115, 1.15, 1.18, 1.22, 1.255, 1.29, 1.325],
    deadlift: [0, 1, 1.065, 1.13, 1.147, 1.164, 1.181, 1.198, 1.22, 1.232, 1.24]
};

/**
 * 주어진 운동, 반복횟수, 무게를 바탕으로 1RM부터 10RM까지 계산
 */
function calculate(exercise, reps, weights) {
    var rm1 = weights * ((coefficient[exercise])[reps]);
    var data = [];
    for (let i = 1; i < 11; i++) {
        data[i] = (rm1 / coefficient[exercise][i]).toFixed(2);
    }
    return data;
}

/**
 * RM 결과를 표시할 HTML 요소 생성
 */
function result_element(rm, weights, inputReps) {
    const isSelected = rm === inputReps ? 'selected' : '';
    const convertedWeight = currentUnit === 'kg' ? 
        convertWeight(weights, 'kg', 'lb') : 
        convertWeight(weights, 'lb', 'kg');
    const otherUnit = currentUnit === 'kg' ? 'lb' : 'kg';
    
    return `<div class='result-element ${isSelected}'>
        <p class='re-rm'>${rm}RM</p>
        <p class='re-we'>${weights} ${currentUnit} (${convertedWeight} ${otherUnit})</p>
    </div>`;
}

/**
 * 입력값 유효성 검사
 */
function validateInput(weight, reps) {
    // 빈 값 또는 숫자가 아닌 값 체크
    if (!weight || isNaN(weight) || !reps || isNaN(reps)) {
        showToast("올바른 무게와 반복 횟수를 입력해주세요.");
        return false;
    }

    // 소수점 자릿수 체크
    if (weight.toString().includes('.') && weight.toString().split('.')[1].length > 2) {
        showToast("무게는 소수점 둘째 자리까지만 입력 가능합니다.");
        return false;
    }

    if (weight <= 0) {
        showToast("무게는 0보다 커야 합니다.");
        return false;
    }

    const maxWeight = currentUnit === 'kg' ? 1000 : 2200;
    if (weight > maxWeight) {
        showToast(`무게는 최대 ${maxWeight}${currentUnit} 까지 입력 가능합니다.`);
        return false;
    }

    if (reps < 1 || reps > 10) {
        showToast("반복 횟수는 1~10회 사이여야 합니다.");
        return false;
    }

    return true;
}

/**
 * 특정 운동의 RM 계산 및 결과 표시
 */
function calculateRM(exercise) {
    const reps = parseInt($(`select[name=${exercise}-reps]`).val());
    const weight = parseFloat($(`input[name=${exercise}-weight]`).val());
    
    if (!validateInput(weight, reps)) {
        return;
    }
    
    const resultDiv = $(`#${exercise}-results`);
    resultDiv.empty();
    
    var list = calculate(exercise, reps, weight);
    for (let i = 1; i < 11; i++) {
        resultDiv.append(result_element(i, list[i], reps));
    }
    
    resultDiv.addClass('has-results');
}

/**
 * 모든 운동의 RM 재계산
 */
function calculateAll() {
    ['squat', 'benchpress', 'deadlift'].forEach(exercise => {
        const reps = $(`select[name="${exercise}-reps"]`).val();
        const weight = $(`input[name="${exercise}-weight"]`).val();
        if (reps && weight) {
            calculateRM(exercise);
        }
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
            
            if (data.rmCalculator) {
                const rmData = data.rmCalculator;
                
                if (rmData.unit) {
                    currentUnit = rmData.unit;
                    $('.unit-btn').removeClass('active');
                    $(`.unit-btn[data-unit="${rmData.unit}"]`).addClass('active');
                    updateUnitDisplay();
                }
                
                if (rmData.exercises) {
                    Object.keys(rmData.exercises).forEach(exercise => {
                        const exerciseData = rmData.exercises[exercise];
                        if (exerciseData.reps) {
                            $(`select[name="${exercise}-reps"]`).val(exerciseData.reps);
                        }
                        if (exerciseData.weight) {
                            $(`input[name="${exercise}-weight"]`).val(exerciseData.weight);
                        }
                    });
                }
                
                calculateAll();
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

        // 버튼 활성화 상태 변경
        $('.unit-btn').removeClass('active');
        $(this).addClass('active');
        
        currentUnit = newUnit;
        
        $('input[name$="-weight"]').each(function() {
            const weight = $(this).val();
            if (weight) {
                $(this).val(convertWeight(weight, oldUnit, newUnit));
            }
        });
        
        calculateAll();
    });

    // 계산하기 버튼 이벤트 핸들러
    $('.calculate-btn').click(function() {
        const exercise = $(this).data('exercise');
        calculateRM(exercise);
    });

    // 저장 버튼
    $('.save-btn').click(function() {
        const rmData = {
            unit: currentUnit,
            exercises: {
                squat: {
                    reps: $('select[name=squat-reps]').val(),
                    weight: $('input[name=squat-weight]').val()
                },
                benchpress: {
                    reps: $('select[name=benchpress-reps]').val(),
                    weight: $('input[name=benchpress-weight]').val()
                },
                deadlift: {
                    reps: $('select[name=deadlift-reps]').val(),
                    weight: $('input[name=deadlift-weight]').val()
                }
            }
        };

        let savedData = localStorage.getItem('weightlifting-data');
        let allData = savedData ? JSON.parse(savedData) : {};
        allData.rmCalculator = rmData;
        localStorage.setItem('weightlifting-data', JSON.stringify(allData));
        showToast('저장되었습니다.');
    });

    // 열기 버튼
    $('.load-btn').click(function() {
        const savedData = localStorage.getItem('weightlifting-data');
        if (!savedData) {
            showToast('저장된 데이터가 없습니다.');
            return;
        }
        
        const allData = JSON.parse(savedData);
        const rmData = allData.rmCalculator;
        
        if (!rmData) {
            showToast('1RM 계산기 저장 데이터가 없습니다.');
            return;
        }
        
        if (rmData.unit !== currentUnit) {
            $(`.unit-btn[data-unit="${rmData.unit}"]`).click();
        }
        
        Object.keys(rmData.exercises).forEach(exercise => {
            const exerciseData = rmData.exercises[exercise];
            $(`select[name=${exercise}-reps]`).val(exerciseData.reps);
            $(`input[name=${exercise}-weight]`).val(exerciseData.weight);
            if (exerciseData.reps && exerciseData.weight) {
                calculateRM(exercise);
            }
        });
        
        showToast('1RM 계산기 데이터를 불러왔습니다.');
    });

    // 공유 버튼
    $('.share-btn').click(function() {
        let shareText = '1RM 계산 결과\n\n';
        
        ['squat', 'benchpress', 'deadlift'].forEach(exercise => {
            const reps = $(`select[name=${exercise}-reps]`).val();
            const weight = $(`input[name=${exercise}-weight]`).val();
            const results = $(`#${exercise}-results .result-element`);
            
            if (results.length > 0) {
                const exerciseNames = {
                    'squat': '스쿼트',
                    'benchpress': '벤치프레스',
                    'deadlift': '데드리프트'
                };
                
                shareText += `[${exerciseNames[exercise]}] ${weight}${currentUnit}, ${reps}회\n`;
                results.each(function() {
                    const rmText = $(this).find('.re-rm').text();
                    const weightText = $(this).find('.re-we').text();
                    shareText += `${rmText} ${weightText}\n`;
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
        if (data.rmCalculator && data.rmCalculator.unit && data.rmCalculator.unit !== currentUnit) {
            $(`.unit-btn[data-unit="${data.rmCalculator.unit}"]`).click();
        }
    }

    // 입력 필드 이벤트 핸들러
    setupInputValidation();
});

/**
 * 입력 필드 이벤트 핸들러
 */
function setupInputValidation() {
    $('input[type="number"]').on('input', function() {
        let value = $(this).val();
        
        // 숫자와 소수점만 허용
        value = value.replace(/[^0-9.]/g, '');
        
        // 소수점이 여러 개인 경우 첫 번째만 유지
        const decimalCount = (value.match(/\./g) || []).length;
        if (decimalCount > 1) {
            value = value.replace(/\./g, function(match, index, original) {
                return index === original.indexOf('.') ? match : '';
            });
        }

        $(this).val(value);

        const numValue = parseFloat(value);
        const max = currentUnit === 'kg' ? 1000 : 2200;

        if (numValue < 0) {
            $(this).val(0);
        } else if (numValue > max) {
            $(this).val(max);
            showToast(`최대 ${max}${currentUnit} 까지 입력 가능합니다.`);
        }

        // 실시간으로 소수점 자릿수 제한
        if (value.includes('.') && value.split('.')[1].length > 2) {
            $(this).val(parseFloat(value).toFixed(2));
        }
    });

    // 포커스 아웃 시 추가 검증
    $('input[type="number"]').on('blur', function() {
        const value = $(this).val();
        
        if (value === '') return;
        
        // 숫자가 아닌 경우
        if (isNaN(value)) {
            $(this).val('');
            showToast("올바른 숫자를 입력해주세요.");
            return;
        }

        // 소수점으로 끝나는 경우 처리
        if (value.endsWith('.')) {
            $(this).val(value.slice(0, -1));
        }

        // 불필요한 0 제거 및 소수점 자릿수 정리
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            $(this).val(numValue.toFixed(numValue % 1 === 0 ? 0 : 2));
        }
    });
}

