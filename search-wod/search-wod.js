document.addEventListener('DOMContentLoaded', function() {
    var showKr = true;
    var currentPage = 1;
    var isLoading = false;
    var noMoreResults = false;
    var selectedMovements = [];
    var selectedEquipments = [];
    var currentPickerTarget = null;

    // 토글 스위치
    document.getElementById('movement-exclusive').addEventListener('click', function() {
        var checked = this.getAttribute('aria-checked') === 'true';
        this.setAttribute('aria-checked', !checked);
    });
    document.querySelector('.toggle-label').addEventListener('click', function() {
        document.getElementById('movement-exclusive').click();
    });

    // 칩 렌더링
    function renderChips(chipsSel, dataArr, selectedArr) {
        var chipsEl = document.querySelector(chipsSel);
        chipsEl.innerHTML = '';
        selectedArr.forEach(function(slug) {
            var item = dataArr.find(function(d) { return d.slug === slug; });
            if (!item) return;
            var label = showKr ? item.krName : item.name;
            var chip = document.createElement('span');
            chip.className = 'chip';
            chip.innerHTML = escapeHtml(label) + '<button class="chip-remove" data-slug="' + slug + '">&times;</button>';
            chip.querySelector('.chip-remove').addEventListener('click', function(e) {
                e.stopPropagation();
                var removeSlug = this.dataset.slug;
                var idx = selectedArr.indexOf(removeSlug);
                if (idx !== -1) selectedArr.splice(idx, 1);
                renderChips(chipsSel, dataArr, selectedArr);
            });
            chipsEl.appendChild(chip);
        });
    }

    // ========== 피커 모달 ==========
    function openPicker(target) {
        currentPickerTarget = target;
        var dataArr = target === 'movement' ? movements : equipments;
        var selectedArr = target === 'movement' ? selectedMovements : selectedEquipments;
        var title = target === 'movement' ? '동작 선택' : '장비 선택';

        document.getElementById('picker-title').textContent = title;
        document.getElementById('picker-search').value = '';
        renderPickerItems(dataArr, selectedArr, '');
        updatePickerCount(selectedArr);

        document.getElementById('picker-overlay').classList.add('show');
        document.body.style.overflow = 'hidden';
        setTimeout(function() { document.getElementById('picker-search').focus(); }, 100);
    }

    function closePicker() {
        document.getElementById('picker-overlay').classList.remove('show');
        document.body.style.overflow = '';

        if (currentPickerTarget === 'movement') {
            renderChips('#movement-chips', movements, selectedMovements);
        } else {
            renderChips('#equipment-chips', equipments, selectedEquipments);
        }
        currentPickerTarget = null;
    }

    function renderPickerItems(dataArr, selectedArr, query) {
        var body = document.getElementById('picker-body');
        body.innerHTML = '';
        var q = (query || '').toLowerCase().trim();

        dataArr.forEach(function(item) {
            var matchName = item.name.toLowerCase().indexOf(q) !== -1;
            var matchKr = item.krName.toLowerCase().indexOf(q) !== -1;
            var matchSlug = item.slug.indexOf(q) !== -1;
            if (q && !matchName && !matchKr && !matchSlug) return;

            var isSelected = selectedArr.indexOf(item.slug) !== -1;
            var label = showKr ? item.krName : item.name;
            var sub = showKr ? item.name : item.krName;

            var div = document.createElement('div');
            div.className = 'picker-item' + (isSelected ? ' selected' : '');
            div.dataset.slug = item.slug;
            div.innerHTML =
                '<span class="picker-item-check">' + (isSelected ? '&#10003;' : '') + '</span>' +
                '<div class="picker-item-text">' +
                    '<span class="picker-item-main">' + escapeHtml(label) + '</span>' +
                    '<span class="picker-item-sub">' + escapeHtml(sub) + '</span>' +
                '</div>';

            div.addEventListener('click', function() {
                var slug = item.slug;
                var idx = selectedArr.indexOf(slug);
                if (idx === -1) {
                    selectedArr.push(slug);
                    this.classList.add('selected');
                    this.querySelector('.picker-item-check').innerHTML = '&#10003;';
                } else {
                    selectedArr.splice(idx, 1);
                    this.classList.remove('selected');
                    this.querySelector('.picker-item-check').innerHTML = '';
                }
                updatePickerCount(selectedArr);
            });

            body.appendChild(div);
        });

        if (body.children.length === 0) {
            body.innerHTML = '<div class="picker-empty">검색 결과가 없습니다</div>';
        }
    }

    function updatePickerCount(selectedArr) {
        var count = selectedArr.length;
        document.getElementById('picker-count').textContent = count > 0 ? count + '개 선택됨' : '';
    }

    // 피커 열기 버튼
    document.querySelectorAll('.picker-open-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            openPicker(this.dataset.target);
        });
    });

    // 피커 닫기
    document.getElementById('picker-close').addEventListener('click', closePicker);
    document.getElementById('picker-done').addEventListener('click', closePicker);
    document.getElementById('picker-overlay').addEventListener('click', function(e) {
        if (e.target === this) closePicker();
    });

    // 피커 검색
    document.getElementById('picker-search').addEventListener('input', function() {
        var q = this.value;
        var dataArr = currentPickerTarget === 'movement' ? movements : equipments;
        var selectedArr = currentPickerTarget === 'movement' ? selectedMovements : selectedEquipments;
        renderPickerItems(dataArr, selectedArr, q);
    });

    // ESC 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.getElementById('picker-overlay').classList.contains('show')) {
            closePicker();
        }
    });

    // 검색
    document.getElementById('btn-search').addEventListener('click', function() {
        resetAndLoad();
    });

    // 초기화
    document.getElementById('btn-clear').addEventListener('click', function() {
        selectedMovements = [];
        selectedEquipments = [];
        renderChips('#movement-chips', movements, selectedMovements);
        renderChips('#equipment-chips', equipments, selectedEquipments);
        document.getElementById('movement-exclusive').setAttribute('aria-checked', 'false');
        document.getElementById('sort-select').value = 'relevant';
        document.getElementById('score-select').value = 'all';
        document.getElementById('category-select').value = 'all';
        document.getElementById('wod-cards').innerHTML = '';
        document.getElementById('result-status').style.display = 'none';
        document.getElementById('result-count').textContent = '';
        noMoreResults = false;
    });

    function resetAndLoad() {
        document.getElementById('wod-cards').innerHTML = '';
        document.getElementById('result-status').style.display = 'none';
        document.getElementById('result-count').textContent = '';
        currentPage = 1;
        noMoreResults = false;
        loadData();
    }

    function showOfflineBanner() {
        var statusEl = document.getElementById('result-status');
        statusEl.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.56 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0M12 20h.01"/></svg>' +
            '<strong>오프라인 상태입니다</strong>인터넷 연결 후 다시 시도해주세요.';
        statusEl.className = 'offline-banner';
        statusEl.style.display = 'block';
    }

    function loadData() {
        if (isLoading || noMoreResults) return;

        if (!navigator.onLine) {
            showOfflineBanner();
            return;
        }

        isLoading = true;
        document.getElementById('loading-spinner').style.display = 'block';

        var params = new URLSearchParams();
        if (selectedMovements.length > 0) params.append('movement', selectedMovements.join(' '));
        if (selectedEquipments.length > 0) params.append('equipment', selectedEquipments.join(' '));
        if (document.getElementById('movement-exclusive').getAttribute('aria-checked') === 'true') params.append('movement-ex', 'unselected');
        var scoreType = document.getElementById('score-select').value;
        if (scoreType && scoreType !== 'all') params.append('score_type', scoreType);
        var category = document.getElementById('category-select').value;
        if (category && category !== 'all') params.append('category', category);
        params.append('sort', document.getElementById('sort-select').value);
        params.append('paged', currentPage);

        var endpoint = 'https://5bqkixs6qa.execute-api.ap-northeast-2.amazonaws.com/search?' + params.toString();

        fetch(endpoint)
            .then(function(res) { return res.json(); })
            .then(function(json) {
                var wods = (json.wods || []).filter(function(w) {
                    return w.id && w.title && Array.isArray(w.workout);
                });
                if (wods.length === 0) {
                    noMoreResults = true;
                    if (currentPage === 1) {
                        var statusEl = document.getElementById('result-status');
                        statusEl.textContent = '검색 결과가 없습니다';
                        statusEl.style.display = 'block';
                    }
                } else {
                    renderCards(wods);
                    currentPage++;
                    var total = json.total || '';
                    if (total && currentPage === 2) {
                        document.getElementById('result-count').textContent = total + '개의 워크아웃';
                    }
                }
            })
            .catch(function(error) {
                if (currentPage === 1) {
                    var statusEl = document.getElementById('result-status');
                    statusEl.textContent = '오류가 발생했습니다: ' + error.message;
                    statusEl.style.display = 'block';
                }
            })
            .finally(function() {
                document.getElementById('loading-spinner').style.display = 'none';
                isLoading = false;
            });
    }

    function renderCards(wods) {
        var container = document.getElementById('wod-cards');
        wods.forEach(function(wod) {
            var workoutText = wod.workout.join('\n').trim();
            var postedBy = (wod.posted_by && wod.posted_by.text) || '';
            var postedDate = wod.posted_date || '';
            var meta = [postedBy, postedDate].filter(Boolean).join(' \u00b7 ');

            var card = document.createElement('div');
            card.className = 'wod-result-card';
            card.innerHTML =
                '<div class="wod-result-header">' +
                    '<h3 class="wod-result-title">' + escapeHtml(wod.title) + '</h3>' +
                    (meta ? '<span class="wod-result-meta">' + escapeHtml(meta) + '</span>' : '') +
                '</div>' +
                '<pre class="wod-result-body">' + escapeHtml(workoutText) + '</pre>';

            card.addEventListener('click', function() {
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
                } catch(e) {
                    navigator.clipboard.writeText(copyText).then(function() {
                        showToast('클립보드에 복사되었습니다');
                    });
                }
            });

            container.appendChild(card);
        });
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // 무한 스크롤
    window.addEventListener('scroll', function() {
        if (noMoreResults || isLoading) return;
        var nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;
        if (nearBottom) {
            loadData();
        }
    });

    // 온라인 복귀 시 자동 재시도
    window.addEventListener('online', function() {
        var statusEl = document.getElementById('result-status');
        if (statusEl.classList.contains('offline-banner')) {
            statusEl.style.display = 'none';
            statusEl.className = '';
            resetAndLoad();
        }
    });

    // 초기 로드
    resetAndLoad();
});
