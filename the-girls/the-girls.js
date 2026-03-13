(function() {
    // =====================
    // Benchmark WOD 데이터
    // 레벨 시간: [elite, advanced, intermediate] (초 단위, 미만 기준)
    // beginner = intermediate 초과
    // =====================
    var WODS = [
        {
            name: 'Fran',
            type: 'For Time',
            workout: '21-15-9\nThrusters\nPull-ups',
            rx: { male: '95 lb', female: '65 lb' },
            levels: {
                male:   [180, 360, 600],
                female: [240, 420, 660]
            }
        },
        {
            name: 'Grace',
            type: 'For Time',
            workout: '30 Clean & Jerks',
            rx: { male: '135 lb', female: '95 lb' },
            levels: {
                male:   [120, 240, 480],
                female: [180, 300, 540]
            }
        },
        {
            name: 'Isabel',
            type: 'For Time',
            workout: '30 Snatches',
            rx: { male: '135 lb', female: '95 lb' },
            levels: {
                male:   [120, 240, 480],
                female: [180, 300, 540]
            }
        },
        {
            name: 'Diane',
            type: 'For Time',
            workout: '21-15-9\nDeadlifts\nHandstand Push-ups',
            rx: { male: '225 lb', female: '155 lb' },
            levels: {
                male:   [180, 360, 600],
                female: [240, 420, 720]
            }
        },
        {
            name: 'Helen',
            type: '3 Rounds For Time',
            workout: '400m Run\n21 KB Swings\n12 Pull-ups',
            rx: { male: '53 lb KB', female: '35 lb KB' },
            levels: {
                male:   [480, 600, 780],
                female: [540, 660, 840]
            }
        },
        {
            name: 'Karen',
            type: 'For Time',
            workout: '150 Wall Ball Shots',
            rx: { male: '20 lb / 10 ft', female: '14 lb / 9 ft' },
            levels: {
                male:   [360, 540, 720],
                female: [420, 600, 780]
            }
        },
        {
            name: 'Jackie',
            type: 'For Time',
            workout: '1000m Row\n50 Thrusters (45 lb)\n30 Pull-ups',
            rx: { male: '45 lb', female: '35 lb' },
            levels: {
                male:   [420, 540, 720],
                female: [480, 600, 780]
            }
        },
        {
            name: 'Annie',
            type: 'For Time',
            workout: '50-40-30-20-10\nDouble-unders\nSit-ups',
            rx: { male: '—', female: '—' },
            levels: {
                male:   [300, 480, 660],
                female: [360, 540, 720]
            }
        },
        {
            name: 'Nancy',
            type: '5 Rounds For Time',
            workout: '400m Run\n15 Overhead Squats',
            rx: { male: '95 lb', female: '65 lb' },
            levels: {
                male:   [660, 840, 1080],
                female: [720, 900, 1140]
            }
        },
        {
            name: 'Elizabeth',
            type: 'For Time',
            workout: '21-15-9\nCleans\nRing Dips',
            rx: { male: '135 lb', female: '95 lb' },
            levels: {
                male:   [300, 480, 660],
                female: [360, 540, 720]
            }
        },
        {
            name: 'Linda',
            type: 'For Time',
            workout: '10-9-8-7-6-5-4-3-2-1\nDeadlifts (1.5x BW)\nBench Press (BW)\nCleans (0.75x BW)',
            rx: { male: 'BW 기준', female: 'BW 기준' },
            levels: {
                male:   [900, 1500, 2100],
                female: [1080, 1680, 2400]
            }
        },
        {
            name: 'Mary',
            type: '20 min AMRAP',
            workout: '5 Handstand Push-ups\n10 Pistols\n15 Pull-ups',
            rx: { male: '—', female: '—' },
            amrap: true,
            levels: {
                male:   [16, 12, 8],
                female: [14, 10, 6]
            }
        },
        {
            name: 'Kelly',
            type: '5 Rounds For Time',
            workout: '400m Run\n30 Box Jumps (24/20 in)\n30 Wall Ball Shots',
            rx: { male: '20 lb / 10 ft', female: '14 lb / 9 ft' },
            levels: {
                male:   [1080, 1500, 1920],
                female: [1200, 1620, 2040]
            }
        },
        {
            name: 'Eva',
            type: '5 Rounds For Time',
            workout: '800m Run\n30 KB Swings\n30 Pull-ups',
            rx: { male: '70 lb KB', female: '53 lb KB' },
            levels: {
                male:   [1680, 2100, 2700],
                female: [1920, 2400, 3000]
            }
        },
        {
            name: 'Cindy',
            type: '20 min AMRAP',
            workout: '5 Pull-ups\n10 Push-ups\n15 Squats',
            rx: { male: '—', female: '—' },
            amrap: true,
            levels: {
                male:   [25, 20, 13],
                female: [22, 17, 10]
            }
        },
        {
            name: 'Amanda',
            type: 'For Time',
            workout: '9-7-5\nMuscle-ups\nSnatches',
            rx: { male: '135 lb', female: '95 lb' },
            levels: {
                male:   [240, 420, 600],
                female: [300, 480, 720]
            }
        }
    ];

    var STORAGE_KEY = 'bm-records';
    var currentGender = 'male';

    // =====================
    // 유틸리티
    // =====================
    function formatTime(seconds) {
        if (seconds <= 0 || !isFinite(seconds)) return '—';
        var m = Math.floor(seconds / 60);
        var s = seconds % 60;
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function loadRecords() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch (e) {
            return {};
        }
    }

    function saveRecords(records) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }

    function getLevel(wod, seconds, gender) {
        var thresholds = wod.levels[gender];
        if (wod.amrap) {
            // AMRAP: 높을수록 좋음
            if (seconds >= thresholds[0]) return 'elite';
            if (seconds >= thresholds[1]) return 'advanced';
            if (seconds >= thresholds[2]) return 'intermediate';
            return 'beginner';
        } else {
            // For Time: 낮을수록 좋음
            if (seconds <= thresholds[0]) return 'elite';
            if (seconds <= thresholds[1]) return 'advanced';
            if (seconds <= thresholds[2]) return 'intermediate';
            return 'beginner';
        }
    }

    function getLevelLabel(level) {
        var map = { elite: 'Elite', advanced: 'Advanced', intermediate: 'Intermediate', beginner: 'Beginner' };
        return map[level] || '';
    }

    // =====================
    // 렌더링
    // =====================
    function renderCards() {
        var list = document.getElementById('bm-list');
        var records = loadRecords();
        list.innerHTML = '';

        WODS.forEach(function(wod) {
            var card = document.createElement('div');
            card.className = 'bm-card';

            var thresholds = wod.levels[currentGender];
            var rx = wod.rx[currentGender];
            var isAmrap = wod.amrap;

            // 레벨 표시 텍스트
            var eliteText, advText, intText, begText;
            if (isAmrap) {
                eliteText = thresholds[0] + '+ rds';
                advText = thresholds[1] + '–' + (thresholds[0] - 1) + ' rds';
                intText = thresholds[2] + '–' + (thresholds[1] - 1) + ' rds';
                begText = '< ' + thresholds[2] + ' rds';
            } else {
                eliteText = '< ' + formatTime(thresholds[0]);
                advText = formatTime(thresholds[0]) + '–' + formatTime(thresholds[1]);
                intText = formatTime(thresholds[1]) + '–' + formatTime(thresholds[2]);
                begText = formatTime(thresholds[2]) + '+';
            }

            // 저장된 기록 확인
            var recKey = wod.name + '_' + currentGender;
            var savedMin = '';
            var savedSec = '';
            var myLevel = '';
            if (records[recKey]) {
                savedMin = records[recKey].min || '';
                savedSec = records[recKey].sec || '';
                var totalSec = (parseInt(savedMin) || 0) * 60 + (parseInt(savedSec) || 0);
                if (isAmrap) {
                    totalSec = parseInt(savedMin) || 0;
                }
                if (totalSec > 0 || (isAmrap && totalSec >= 0 && savedMin !== '')) {
                    myLevel = getLevel(wod, totalSec, currentGender);
                }
            }

            var recordLabel = isAmrap ? '내 라운드' : '내 기록';
            var minPlaceholder = isAmrap ? 'rds' : '분';
            var secDisplay = isAmrap ? '' :
                '<span class="bm-record-sep">:</span>' +
                '<input type="number" class="bm-sec-input" min="0" max="59" placeholder="초" value="' + savedSec + '" inputmode="numeric">';

            card.innerHTML =
                '<div class="bm-card-header">' +
                    '<span class="bm-card-name">' + wod.name + '</span>' +
                    '<span class="bm-card-type">' + wod.type + '</span>' +
                '</div>' +
                '<div class="bm-card-workout">' + wod.workout + (rx !== '—' ? '\n' + rx : '') + '</div>' +
                '<div class="bm-levels">' +
                    '<div class="bm-level bm-level-elite' + (myLevel === 'elite' ? ' current' : '') + '">' +
                        '<span class="bm-level-label">Elite</span>' +
                        '<span class="bm-level-time">' + eliteText + '</span>' +
                    '</div>' +
                    '<div class="bm-level bm-level-advanced' + (myLevel === 'advanced' ? ' current' : '') + '">' +
                        '<span class="bm-level-label">Advanced</span>' +
                        '<span class="bm-level-time">' + advText + '</span>' +
                    '</div>' +
                    '<div class="bm-level bm-level-intermediate' + (myLevel === 'intermediate' ? ' current' : '') + '">' +
                        '<span class="bm-level-label">Intermediate</span>' +
                        '<span class="bm-level-time">' + intText + '</span>' +
                    '</div>' +
                    '<div class="bm-level bm-level-beginner' + (myLevel === 'beginner' ? ' current' : '') + '">' +
                        '<span class="bm-level-label">Beginner</span>' +
                        '<span class="bm-level-time">' + begText + '</span>' +
                    '</div>' +
                '</div>' +
                '<div class="bm-my-record" data-wod="' + wod.name + '">' +
                    '<label>' + recordLabel + '</label>' +
                    '<div class="bm-record-inputs">' +
                        '<input type="number" class="bm-min-input" min="0" max="999" placeholder="' + minPlaceholder + '" value="' + savedMin + '" inputmode="numeric">' +
                        secDisplay +
                    '</div>' +
                    '<span class="bm-my-level" data-level="' + myLevel + '">' + getLevelLabel(myLevel) + '</span>' +
                '</div>';

            list.appendChild(card);
        });

        // 이벤트 바인딩
        bindRecordInputs();
    }

    function bindRecordInputs() {
        var records = loadRecords();
        var containers = document.querySelectorAll('.bm-my-record');

        containers.forEach(function(container) {
            var wodName = container.dataset.wod;
            var minInput = container.querySelector('.bm-min-input');
            var secInput = container.querySelector('.bm-sec-input');
            var levelBadge = container.querySelector('.bm-my-level');

            var wod = WODS.find(function(w) { return w.name === wodName; });
            if (!wod) return;

            function onInput() {
                var recKey = wodName + '_' + currentGender;
                var m = minInput.value;
                var s = secInput ? secInput.value : '';
                records[recKey] = { min: m, sec: s };
                saveRecords(records);

                var totalSec;
                if (wod.amrap) {
                    totalSec = parseInt(m) || 0;
                } else {
                    totalSec = (parseInt(m) || 0) * 60 + (parseInt(s) || 0);
                }

                // 레벨 판정
                var level = '';
                if (totalSec > 0 || (wod.amrap && m !== '')) {
                    level = getLevel(wod, totalSec, currentGender);
                }
                levelBadge.setAttribute('data-level', level);
                levelBadge.textContent = getLevelLabel(level);

                // 레벨 바 하이라이트 업데이트
                var card = container.closest('.bm-card');
                var levelDivs = card.querySelectorAll('.bm-level');
                levelDivs.forEach(function(div) { div.classList.remove('current'); });
                if (level) {
                    var targetClass = 'bm-level-' + level;
                    var targetDiv = card.querySelector('.' + targetClass);
                    if (targetDiv) targetDiv.classList.add('current');
                }
            }

            minInput.addEventListener('input', onInput);
            if (secInput) secInput.addEventListener('input', onInput);
        });
    }

    // =====================
    // 성별 토글
    // =====================
    var genderBtns = document.querySelectorAll('.bm-gender');
    genderBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            genderBtns.forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            currentGender = btn.dataset.gender;
            renderCards();
        });
    });

    // 초기 렌더링
    renderCards();
})();
