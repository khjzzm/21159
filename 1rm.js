// 계수 정의
const coefficient = {
    squat: [0, 1, 1.0475, 1.13, 1.1575, 1.2, 1.242, 1.284, 1.326, 1.368, 1.41],
    benchpress: [0, 1, 1.035, 1.08, 1.115, 1.15, 1.18, 1.22, 1.255, 1.29, 1.325],
    deadlift: [0, 1, 1.065, 1.13, 1.147, 1.164, 1.181, 1.198, 1.22, 1.232, 1.24]
};

function calculate(exercise, reps, weights) {
    var rm1 = weights * ((coefficient[exercise])[reps]);
    var data = [];
    for (let i = 1; i < 11; i++) {
        data[i] = (rm1 / coefficient[exercise][i]).toFixed(2);
    }
    return data;
}

function result_element(rm, weights) {
    return `<div class='result-element'>
        <p class='re-rm'>${rm}RM</p>
        <p class='re-we'>${weights}${currentUnit.toUpperCase()}</p>
    </div>`;
}

function calculateRM(exercise) {
    const reps = parseInt($(`select[name=${exercise}-reps]`).val());
    const weights = parseFloat($(`input[name=${exercise}-weight]`).val());
    
    if (!reps || !weights) {
        showToast("반복횟수와 무게를 모두 입력해주세요");
        return;
    }
    
    if (weights < 0) {
        showToast("무게는 양수만 가능합니다.");
        return;
    }
    
    $(`#${exercise}-results`).empty();
    
    var list = calculate(exercise, reps, weights);
    for (let i = 1; i < 11; i++) {
        $(`#${exercise}-results`).append(result_element(i, list[i]));
    }
}

// 단위 버튼 클릭 이벤트
$('.unit-btn').click(function() {
    if ($(this).hasClass('active')) return;
    
    const newUnit = $(this).data('unit');
    const oldUnit = currentUnit;
    
    // 버튼 활성화 상태 변경
    $('.unit-btn').removeClass('active');
    $(this).addClass('active');
    
    // 입력 필드 단위 변환 및 placeholder 업데이트
    $('.weight-input').each(function() {
        const weight = $(this).val();
        if (weight) {
            $(this).val(convertWeight(weight, oldUnit, newUnit));
        }
        // placeholder 텍스트 업데이트
        $(this).attr('placeholder', `무게(${newUnit.toLowerCase()})`);
    });
    
    // 결과 단위 변환
    $('.re-we').each(function() {
        const weight = parseFloat($(this).text());
        if (weight) {
            $(this).text(convertWeight(weight, oldUnit, newUnit) + 
                (newUnit === 'kg' ? 'KG' : 'LB'));
        }
    });
    
    currentUnit = newUnit;
});

// 저장 기능
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

// 열기 기능
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

// 공유 기능
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
            
            shareText += `[${exerciseNames[exercise]}] ${weight}${currentUnit.toUpperCase()}, ${reps}회\n`;
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
    });
});

$('#print-btn').click(function(e) {
    e.preventDefault(); // 기본 이벤트 중지
    e.stopPropagation(); // 이벤트 전파 중지
    
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>1RM 계산 결과</title>
            <meta charset="UTF-8">
            <style>
                @media print {
                    @page {
                        size: A4;
                        margin: 2cm;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    padding: 20px;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    background: white;
                }
                h1 {
                    font-size: 24px;
                    color: #333;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #eee;
                }
                .timestamp {
                    color: #666;
                    font-size: 14px;
                    margin-bottom: 30px;
                }
                .content {
                    font-size: 16px;
                    white-space: pre-wrap;
                }
                .footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    font-size: 12px;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <h1>1RM 계산 결과</h1>
            <div class="timestamp">출력 시간: ${new Date().toLocaleString()}</div>
            <div class="content">${generateShareText()}</div>
            <div class="footer">
                이 문서는 1RM 계산기에서 생성되었습니다.
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    window.close();
                }
            </script>
        </body>
        </html>
    `;

    // 모달 닫기
    $('#share-modal').css('display', 'none');
    
    // 새 창에서 프린트
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
    }
    
    return false;
});

// 공유 텍스트 생성 함수 추가
function generateShareText() {
    let shareText = '';
    
    ['squat', 'benchpress', 'deadlift'].forEach(exercise => {
        const results = $(`#${exercise}-results .result-element`);
        if (results.length > 0) {
            const exerciseNames = {
                'squat': '스쿼트',
                'benchpress': '벤치프레스',
                'deadlift': '데드리프트'
            };
            
            shareText += `[${exerciseNames[exercise]}]\n`;
            results.each(function() {
                shareText += $(this).text().replace(/\s+/g, ' ') + '\n';
            });
            shareText += '\n';
        }
    });
    
    return shareText;
}

// 모달 닫기
$(window).click(function(event) {
    if (event.target == $('#share-modal')[0]) {
        $('#share-modal').css('display', 'none');
    }
});

// 토스트 메시지
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

// 페이지 로드 시 저장된 단위 설정
window.onload = () => {
    const savedData = localStorage.getItem('weightlifting-data');
    if (savedData) {
        const data = JSON.parse(savedData);
        if (data.unit !== currentUnit) {
            $(`.unit-btn[data-unit="${data.unit}"]`).click();
        }
    }
};

// 페이지 로드 시 헤더 열기
$(document).ready(function() {
    $("#header").load("header.html", function() {
        // 현재 페이지 경로 가져오기
        const currentPath = window.location.pathname;
        const pageName = currentPath.split('/').pop() || 'index.html'; // 빈 문자열일 경우 index.html로 처리
        
        // 모든 nav-item에서 active 클래스 제거
        $('.nav-tabs .nav-item').removeClass('active');
        
        // 현재 페이지에 해당하는 링크에 active 클래스 추가
        if (pageName === 'index.html' || pageName === '') {
            $('.nav-tabs a[href="#"]').addClass('active');
        } else if (pageName === 'weightlifting.html') {
            $('.nav-tabs a[href="weightlifting.html"]').addClass('active');
        } else if (pageName === '1rm.html') {
            $('.nav-tabs a[href="1rm.html"]').addClass('active');
        }
    });

    // 계산하기 버튼 이벤트 핸들러
    $('.calculate-btn').click(function() {
        const exercise = $(this).data('exercise');
        calculateRM(exercise);
    });
}); 