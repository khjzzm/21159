(function() {
    var API_BASE = 'https://c3po.crossfit.com/api/leaderboards/v2/competitions/open/';
    var PROXIES = [
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
        'https://api.codetabs.com/v1/proxy?quest='
    ];
    var PER_PAGE = 50;

    // 워크아웃 요약 데이터
    var EVENTS = {
        2026: {
            1: { type: 'For Time', cap: '12 min', desc: 'Wall-ball shots + Box jump-overs', rx: '♂ 20lb/24" ♀ 14lb/20"' },
            2: { type: 'For Time', cap: '15 min', desc: 'DB OH lunges + DB snatches + Pull-ups → C2B → Muscle-ups', rx: '♂ 50lb DB ♀ 35lb DB' },
            3: { type: 'For Time', cap: '16 min', desc: 'Burpees over bar + Cleans + Thrusters (3 weight tiers)', rx: '♂ 95/115/135 ♀ 65/75/85' }
        },
        2025: {
            1: { type: 'AMRAP 15', cap: null, desc: 'Lateral burpees over DB + DB hang clean-to-OH + Walking lunge (+3 reps/rd)', rx: '♂ 50lb DB ♀ 35lb DB' },
            2: { type: 'For Time', cap: '12 min', desc: 'Pull-ups + DU + Thrusters → C2B + DU + Thrusters → BMU + DU + Thrusters', rx: '♂ 95/115/135 ♀ 65/75/85' },
            3: { type: 'For Time', cap: '20 min', desc: 'Wall walks + Row + Deadlifts + Cleans + Snatches', rx: '♂ 225/135/95 ♀ 155/85/65' }
        },
        2024: {
            1: { type: 'For Time', cap: '15 min', desc: '21-15-9: DB snatches + Lateral burpees over DB', rx: '♂ 50lb DB ♀ 35lb DB' },
            2: { type: 'AMRAP 20', cap: null, desc: '300m Row + 10 Deadlifts + 50 Double-unders', rx: '♂ 185lb ♀ 125lb' },
            3: { type: 'For Time', cap: '15 min', desc: '5rds Thrusters + C2B, rest 1min, 5rds Thrusters + BMU', rx: '♂ 95/135 ♀ 65/95' }
        }
    };

    var yearBtns = document.querySelectorAll('.pct-year');
    var divisionBtns = document.querySelectorAll('.pct-div');
    var eventBtns = document.querySelectorAll('.pct-event');
    var summaryYear = document.getElementById('summary-year');
    var summaryDiv = document.getElementById('summary-division');
    var summaryEvent = document.getElementById('summary-event');
    var scoreRadios = document.querySelectorAll('input[name="score-type"]');
    var timeGroup = document.getElementById('time-input-group');
    var repsGroup = document.getElementById('reps-input-group');
    var timeMinInput = document.getElementById('time-min');
    var timeSecInput = document.getElementById('time-sec');
    var repsInput = document.getElementById('reps-val');
    var calcBtn = document.getElementById('calc-btn');
    var loadingEl = document.getElementById('loading');
    var resultSection = document.getElementById('result-section');
    var resultPct = document.getElementById('result-pct');
    var resultRank = document.getElementById('result-rank');
    var resultBar = document.getElementById('result-bar');
    var resultMarker = document.getElementById('result-marker');
    var resultMeta = document.getElementById('result-meta');

    var eventInfoEl = document.getElementById('event-info');

    var currentYear = 2026;
    var currentDivision = 1;
    var currentEvent = 1;

    // =====================
    // 이벤트 설명 업데이트
    // =====================
    function updateEventInfo() {
        var year = currentYear;
        var data = EVENTS[year] && EVENTS[year][currentEvent];
        if (!data) {
            eventInfoEl.innerHTML = '';
            return;
        }
        var capText = data.cap ? ' · Cap ' + data.cap : '';
        eventInfoEl.innerHTML =
            '<span class="pct-event-badge">' + year.toString().slice(2) + '.' + currentEvent + ' ' + data.type + capText + '</span>' +
            '<span class="pct-event-desc">' + data.desc + '</span>' +
            '<span class="pct-event-rx">' + data.rx + '</span>';
    }

    // =====================
    // API
    // =====================
    function apiFetch(url) {
        return fetch(url)
            .then(function(res) {
                if (!res.ok) throw new Error(res.status);
                return res.json();
            })
            .catch(function() {
                return tryProxies(url, 0);
            });
    }

    function tryProxies(url, idx) {
        if (idx >= PROXIES.length) return Promise.reject(new Error('all proxies failed'));
        return fetch(PROXIES[idx] + encodeURIComponent(url))
            .then(function(res) {
                if (!res.ok) throw new Error('proxy ' + idx + ' failed');
                return res.json();
            })
            .catch(function() {
                return tryProxies(url, idx + 1);
            });
    }

    function buildURL(year, division, sort, page) {
        return API_BASE + year + '/leaderboards?division=' + division +
            '&scaled=0&sort=' + sort + '&occupation=0&country=KR&page=' + page;
    }

    // 정적 JSON 로드 → 실패 시 API 폴백
    function loadStaticData(year, division, event) {
        var jsonPath = 'data/' + year + '_' + division + '_' + event + '.json';
        return fetch(jsonPath)
            .then(function(res) {
                if (!res.ok) throw new Error('no static data');
                return res.json();
            })
            .then(function(data) {
                if (!data.pairs || data.pairs.length === 0) throw new Error('empty');
                // 순차 랭크 재할당 (1, 2, 3, ...)
                var pairs = data.pairs.map(function(p, i) {
                    return { rank: i + 1, score: p.score };
                });
                return { total: data.total, pairs: pairs };
            })
            .catch(function() {
                return loadFromAPI(year, division, event).catch(function() {
                    throw new Error('in_progress');
                });
            });
    }

    function loadFromAPI(year, division, event) {
        return apiFetch(buildURL(year, division, event, 1))
            .then(function(data1) {
                var total = parseInt(data1.pagination.totalCompetitors) || 0;
                var pages = parseInt(data1.pagination.totalPages) || 0;
                if (total === 0 || pages === 0) throw new Error('no data');

                var sampleNums = [1];
                var numSamples = Math.min(15, pages);
                for (var i = 1; i < numSamples; i++) {
                    var p = Math.max(1, Math.round(pages * i / (numSamples - 1)));
                    if (sampleNums.indexOf(p) === -1) sampleNums.push(p);
                }

                var toFetch = sampleNums.filter(function(p) { return p !== 1; });
                var promises = toFetch.map(function(p) {
                    return apiFetch(buildURL(year, division, event, p));
                });

                return Promise.all(promises).then(function(results) {
                    var pairs = [];
                    extractPairs(data1, 1, pairs);
                    results.forEach(function(data, idx) {
                        extractPairs(data, toFetch[idx], pairs);
                    });
                    pairs.sort(function(a, b) { return a.rank - b.rank; });
                    pairs = trimScaled(pairs);
                    return { total: total, pairs: pairs };
                });
            });
    }

    // =====================
    // 점수 파싱 & 비교
    // =====================
    function parseDisplay(str) {
        if (!str || str === '--' || str === '') return null;
        // 시간: "8:21", "12:34"
        var tm = str.match(/^(\d+):(\d+)$/);
        if (tm) return { type: 'time', value: parseInt(tm[1]) * 60 + parseInt(tm[2]) };
        // 렙수: "339 reps", "206 reps", "339"
        var rm = str.match(/(\d+)/);
        if (rm) return { type: 'reps', value: parseInt(rm[1]) };
        return null;
    }

    // negative = a가 더 좋음 (더 높은 순위)
    function cmpScore(a, b) {
        if (!a && !b) return 0;
        if (!a) return 1;
        if (!b) return -1;
        // 완료(시간) > 미완료(렙수)
        if (a.type === 'time' && b.type === 'reps') return -1;
        if (a.type === 'reps' && b.type === 'time') return 1;
        // 둘 다 시간: 낮을수록 좋음
        if (a.type === 'time') return a.value - b.value;
        // 둘 다 렙수: 높을수록 좋음
        return b.value - a.value;
    }

    // =====================
    // 퍼센타일 계산
    // =====================
    function calculate() {
        var checkedRadio = document.querySelector('input[name="score-type"]:checked');
        var isTime = checkedRadio.value === 'time';
        var userScore;

        if (isTime) {
            var m = parseInt(timeMinInput.value) || 0;
            var s = parseInt(timeSecInput.value) || 0;
            if (m === 0 && s === 0) return;
            userScore = { type: 'time', value: m * 60 + s };
        } else {
            var r = parseInt(repsInput.value) || 0;
            if (r === 0) return;
            userScore = { type: 'reps', value: r };
        }

        var year = currentYear;
        calcBtn.disabled = true;
        loadingEl.style.display = 'block';
        resultSection.style.display = 'none';

        // 정적 JSON 우선 → 실패 시 API 폴백
        loadStaticData(year, currentDivision, currentEvent)
            .then(function(result) {
                var pairs = result.pairs;
                var total = result.total;

                // 5단계: 사용자 순위 찾기
                var userRank = findRank(pairs, userScore, total);
                var pct = userRank / total * 100;
                showResult(pct, userRank, total, year);
            })
            .catch(function(e) {
                if (e && e.message === 'in_progress') {
                    showInProgress();
                } else {
                    showError('API 요청 실패 — 잠시 후 다시 시도해주세요');
                }
            })
            .finally(function() {
                calcBtn.disabled = false;
                loadingEl.style.display = 'none';
            });
    }

    function extractPairs(data, pageNum, pairs) {
        var rows = data.leaderboardRows || [];
        rows.forEach(function(row, j) {
            var eventScore = null;
            for (var k = 0; k < row.scores.length; k++) {
                if (row.scores[k].ordinal === currentEvent) {
                    eventScore = row.scores[k];
                    break;
                }
            }
            if (!eventScore) return;

            // Scaled 점수 제외
            if (eventScore.scaled === '1' || eventScore.scaled === 1) return;
            var display = eventScore.scoreDisplay || '';
            if (display.indexOf('- s') !== -1) return;

            var parsed = parseDisplay(display);
            if (parsed) {
                var rank = (pageNum - 1) * PER_PAGE + j + 1;
                pairs.push({ rank: rank, score: parsed });
            }
        });
    }

    // RX→Scaled 경계 감지: 렙수가 갑자기 증가하거나 렙수 이후 시간이 나오면 Scaled 구간
    function trimScaled(pairs) {
        if (pairs.length < 2) return pairs;
        var lastRepsVal = null;
        for (var i = 0; i < pairs.length; i++) {
            if (pairs[i].score.type === 'reps') {
                if (lastRepsVal !== null && pairs[i].score.value > lastRepsVal + 10) {
                    return pairs.slice(0, i);
                }
                lastRepsVal = pairs[i].score.value;
            } else if (pairs[i].score.type === 'time' && lastRepsVal !== null) {
                return pairs.slice(0, i);
            }
        }
        return pairs;
    }

    function findRank(pairs, userScore, total) {
        if (pairs.length === 0) return total;

        // 최상위보다 좋으면
        if (cmpScore(userScore, pairs[0].score) <= 0) return 1;

        // 최하위와 비교
        var lastPair = pairs[pairs.length - 1];
        var cmpLast = cmpScore(userScore, lastPair.score);

        if (cmpLast === 0) return lastPair.rank;

        // 나쁘면: 얼마나 나쁜지에 비례해서 순위 추정
        if (cmpLast > 0) {
            var remaining = total - lastPair.rank;
            var fraction = 0.5;
            if (userScore.type === 'reps' && lastPair.score.type === 'reps' && lastPair.score.value > 0) {
                // 1 rep vs 145 reps → fraction ≈ 1.0 (거의 최하위)
                // 140 rep vs 145 reps → fraction ≈ 0.03 (최하위 근처)
                fraction = Math.min(1, (lastPair.score.value - userScore.value) / lastPair.score.value);
            } else if (userScore.type === 'time' && lastPair.score.type === 'time' && lastPair.score.value > 0) {
                fraction = Math.min(1, (userScore.value - lastPair.score.value) / lastPair.score.value);
            }
            return Math.min(total, lastPair.rank + Math.max(1, Math.round(remaining * fraction)));
        }

        // 구간 찾기 (이진 탐색)
        var lo = 0, hi = pairs.length - 1;
        while (lo < hi - 1) {
            var mid = Math.floor((lo + hi) / 2);
            if (cmpScore(userScore, pairs[mid].score) <= 0) {
                hi = mid;
            } else {
                lo = mid;
            }
        }

        if (cmpScore(userScore, pairs[lo].score) > 0 && cmpScore(userScore, pairs[hi].score) <= 0) {
            return interpolate(pairs[lo], pairs[hi], userScore);
        }

        return lastPair.rank;
    }

    function interpolate(better, worse, userScore) {
        var rankRange = worse.rank - better.rank;
        if (rankRange <= 1) return worse.rank;

        // 같은 타입이면 선형 보간
        if (userScore.type === better.score.type && userScore.type === worse.score.type) {
            var fraction;
            if (userScore.type === 'time') {
                var range = worse.score.value - better.score.value;
                if (range === 0) return better.rank;
                fraction = (userScore.value - better.score.value) / range;
            } else {
                var range = better.score.value - worse.score.value;
                if (range === 0) return better.rank;
                fraction = (better.score.value - userScore.value) / range;
            }
            fraction = Math.max(0, Math.min(1, fraction));
            return Math.round(better.rank + fraction * rankRange);
        }

        // 혼합 경계 (시간/렙수 전환 지점)
        if (userScore.type === 'time') {
            return Math.round(better.rank + rankRange * 0.3);
        }
        return Math.round(better.rank + rankRange * 0.7);
    }

    // =====================
    // UI
    // =====================
    function showResult(pct, rank, total, year) {
        resultSection.style.display = 'block';
        resultPct.style.fontSize = '';

        var displayPct = pct < 1 ? pct.toFixed(2) : pct.toFixed(1);
        resultPct.textContent = '상위 ' + displayPct + '%';
        resultRank.textContent = '약 ' + rank.toLocaleString() + '위 / ' + total.toLocaleString() + '명';

        // 바 애니메이션
        var barWidth = Math.min(100, pct);
        resultBar.style.width = '100%';
        resultMarker.style.left = Math.min(98, barWidth) + '%';

        var divLabel = currentDivision === 1 ? '남자' : '여자';
        resultMeta.textContent = year + ' Open ' + year.toString().slice(2) + '.' + currentEvent +
            ' · ' + divLabel + ' RX · 한국';

        resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function showError(msg) {
        loadingEl.style.display = 'none';
        calcBtn.disabled = false;
        resultSection.style.display = 'block';
        resultPct.style.fontSize = '';
        resultPct.textContent = '—';
        resultRank.textContent = msg;
        resultBar.style.width = '0';
        resultMarker.style.left = '0';
        resultMeta.textContent = '';
    }

    function showInProgress() {
        loadingEl.style.display = 'none';
        calcBtn.disabled = false;
        resultSection.style.display = 'block';
        var eventLabel = currentYear.toString().slice(2) + '.' + currentEvent;
        resultPct.textContent = 'WOD IN PROGRESS';
        resultPct.style.fontSize = '28px';
        resultRank.textContent = eventLabel + ' 이벤트가 아직 진행 중입니다. 종료 후 결과가 반영됩니다.';
        resultBar.style.width = '0';
        resultMarker.style.left = '0';
        resultMeta.textContent = '';
    }

    // =====================
    // 이벤트 리스너
    // =====================

    function updateSummary() {
        summaryYear.textContent = currentYear;
        summaryDiv.textContent = currentDivision === 1 ? 'Male' : 'Female';
        summaryEvent.textContent = currentYear.toString().slice(2) + '.' + currentEvent;
        updateEventInfo();
    }

    // 연도 토글
    yearBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            yearBtns.forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            currentYear = parseInt(btn.dataset.year);
            updateSummary();
        });
    });

    // 성별 토글
    divisionBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            divisionBtns.forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            currentDivision = parseInt(btn.dataset.division);
            updateSummary();
        });
    });

    // 이벤트 토글
    eventBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            eventBtns.forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            currentEvent = parseInt(btn.dataset.event);
            updateSummary();
        });
    });

    // 점수 타입 전환
    scoreRadios.forEach(function(radio) {
        radio.addEventListener('change', function() {
            if (this.value === 'time') {
                timeGroup.style.display = 'flex';
                repsGroup.style.display = 'none';
            } else {
                timeGroup.style.display = 'none';
                repsGroup.style.display = 'flex';
            }
        });
    });

    // 확인 버튼
    calcBtn.addEventListener('click', calculate);

    // Enter 키 지원
    [timeMinInput, timeSecInput, repsInput].forEach(function(input) {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') calculate();
        });
    });

    // 초기 렌더링
    updateEventInfo();
})();
