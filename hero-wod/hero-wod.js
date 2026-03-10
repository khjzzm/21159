(function() {
    const grid = document.getElementById('wod-grid');
    const searchInput = document.getElementById('search-input');
    const searchCount = document.getElementById('search-count');
    const scrollTopBtn = document.getElementById('scroll-top');

    // Autocomplete setup
    var acKeywords = [];
    var acSelectedIndex = -1;

    function buildKeywords() {
        var nameSet = {};
        var moveSet = {};
        // Common movement keywords to extract
        var movePatterns = [
            'pull-ups', 'push-ups', 'handstand push-ups', 'sit-ups',
            'deadlift', 'deadlifts', 'squat', 'squats', 'back squat', 'front squat', 'overhead squat',
            'thruster', 'thrusters', 'clean', 'cleans', 'clean and jerk', 'clean & jerk',
            'snatch', 'snatches', 'power clean', 'power snatch',
            'burpee', 'burpees', 'box jump', 'box jumps',
            'run', 'row', 'muscle-up', 'muscle-ups', 'ring muscle-up',
            'wall ball', 'wall balls', 'kettlebell swing', 'kettlebell swings',
            'double-under', 'double-unders', 'rope climb', 'rope climbs',
            'pistol', 'pistols', 'lunge', 'lunges',
            'press', 'shoulder press', 'push press', 'push jerk', 'jerk',
            'dip', 'dips', 'ring dip', 'ring dips',
            'toes-to-bar', 'toes-to-bars', 'knees-to-elbows',
            'bench press', 'back extension', 'back extensions',
            'hang clean', 'hang snatch', 'sumo deadlift high pull',
            'GHD sit-up', 'GHD sit-ups', 'handstand walk'
        ];
        var moveLower = movePatterns.map(function(m) { return m.toLowerCase(); });

        HERO_WODS.forEach(function(wod) {
            nameSet[wod.n] = true;
            var wLower = wod.w.toLowerCase();
            moveLower.forEach(function(m, i) {
                if (wLower.indexOf(m) !== -1) {
                    moveSet[movePatterns[i]] = true;
                }
            });
        });

        // WOD names first, then movements sorted
        var names = Object.keys(nameSet).sort();
        var moves = Object.keys(moveSet).sort();
        acKeywords = names.concat(moves);
    }

    function createDropdown() {
        var dd = document.createElement('div');
        dd.className = 'search-autocomplete';
        dd.id = 'search-autocomplete';
        searchInput.parentNode.appendChild(dd);
        return dd;
    }

    function showAutocomplete(query) {
        var dd = document.getElementById('search-autocomplete');
        if (!query || query.length < 1) {
            hideAutocomplete();
            return;
        }
        var q = query.toLowerCase();
        var matches = acKeywords.filter(function(kw) {
            return kw.toLowerCase().indexOf(q) !== -1;
        }).slice(0, 8);

        if (matches.length === 0) {
            hideAutocomplete();
            return;
        }

        dd.innerHTML = '';
        matches.forEach(function(m) {
            var div = document.createElement('div');
            div.className = 'search-autocomplete-item';
            // Highlight matching part
            var idx = m.toLowerCase().indexOf(q);
            div.innerHTML = escapeHtml(m.substring(0, idx)) +
                '<mark>' + escapeHtml(m.substring(idx, idx + q.length)) + '</mark>' +
                escapeHtml(m.substring(idx + q.length));
            div.addEventListener('mousedown', function(e) {
                e.preventDefault();
                searchInput.value = m;
                hideAutocomplete();
                renderWods(m);
            });
            dd.appendChild(div);
        });

        dd.classList.add('show');
        searchInput.classList.add('autocomplete-open');
        acSelectedIndex = -1;
    }

    function hideAutocomplete() {
        var dd = document.getElementById('search-autocomplete');
        dd.classList.remove('show');
        dd.innerHTML = '';
        searchInput.classList.remove('autocomplete-open');
        acSelectedIndex = -1;
    }

    function handleArrowKeys(e) {
        var dd = document.getElementById('search-autocomplete');
        if (!dd.classList.contains('show')) return;
        var items = dd.querySelectorAll('.search-autocomplete-item');
        if (items.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            acSelectedIndex = Math.min(acSelectedIndex + 1, items.length - 1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            acSelectedIndex = Math.max(acSelectedIndex - 1, -1);
        } else if (e.key === 'Enter' && acSelectedIndex >= 0) {
            e.preventDefault();
            searchInput.value = items[acSelectedIndex].textContent;
            hideAutocomplete();
            renderWods(searchInput.value);
            return;
        } else if (e.key === 'Escape') {
            hideAutocomplete();
            return;
        } else {
            return;
        }

        items.forEach(function(it) { it.classList.remove('selected'); });
        if (acSelectedIndex >= 0) {
            items[acSelectedIndex].classList.add('selected');
            items[acSelectedIndex].scrollIntoView({ block: 'nearest' });
        }
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function createCard(wod) {
        const card = document.createElement('div');
        card.className = 'wod-card';
        card.setAttribute('data-name', wod.n.toLowerCase());
        card.setAttribute('data-workout', wod.w.toLowerCase());

        let rxHtml = '';
        if (wod.rx) {
            rxHtml = '<div class="wod-rx">' + escapeHtml(wod.rx) + '</div>';
        }

        let dateHtml = '';
        if (wod.d) {
            dateHtml = '<span class="wod-date">' + escapeHtml(wod.d) + '</span>';
        }

        card.innerHTML =
            '<div class="wod-card-header">' +
                '<span class="wod-name">' + escapeHtml(wod.n) + '</span>' +
                dateHtml +
            '</div>' +
            '<div class="wod-body">' +
                '<p class="wod-workout">' + escapeHtml(wod.w) + '</p>' +
                rxHtml +
            '</div>' +
            '<div class="wod-tribute-toggle">' +
                '<span class="toggle-arrow">&#9654;</span>' +
                '<span>Tribute</span>' +
            '</div>' +
            '<div class="wod-tribute">' +
                '<div class="wod-tribute-inner">' + escapeHtml(wod.t) + '</div>' +
            '</div>';

        // Tribute 토글은 해당 영역만
        card.querySelector('.wod-tribute-toggle').addEventListener('click', function(e) {
            e.stopPropagation();
            card.classList.toggle('expanded');
        });

        // 카드 클릭 시 복사
        card.addEventListener('click', function() {
            let text = wod.n + '\n' + wod.w;
            if (wod.rx) text += '\n' + wod.rx;
            navigator.clipboard.writeText(text).then(function() {
                showToast('클립보드에 복사되었습니다');
            });
        });

        return card;
    }

    var currentSort = 'default';

    function parseDate(dateStr) {
        if (!dateStr) return 0;
        // Format: "July 6, 2005" or "Aug. 18, 2005"
        var d = new Date(dateStr);
        return isNaN(d.getTime()) ? 0 : d.getTime();
    }

    function getSortedWods() {
        var sorted = HERO_WODS.slice();
        switch (currentSort) {
            case 'name-asc':
                sorted.sort(function(a, b) { return a.n.localeCompare(b.n); });
                break;
            case 'name-desc':
                sorted.sort(function(a, b) { return b.n.localeCompare(a.n); });
                break;
            case 'date-new':
                sorted.sort(function(a, b) { return parseDate(b.d) - parseDate(a.d); });
                break;
            case 'date-old':
                sorted.sort(function(a, b) { return parseDate(a.d) - parseDate(b.d); });
                break;
            default:
                break;
        }
        return sorted;
    }

    function renderWods(filter) {
        grid.innerHTML = '';
        const q = (filter || '').toLowerCase().trim();
        let count = 0;
        var wods = getSortedWods();

        wods.forEach(function(wod) {
            if (q && wod.n.toLowerCase().indexOf(q) === -1 && wod.w.toLowerCase().indexOf(q) === -1) {
                return;
            }
            grid.appendChild(createCard(wod));
            count++;
        });

        if (count === 0) {
            grid.innerHTML = '<div class="no-results">검색 결과가 없습니다.</div>';
        }

        searchCount.textContent = count + ' / ' + HERO_WODS.length + ' WODs';
    }

    // Build autocomplete keywords & dropdown
    buildKeywords();
    createDropdown();

    // Initial render
    renderWods('');

    // Search with autocomplete
    let debounceTimer;
    searchInput.addEventListener('input', function() {
        showAutocomplete(searchInput.value);
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function() {
            renderWods(searchInput.value);
        }, 200);
    });

    searchInput.addEventListener('keydown', handleArrowKeys);
    searchInput.addEventListener('blur', function() {
        setTimeout(hideAutocomplete, 150);
    });

    // Sort buttons
    document.querySelectorAll('.sort-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.sort-btn').forEach(function(b) {
                b.classList.remove('active');
            });
            btn.classList.add('active');
            currentSort = btn.dataset.sort;
            renderWods(searchInput.value);
        });
    });

    // Scroll to top button
    window.addEventListener('scroll', function() {
        if (window.scrollY > 600) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();
