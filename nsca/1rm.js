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
    const reps = parseInt(document.querySelector(`select[name="${exercise}-reps"]`).value);
    const weight = parseFloat(document.querySelector(`input[name="${exercise}-weight"]`).value);

    if (!validateInput(weight, reps)) {
        return;
    }

    const resultDiv = document.getElementById(`${exercise}-results`);
    resultDiv.innerHTML = '';

    var list = calculate(exercise, reps, weight);
    for (let i = 1; i < 11; i++) {
        resultDiv.innerHTML += result_element(i, list[i], reps);
    }

    resultDiv.classList.add('has-results');
}

/**
 * 모든 운동의 RM 재계산
 */
function calculateAll() {
    ['squat', 'benchpress', 'deadlift'].forEach(exercise => {
        const reps = document.querySelector(`select[name="${exercise}-reps"]`).value;
        const weight = document.querySelector(`input[name="${exercise}-weight"]`).value;
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
                    document.querySelectorAll('.unit-btn').forEach(btn => btn.classList.remove('active'));
                    const activeBtn = document.querySelector(`.unit-btn[data-unit="${rmData.unit}"]`);
                    if (activeBtn) activeBtn.classList.add('active');
                    updateUnitDisplay();
                }

                if (rmData.exercises) {
                    Object.keys(rmData.exercises).forEach(exercise => {
                        const exerciseData = rmData.exercises[exercise];
                        if (exerciseData.reps) {
                            document.querySelector(`select[name="${exercise}-reps"]`).value = exerciseData.reps;
                        }
                        if (exerciseData.weight) {
                            document.querySelector(`input[name="${exercise}-weight"]`).value = exerciseData.weight;
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
document.addEventListener('DOMContentLoaded', function() {
    loadData();

    // 단위 변환 버튼 클릭 이벤트
    document.querySelectorAll('.unit-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const newUnit = this.dataset.unit;
            const oldUnit = currentUnit;

            // 버튼 활성화 상태 변경
            document.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            currentUnit = newUnit;

            document.querySelectorAll('input[name$="-weight"]').forEach(function(input) {
                const weight = input.value;
                if (weight) {
                    input.value = convertWeight(weight, oldUnit, newUnit);
                }
            });

            calculateAll();
        });
    });

    // 계산하기 버튼 이벤트 핸들러
    document.querySelectorAll('.calculate-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const exercise = this.dataset.exercise;
            calculateRM(exercise);
        });
    });

    // 저장 버튼
    document.querySelectorAll('.save-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const exercisesData = {
                squat: {
                    reps: document.querySelector('select[name="squat-reps"]').value,
                    weight: document.querySelector('input[name="squat-weight"]').value
                },
                benchpress: {
                    reps: document.querySelector('select[name="benchpress-reps"]').value,
                    weight: document.querySelector('input[name="benchpress-weight"]').value
                },
                deadlift: {
                    reps: document.querySelector('select[name="deadlift-reps"]').value,
                    weight: document.querySelector('input[name="deadlift-weight"]').value
                }
            };

            const rmData = { unit: currentUnit, exercises: exercisesData };

            let savedData = localStorage.getItem('weightlifting-data');
            let allData = savedData ? JSON.parse(savedData) : {};
            allData.rmCalculator = rmData;
            localStorage.setItem('weightlifting-data', JSON.stringify(allData));

            // PR 기록 저장 (NSCA 계수 기반 1RM)
            let newPRCount = 0;
            Object.entries(exercisesData).forEach(([exercise, data]) => {
                if (data.weight && data.reps && typeof PRHistory !== 'undefined') {
                    const w = parseFloat(data.weight);
                    const r = parseInt(data.reps);
                    if (w > 0 && r > 0 && coefficient[exercise]) {
                        const estimated1RM = parseFloat((w * coefficient[exercise][r]).toFixed(2));
                        const result = PRHistory.addRecord(exercise + '-1rm', estimated1RM, currentUnit, 'nsca', w + currentUnit + ' × ' + r + '회');
                        if (result) newPRCount++;
                    }
                }
            });

            if (newPRCount > 0) {
                showToast(`저장 완료! 🏆 새로운 PR ${newPRCount}개`);
            } else {
                showToast('저장되었습니다.');
            }
        });
    });

    // 열기 버튼
    document.querySelectorAll('.load-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
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
                const unitBtn = document.querySelector(`.unit-btn[data-unit="${rmData.unit}"]`);
                if (unitBtn) unitBtn.click();
            }

            Object.keys(rmData.exercises).forEach(exercise => {
                const exerciseData = rmData.exercises[exercise];
                document.querySelector(`select[name="${exercise}-reps"]`).value = exerciseData.reps;
                document.querySelector(`input[name="${exercise}-weight"]`).value = exerciseData.weight;
                if (exerciseData.reps && exerciseData.weight) {
                    calculateRM(exercise);
                }
            });

            showToast('1RM 계산기 데이터를 불러왔습니다.');
        });
    });

    // 공유 버튼
    document.querySelectorAll('.share-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            let shareText = '1RM 계산 결과\n\n';

            ['squat', 'benchpress', 'deadlift'].forEach(exercise => {
                const reps = document.querySelector(`select[name="${exercise}-reps"]`).value;
                const weight = document.querySelector(`input[name="${exercise}-weight"]`).value;
                const results = document.querySelectorAll(`#${exercise}-results .result-element`);

                if (results.length > 0) {
                    const exerciseNames = {
                        'squat': '스쿼트',
                        'benchpress': '벤치프레스',
                        'deadlift': '데드리프트'
                    };

                    shareText += `[${exerciseNames[exercise]}] ${weight}${currentUnit}, ${reps}회\n`;
                    results.forEach(function(el) {
                        const rmText = el.querySelector('.re-rm').textContent;
                        const weightText = el.querySelector('.re-we').textContent;
                        shareText += `${rmText} ${weightText}\n`;
                    });
                    shareText += '\n';
                }
            });

            shareContent('1RM 계산 결과', shareText, false);
        });
    });

    // PR 기록 버튼
    document.querySelectorAll('.pr-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            showPRModal('nsca', {
                'squat-1rm': '스쿼트 1RM',
                'benchpress-1rm': '벤치프레스 1RM',
                'deadlift-1rm': '데드리프트 1RM'
            });
        });
    });

    // 페이지 로드 시 저장된 단위 설정
    const savedData = localStorage.getItem('weightlifting-data');
    if (savedData) {
        const data = JSON.parse(savedData);
        if (data.rmCalculator && data.rmCalculator.unit && data.rmCalculator.unit !== currentUnit) {
            const unitBtn = document.querySelector(`.unit-btn[data-unit="${data.rmCalculator.unit}"]`);
            if (unitBtn) unitBtn.click();
        }
    }

    // 입력 필드 이벤트 핸들러
    setupInputValidation('.weight-input');
});
