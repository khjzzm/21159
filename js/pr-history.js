// PR History Module
// localStorage key: 'pr-history'
// Structure: [ { date, exercise, weight, unit, reps?, source } ]

const PRHistory = (function () {
    const STORAGE_KEY = 'pr-history';
    const MAX_RECORDS = 200;

    function getAll() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch (e) {
            return [];
        }
    }

    function save(records) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(-MAX_RECORDS)));
    }

    /**
     * PR 기록 추가
     * @param {string} exercise - 운동 이름 (e.g. 'back-squat', 'squat')
     * @param {number} weight - 무게
     * @param {string} unit - 단위 ('kg' or 'lb')
     * @param {string} source - 출처 페이지 ('weightlifting' or 'nsca')
     * @param {number} [reps] - 반복 횟수 (nsca용)
     */
    function addRecord(exercise, weight, unit, source, reps) {
        if (!weight || isNaN(weight) || weight <= 0) return null;

        var records = getAll();
        var weightNum = parseFloat(weight);
        // kg로 정규화하여 비교
        var weightKg = unit === 'lb' ? weightNum * 0.453592 : weightNum;

        // 같은 운동의 마지막 기록과 동일하면 중복 저장하지 않음
        var lastRecord = records.filter(function (r) { return r.exercise === exercise; }).pop();
        if (lastRecord) {
            var lastKg = lastRecord.unit === 'lb' ? lastRecord.weight * 0.453592 : lastRecord.weight;
            if (Math.abs(lastKg - weightKg) < 0.01) return null;
        }

        var record = {
            date: new Date().toISOString().slice(0, 10),
            exercise: exercise,
            weight: weightNum,
            unit: unit,
            source: source
        };
        if (reps) record.reps = reps;

        // 같은 운동의 기존 최고 기록 확인
        var best = getBest(exercise);
        var isNewPR = !best || weightKg > (best.unit === 'lb' ? best.weight * 0.453592 : best.weight);

        records.push(record);
        save(records);

        return isNewPR ? record : null;
    }

    /**
     * 특정 운동의 최고 기록
     */
    function getBest(exercise) {
        var records = getAll().filter(function (r) { return r.exercise === exercise; });
        if (records.length === 0) return null;

        return records.reduce(function (best, r) {
            var bestKg = best.unit === 'lb' ? best.weight * 0.453592 : best.weight;
            var rKg = r.unit === 'lb' ? r.weight * 0.453592 : r.weight;
            return rKg > bestKg ? r : best;
        });
    }

    /**
     * 특정 운동의 히스토리 (최근순)
     */
    function getHistory(exercise) {
        return getAll()
            .filter(function (r) { return r.exercise === exercise; })
            .reverse();
    }

    /**
     * 모든 운동별 최고 기록 요약
     */
    function getSummary(source) {
        var records = getAll();
        if (source) {
            records = records.filter(function (r) { return r.source === source; });
        }

        var exercises = {};
        records.forEach(function (r) {
            if (!exercises[r.exercise]) {
                exercises[r.exercise] = [];
            }
            exercises[r.exercise].push(r);
        });

        var summary = {};
        Object.keys(exercises).forEach(function (ex) {
            var best = exercises[ex].reduce(function (b, r) {
                var bKg = b.unit === 'lb' ? b.weight * 0.453592 : b.weight;
                var rKg = r.unit === 'lb' ? r.weight * 0.453592 : r.weight;
                return rKg > bKg ? r : b;
            });
            summary[ex] = {
                best: best,
                count: exercises[ex].length
            };
        });

        return summary;
    }

    /**
     * 특정 기록 삭제
     */
    function removeRecord(index) {
        var records = getAll();
        records.splice(index, 1);
        save(records);
    }

    /**
     * 전체 삭제
     */
    function clearAll() {
        localStorage.removeItem(STORAGE_KEY);
    }

    return {
        addRecord: addRecord,
        getBest: getBest,
        getHistory: getHistory,
        getSummary: getSummary,
        getAll: getAll,
        removeRecord: removeRecord,
        clearAll: clearAll
    };
})();

// PR History 모달 UI
function showPRModal(source, exerciseLabels) {
    // 기존 모달 제거
    var existing = document.getElementById('pr-modal-overlay');
    if (existing) existing.remove();

    var summary = PRHistory.getSummary(source);
    var exerciseKeys = Object.keys(exerciseLabels);

    var rows = '';
    exerciseKeys.forEach(function (key) {
        var label = exerciseLabels[key];
        var data = summary[key];

        if (data) {
            var best = data.best;
            var history = PRHistory.getHistory(key);
            var recentList = history.slice(0, 5).map(function (r) {
                return '<div class="pr-history-item">' +
                    '<span class="pr-date">' + r.date + '</span>' +
                    '<span class="pr-weight">' + r.weight + r.unit + (r.reps ? ' <span class="pr-note">' + r.reps + '</span>' : '') + '</span>' +
                    '</div>';
            }).join('');

            rows += '<div class="pr-exercise">' +
                '<div class="pr-exercise-header">' +
                '<span class="pr-exercise-name">' + label + '</span>' +
                '<span class="pr-best">' + best.weight + best.unit + '</span>' +
                '</div>' +
                '<div class="pr-history-list">' + recentList + '</div>' +
                '</div>';
        } else {
            rows += '<div class="pr-exercise">' +
                '<div class="pr-exercise-header">' +
                '<span class="pr-exercise-name">' + label + '</span>' +
                '<span class="pr-best pr-empty">—</span>' +
                '</div>' +
                '</div>';
        }
    });

    if (!rows) {
        rows = '<p class="pr-empty-message">저장된 PR 기록이 없습니다.<br>저장 버튼을 눌러 기록을 시작하세요.</p>';
    }

    // PR 공유 텍스트 생성
    var shareLines = [];
    exerciseKeys.forEach(function (key) {
        var data = summary[key];
        if (data) {
            var line = exerciseLabels[key] + ': ' + data.best.weight + data.best.unit;
            if (data.best.reps) line += ' (' + data.best.reps + ')';
            shareLines.push(line);
        }
    });

    var html = '<div class="pr-modal-overlay" id="pr-modal-overlay" role="dialog" aria-modal="true" aria-label="PR 기록">' +
        '<div class="pr-modal">' +
        '<div class="pr-modal-header">' +
        '<h3>PR 기록</h3>' +
        '<button class="pr-modal-close" aria-label="닫기">&times;</button>' +
        '</div>' +
        '<div class="pr-modal-body">' + rows + '</div>' +
        '<div class="pr-modal-footer">' +
        '<button class="pr-clear-btn">전체 삭제</button>' +
        (shareLines.length > 0 ? '<button class="pr-share-btn">공유</button>' : '') +
        '</div>' +
        '</div>' +
        '</div>';

    document.body.insertAdjacentHTML('beforeend', html);

    var overlay = document.getElementById('pr-modal-overlay');

    // 닫기
    overlay.querySelector('.pr-modal-close').addEventListener('click', function () {
        overlay.remove();
    });
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) overlay.remove();
    });
    document.addEventListener('keydown', function handler(e) {
        if (e.key === 'Escape' && document.getElementById('pr-modal-overlay')) {
            overlay.remove();
            document.removeEventListener('keydown', handler);
        }
    });

    // 전체 삭제
    overlay.querySelector('.pr-clear-btn').addEventListener('click', function () {
        if (confirm('모든 PR 기록을 삭제하시겠습니까?')) {
            PRHistory.clearAll();
            overlay.remove();
            showToast('PR 기록이 삭제되었습니다.');
        }
    });

    // PR 공유
    var shareBtn = overlay.querySelector('.pr-share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function () {
            var text = 'My PR Records\n\n' + shareLines.join('\n');
            shareContent('My PR Records', text, false);
        });
    }
}
