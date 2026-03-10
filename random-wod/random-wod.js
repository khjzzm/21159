document.addEventListener('DOMContentLoaded', function () {
    var STORAGE_KEY = 'random-wod-data';
    var MAX_REROLLS = 5;
    var API_ENDPOINT = 'https://5bqkixs6qa.execute-api.ap-northeast-2.amazonaws.com/search';

    function getTodayStr() {
        var d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    function loadState() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    }

    function saveState(state) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function renderCard(wod) {
        var workoutText = wod.workout.join('\n').trim();
        var postedBy = (wod.posted_by && wod.posted_by.text) || '';
        var postedDate = wod.posted_date || '';
        var meta = [postedBy, postedDate].filter(Boolean).join(' \u00b7 ');

        var lines = workoutText.split('\n');
        var linesHtml = '';
        for (var i = 0; i < lines.length; i++) {
            linesHtml += '<div class="random-wod-line" style="animation-delay:' + (0.3 + i * 0.15) + 's">' + escapeHtml(lines[i]) + '</div>';
        }

        var html = '<div class="random-wod-content">' +
            '<h2 class="random-wod-title">' + escapeHtml(wod.title) + '</h2>' +
            (meta ? '<div class="random-wod-meta">' + escapeHtml(meta) + '</div>' : '') +
            '<div class="random-wod-workout">' + linesHtml + '</div>' +
            '<div class="random-wod-copy-hint">' +
                '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>' +
                '<span>탭하여 복사</span>' +
            '</div>' +
        '</div>';

        var cardContainer = document.getElementById('random-wod-card');
        cardContainer.innerHTML = '';
        var wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        var content = wrapper.firstChild;

        content.addEventListener('click', function () {
            var copyText = wod.title + '\n' + workoutText;
            try {
                var textarea = document.createElement('textarea');
                textarea.value = copyText;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                showToast('클립보드에 복사되었습니다');
            } catch (e) {
                navigator.clipboard.writeText(copyText).then(function () {
                    showToast('클립보드에 복사되었습니다');
                });
            }
        });

        cardContainer.appendChild(content);
    }

    function updateRerollButton(remaining) {
        document.getElementById('reroll-remaining').textContent = remaining + '/' + MAX_REROLLS;
        var btn = document.getElementById('btn-reroll');
        btn.disabled = remaining <= 0;
    }

    function runCountdown(onDone) {
        var display = document.getElementById('countdown-display');
        var nums = [3, 2, 1];
        var i = 0;

        function showNext() {
            if (i >= nums.length) {
                onDone();
                return;
            }
            display.classList.remove('pop');
            display.textContent = nums[i];
            // force reflow for animation restart
            display.offsetWidth;
            display.classList.add('pop');
            i++;
            setTimeout(showNext, 800);
        }

        showNext();
    }

    function showOfflineBanner(msg) {
        var errEl = document.getElementById('random-wod-error');
        errEl.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.56 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0M12 20h.01"/></svg>' +
            '<strong>오프라인 상태입니다</strong>' + (msg || '인터넷 연결 후 다시 시도해주세요.');
        errEl.className = 'offline-banner';
        errEl.style.display = 'block';
    }

    function fetchRandomWod(callback) {
        document.getElementById('random-wod-card').innerHTML = '';
        document.getElementById('random-wod-error').style.display = 'none';

        if (!navigator.onLine) {
            showOfflineBanner();
            return;
        }

        document.getElementById('loading-spinner').style.display = 'block';

        var apiResult = null;
        var apiDone = false;
        var countdownDone = false;

        var today = getTodayStr();
        var seed = 0;
        for (var i = 0; i < today.length; i++) {
            seed = ((seed << 5) - seed) + today.charCodeAt(i);
            seed |= 0;
        }

        var state = loadState();
        var rerollCount = 0;
        if (state && state.date === today) {
            rerollCount = MAX_REROLLS - state.remaining;
        }

        var sorts = ['popular', 'newest', 'alphabetical', 'relevant'];
        var categories = ['', 'benchmark-tribute-wods', 'hero-wods', 'other-benchmarks', 'coach-creations'];
        var scoreTypes = ['', 'amrap', 'emom', 'for-time', 'for-load', 'tabata'];

        var mix = Math.abs(seed + rerollCount * 31);
        var sort = sorts[mix % sorts.length];
        var category = categories[Math.abs(seed + rerollCount * 17) % categories.length];
        var scoreType = scoreTypes[Math.abs(seed + rerollCount * 23) % scoreTypes.length];
        var page = Math.abs(seed + rerollCount * 7) % 30 + 1;

        var params = new URLSearchParams({ sort: sort, paged: page });
        if (category) params.append('category', category);
        if (scoreType) params.append('score_type', scoreType);

        function tryFinish() {
            if (!countdownDone || !apiDone) return;
            document.getElementById('loading-spinner').style.display = 'none';
            if (apiResult) {
                callback(apiResult);
            }
        }

        runCountdown(function () {
            countdownDone = true;
            tryFinish();
        });

        fetch(API_ENDPOINT + '?' + params.toString())
            .then(function (res) { return res.json(); })
            .then(function (json) {
                var wods = (json.wods || []).filter(function (w) {
                    return w.id && w.title && Array.isArray(w.workout);
                });

                if (wods.length === 0) {
                    var fallbackParams = new URLSearchParams({ sort: sort, paged: page });
                    fetch(API_ENDPOINT + '?' + fallbackParams.toString())
                        .then(function (res) { return res.json(); })
                        .then(function (json2) {
                            var wods2 = (json2.wods || []).filter(function (w) {
                                return w.id && w.title && Array.isArray(w.workout);
                            });
                            if (wods2.length === 0) {
                                var errEl = document.getElementById('random-wod-error');
                                errEl.textContent = '워크아웃을 불러올 수 없습니다.';
                                errEl.style.display = 'block';
                            } else {
                                apiResult = wods2[Math.abs(seed + rerollCount * 13) % wods2.length];
                            }
                        })
                        .catch(function () {
                            var errEl = document.getElementById('random-wod-error');
                            errEl.textContent = '네트워크 오류가 발생했습니다.';
                            errEl.style.display = 'block';
                        })
                        .finally(function () {
                            apiDone = true;
                            tryFinish();
                        });
                    return;
                }

                apiResult = wods[Math.abs(seed + rerollCount * 13) % wods.length];
                apiDone = true;
                tryFinish();
            })
            .catch(function () {
                var errEl = document.getElementById('random-wod-error');
                errEl.textContent = '네트워크 오류가 발생했습니다.';
                errEl.style.display = 'block';
                apiDone = true;
                tryFinish();
            });
    }

    function init() {
        var today = getTodayStr();
        var state = loadState();

        if (!state || state.date !== today) {
            state = { date: today, remaining: MAX_REROLLS, wod: null };
            saveState(state);
        }

        updateRerollButton(state.remaining);

        if (state.wod) {
            renderCard(state.wod);
        } else {
            fetchRandomWod(function (wod) {
                if (wod) {
                    state.wod = wod;
                    saveState(state);
                    renderCard(wod);
                }
            });
        }
    }

    document.getElementById('btn-reroll').addEventListener('click', function () {
        var today = getTodayStr();
        var state = loadState();

        if (!state || state.date !== today) {
            state = { date: today, remaining: MAX_REROLLS, wod: null };
        }

        if (state.remaining <= 0) return;

        state.remaining--;
        state.wod = null;
        saveState(state);
        updateRerollButton(state.remaining);

        fetchRandomWod(function (wod) {
            if (wod) {
                state = loadState();
                state.wod = wod;
                saveState(state);
                renderCard(wod);
            }
        });
    });

// 온라인 복귀 시 캐시 없으면 자동 로드
    window.addEventListener('online', function() {
        var state = loadState();
        if (!state || !state.wod) {
            document.getElementById('random-wod-error').style.display = 'none';
            init();
        }
    });

    init();
});
