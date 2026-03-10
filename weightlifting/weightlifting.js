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
    var weight = parseFloat(input.value);
    var convertedDiv = input.closest('.calculator-input').querySelector('.converted-weight');

    if (weight && weight > 0) {
        var otherUnit = currentUnit === 'kg' ? 'lb' : 'kg';
        var convertedWeight = currentUnit === 'kg' ?
            convertWeight(weight, 'kg', 'lb') :
            convertWeight(weight, 'lb', 'kg');

        convertedDiv.textContent = ` = ${convertedWeight}${otherUnit}`;
    } else {
        convertedDiv.textContent = '';
    }
}

/**
 * 모든 운동의 결과 업데이트
 */
function updateResults() {
    document.querySelectorAll('.weight-input').forEach(function(el) {
        var id = el.getAttribute('id');
        var weight = parseFloat(el.value) || 0;
        var resultDiv = document.getElementById(id + '-result');

        if (weight > 0) {
            var calculatedWeight = weight;
            if (currentUnit === 'lb') {
                calculatedWeight = convertWeight(weight, 'lb', 'kg');
            }

            var movementName = '';
            for (const [key, value] of Object.entries(movementIds)) {
                if (value === id) {
                    movementName = key;
                    break;
                }
            }

            if (bToAMovements[movementName]) {
                var resultHtml = `
                    <div class="movement-result-header">
                        <span>종목</span>
                        <span>수행 가능 범위</span>
                        <span>상관관계</span>
                    </div>
                `;
                bToAMovements[movementName].forEach(function(data) {
                    var { minWeight, maxWeight } = calculateWeight(data['퍼센트'], calculatedWeight);
                    var displayMinWeight = currentUnit === 'lb' ?
                        convertWeight(minWeight, 'kg', 'lb') :
                        minWeight;
                    var displayMaxWeight = currentUnit === 'lb' ?
                        convertWeight(maxWeight, 'kg', 'lb') :
                        maxWeight;

                    var unitDisplay = currentUnit;

                    resultHtml += `
                        <div class="movement-result-row">
                            <span class="result-name">${data['A동작']}</span>
                            <span class="result-range"><span class="range-badge">${displayMinWeight} ~ ${displayMaxWeight} ${unitDisplay}</span></span>
                            <span class="result-percent">${data['퍼센트']}</span>
                        </div>
                    `;
                });
                resultDiv.innerHTML = resultHtml;
                resultDiv.classList.add('has-results');
            }
        } else {
            resultDiv.innerHTML = '<div class="result-empty">무게를 입력하면 상관관계를 계산합니다</div>';
            resultDiv.classList.add('has-results');
        }

        var convertedWeight = weight ? convertWeight(
            weight,
            currentUnit,
            currentUnit === 'kg' ? 'lb' : 'kg'
        ) : '';
        var convertedUnit = currentUnit === 'kg' ? 'LB' : 'KG';
        var convertedEl = el.closest('.calculator-input').querySelector('.converted-weight');
        convertedEl.textContent = convertedWeight ? `= ${convertedWeight} ${convertedUnit}` : '';
    });
}

/**
 * 로컬스토리지에서 저장된 데이터 불러오기
 */
function loadData() {
    var savedData = localStorage.getItem('weightlifting-data');
    if (savedData) {
        try {
            var data = JSON.parse(savedData);

            if (data.exercises) {
                var exerciseData = data.exercises;

                if (exerciseData.unit) {
                    currentUnit = exerciseData.unit;
                    document.querySelectorAll('.unit-btn').forEach(function(btn) {
                        btn.classList.remove('active');
                    });
                    var activeBtn = document.querySelector('.unit-btn[data-unit="' + exerciseData.unit + '"]');
                    if (activeBtn) activeBtn.classList.add('active');
                    updateUnitDisplay();
                }

                Object.keys(exerciseData).forEach(function(key) {
                    if (key !== 'unit' && exerciseData[key]) {
                        var inputEl = document.getElementById(key);
                        if (inputEl) {
                            inputEl.value = exerciseData[key];
                            updateConvertedWeight(inputEl);
                        }
                    }
                });

                updateResults();
            }
        } catch (e) {
            console.error('데이터 로드 실패:', e);
        }
    }
}

/**
 * 입력값 유효성 검사
 */
function validateInput(weight) {
    if (!weight || isNaN(weight)) {
        showToast("올바른 무게를 입력해주세요.");
        return false;
    }

    if (weight.toString().includes('.') && weight.toString().split('.')[1].length > 2) {
        showToast("무게는 소수점 둘째 자리까지만 입력 가능합니다.");
        return false;
    }

    if (weight <= 0) {
        showToast("무게는 0보다 커야 합니다.");
        return false;
    }

    var maxWeight = currentUnit === 'kg' ? 1000 : 2200;
    if (weight > maxWeight) {
        showToast(`무게는 최대 ${maxWeight}${currentUnit} 까지 입력 가능합니다.`);
        return false;
    }

    return true;
}

// 이벤트 핸들러
document.addEventListener('DOMContentLoaded', function() {
    loadData();

    // 단위 변환 버튼 클릭 이벤트
    document.querySelectorAll('.unit-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var newUnit = this.dataset.unit;
            var oldUnit = currentUnit;

            document.querySelectorAll('.unit-btn').forEach(function(b) {
                b.classList.remove('active');
            });
            this.classList.add('active');

            currentUnit = newUnit;

            document.querySelectorAll('.weight-input').forEach(function(input) {
                var weight = input.value;
                if (weight) {
                    input.value = convertWeight(weight, oldUnit, newUnit);
                }
                updateConvertedWeight(input);
            });

            updateResults();
        });
    });

    // 저장 버튼
    document.querySelectorAll('.save-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var existingData = JSON.parse(localStorage.getItem('weightlifting-data') || '{}');

            var exercises = {
                'clean-and-jerk': document.getElementById('clean-and-jerk').value || '',
                'snatch': document.getElementById('snatch').value || '',
                'clean': document.getElementById('clean').value || '',
                'jerk': document.getElementById('jerk').value || '',
                'back-squat': document.getElementById('back-squat').value || '',
                'front-squat': document.getElementById('front-squat').value || '',
                'deadlift': document.getElementById('deadlift').value || '',
                'push-press': document.getElementById('push-press').value || ''
            };

            var weightData = {
                exercises: Object.assign({ unit: currentUnit }, exercises),
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

            // PR 기록 저장
            var newPRCount = 0;
            Object.entries(exercises).forEach(function([key, val]) {
                if (val && typeof PRHistory !== 'undefined') {
                    var result = PRHistory.addRecord(key, val, currentUnit, 'weightlifting');
                    if (result) newPRCount++;
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
            var savedData = localStorage.getItem('weightlifting-data');
            if (!savedData) {
                showToast('저장된 데이터가 없습니다.');
                return;
            }

            var data = JSON.parse(savedData);
            Object.entries(data.exercises).forEach(function([key, value]) {
                if (key !== 'unit' && value) {
                    var inputEl = document.getElementById(key);
                    if (inputEl) inputEl.value = value;
                }
            });

            updateResults();
            showToast('데이터를 불러왔습니다.');
        });
    });

    // 공유 버튼
    document.querySelectorAll('.share-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var shareText = '웨이트리프팅 동작 계산 결과\n\n';

            document.querySelectorAll('.calculator-card--movement').forEach(function(card) {
                var title = card.querySelector('h2').textContent;
                var weight = card.querySelector('.weight-input').value;

                if (weight) {
                    shareText += `[${title}] ${weight}${currentUnit}\n`;
                    card.querySelectorAll('.movement-result-row').forEach(function(row) {
                        var name = row.querySelector('.result-name').textContent;
                        var percent = row.querySelector('.result-percent').textContent;
                        var range = row.querySelector('.result-range').textContent;
                        shareText += `- ${name}: ${percent} | ${range}\n`;
                    });
                    shareText += '\n';
                }
            });

            shareContent('웨이트리프팅 동작 계산 결과', shareText, false);
        });
    });

    // PR 기록 버튼
    document.querySelectorAll('.pr-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            showPRModal('weightlifting', {
                'clean-and-jerk': '클린 앤 저크',
                'snatch': '스내치',
                'clean': '클린',
                'jerk': '저크',
                'back-squat': '백 스쿼트',
                'front-squat': '프론트 스쿼트',
                'deadlift': '데드리프트',
                'push-press': '푸시 프레스'
            });
        });
    });

    // 페이지 로드 시 저장된 단위 설정
    var savedData = localStorage.getItem('weightlifting-data');
    if (savedData) {
        var data = JSON.parse(savedData);
        if (data.exercises && data.exercises.unit && data.exercises.unit !== currentUnit) {
            var unitBtn = document.querySelector('.unit-btn[data-unit="' + data.exercises.unit + '"]');
            if (unitBtn) unitBtn.click();
        }
    }

    setupInputValidation('.weight-input', {
        onInput: function() {
            updateConvertedWeight(this);
            updateResults();
        },
        onBlur: function() {
            updateConvertedWeight(this);
            updateResults();
        }
    });
});
