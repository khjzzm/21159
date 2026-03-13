document.addEventListener('DOMContentLoaded', function() {
    // 탭 토글
    document.querySelectorAll('.open-toggle .toggle-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var tab = this.dataset.tab;
            document.querySelectorAll('.open-toggle .toggle-btn').forEach(function(b) {
                b.classList.remove('active');
            });
            this.classList.add('active');
            document.querySelectorAll('.open-tab').forEach(function(t) {
                t.classList.remove('active');
            });
            document.getElementById('tab-' + tab).classList.add('active');
            // 통계 탭 전환 시 바 애니메이션 트리거
            if (tab === 'stats') {
                chartAnimated = false;
                setTimeout(function() {
                    // 탭이 보이면 바로 애니메이션, 아니면 스크롤에 맡김
                    if (chart && chart.offsetParent !== null) {
                        chartAnimated = true;
                        document.querySelectorAll('.bar-fill').forEach(function(bar, i) {
                            setTimeout(function() {
                                bar.style.width = bar.dataset.width;
                            }, i * 40);
                        });
                    }
                }, 100);
            }
        });
    });

    // 연도 필터 기능 (select box)
    document.getElementById('year-select').addEventListener('change', function() {
        filterWorkouts();

        var selectedYear = this.value;
        if (selectedYear !== 'all') {
            var container = document.querySelector('.workouts-container');
            var rect = container.getBoundingClientRect();
            window.scrollTo({
                top: rect.top + window.scrollY - 100,
                behavior: 'smooth'
            });
        }
    });

    // 페이지 로드 시 모든 워크아웃 표시
    document.querySelectorAll('.workout-year').forEach(function(el) {
        el.style.display = '';
    });

    // 카드 호버 효과 개선
    document.querySelectorAll('.workout-card').forEach(function(card) {
        card.addEventListener('mouseenter', function() {
            this.classList.add('hovered');
        });
        card.addEventListener('mouseleave', function() {
            this.classList.remove('hovered');
        });
    });

    // 워크아웃 카드 클릭 시 클립보드 복사
    document.querySelectorAll('.workout-card').forEach(function(card) {
        card.addEventListener('click', function() {
            var cardEl = this;
            var lines = [cardEl.querySelector('.workout-number').textContent];
            cardEl.querySelectorAll('.workout-content p').forEach(function(p) {
                var lineText = p.innerHTML
                    .replace(/<br\s*\/?>/gi, '\n')
                    .replace(/<strong>/gi, '')
                    .replace(/<\/strong>/gi, '')
                    .replace(/&amp;/g, '&')
                    .replace(/<[^>]+>/g, '')
                    .trim();
                if (lineText) lines.push(lineText);
            });
            var copyText = lines.join('\n');

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
    });

    // 검색 + 연도 필터 통합
    function filterWorkouts() {
        var selectedYear = document.getElementById('year-select').value;
        var searchInput = document.getElementById('search-input');
        var term = (searchInput.value || '').toLowerCase().trim();
        var visibleCount = 0;
        var totalCount = document.querySelectorAll('.workout-card').length;

        document.querySelectorAll('.workout-year').forEach(function(yearEl) {
            var year = yearEl.dataset.year.toString();
            var yearMatch = selectedYear === 'all' || year === selectedYear;

            if (!yearMatch) {
                yearEl.classList.add('hidden');
                yearEl.style.display = 'none';
                return;
            }

            var yearHasVisible = false;
            yearEl.querySelectorAll('.workout-card').forEach(function(card) {
                if (!term || card.textContent.toLowerCase().indexOf(term) !== -1) {
                    card.style.display = '';
                    yearHasVisible = true;
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            if (yearHasVisible) {
                yearEl.classList.remove('hidden');
                yearEl.style.display = '';
            } else {
                yearEl.classList.add('hidden');
                yearEl.style.display = 'none';
            }
        });

        var searchCount = document.getElementById('search-count');
        if (term) {
            searchCount.textContent = visibleCount + ' / ' + totalCount + ' workouts';
        } else {
            searchCount.textContent = '';
        }
    }

    // 동작 통계 데이터
    var movementData = [
        { name: 'Double-unders', count: 15, cat: 'cardio' },
        { name: 'Thrusters', count: 13, cat: 'barbell' },
        { name: 'Chest-to-bar pull-ups', count: 11, cat: 'gymnastics' },
        { name: 'Deadlifts', count: 10, cat: 'barbell' },
        { name: 'Toes-to-bars', count: 10, cat: 'gymnastics' },
        { name: 'Wall-ball shots', count: 10, cat: 'other' },
        { name: 'Snatches', count: 10, cat: 'barbell' },
        { name: 'Row (calories)', count: 9, cat: 'cardio' },
        { name: 'Cleans', count: 10, cat: 'barbell' },
        { name: 'Burpees', count: 10, cat: 'body' },
        { name: 'Muscle-ups', count: 7, cat: 'gymnastics' },
        { name: 'Bar muscle-ups', count: 6, cat: 'gymnastics' },
        { name: 'Handstand push-ups', count: 6, cat: 'gymnastics' },
        { name: 'Box jumps', count: 6, cat: 'body' },
        { name: 'Walking lunge', count: 5, cat: 'body' },
        { name: 'DB snatches', count: 5, cat: 'dumbbell' },
        { name: 'Overhead squats', count: 4, cat: 'barbell' },
        { name: 'Wall walks', count: 4, cat: 'gymnastics' },
        { name: 'Pull-ups', count: 3, cat: 'gymnastics' },
        { name: 'Clean and jerks', count: 3, cat: 'barbell' }
    ];

    // Autocomplete setup
    var acKeywords = [];
    var acSelectedIndex = -1;

    function buildOpenKeywords() {
        var kwSet = {};
        // From movementData
        movementData.forEach(function(item) {
            kwSet[item.name] = true;
        });
        // Common CrossFit Open terms
        var terms = [
            'AMRAP', 'For Time', 'Ladder', 'Chipper',
            'Thrusters', 'Deadlifts', 'Snatches', 'Cleans', 'Clean and Jerks',
            'Double-unders', 'Toes-to-bars', 'Chest-to-bar pull-ups',
            'Bar muscle-ups', 'Ring muscle-ups', 'Muscle-ups',
            'Handstand push-ups', 'Handstand walk',
            'Wall-ball shots', 'Wall walks', 'Box jumps',
            'Overhead squats', 'Front squats', 'Back squats',
            'Pull-ups', 'Push-ups', 'Burpees', 'Burpee box jump-overs',
            'Rowing', 'Row', 'Ski erg', 'Bike',
            'DB snatches', 'Dumbbell', 'Kettlebell',
            'Rope climbs', 'Pistols', 'Lunges', 'Walking lunge',
            'Shoulder-to-overhead', 'Ground-to-overhead',
            'Calories', 'Shuttle runs'
        ];
        terms.forEach(function(t) { kwSet[t] = true; });
        acKeywords = Object.keys(kwSet).sort();
    }

    function escapeHtmlAc(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function createOpenDropdown() {
        var dd = document.createElement('div');
        dd.className = 'search-autocomplete';
        dd.id = 'search-autocomplete';
        document.getElementById('search-input').parentNode.appendChild(dd);
    }

    function showOpenAutocomplete(query) {
        var dd = document.getElementById('search-autocomplete');
        if (!query || query.length < 1) {
            hideOpenAutocomplete();
            return;
        }
        var q = query.toLowerCase();
        var matches = acKeywords.filter(function(kw) {
            return kw.toLowerCase().indexOf(q) !== -1;
        }).slice(0, 8);

        if (matches.length === 0) {
            hideOpenAutocomplete();
            return;
        }

        dd.innerHTML = '';
        matches.forEach(function(m) {
            var idx = m.toLowerCase().indexOf(q);
            var html = escapeHtmlAc(m.substring(0, idx)) +
                '<mark>' + escapeHtmlAc(m.substring(idx, idx + q.length)) + '</mark>' +
                escapeHtmlAc(m.substring(idx + q.length));
            var item = document.createElement('div');
            item.className = 'search-autocomplete-item';
            item.innerHTML = html;
            item.addEventListener('mousedown', function(e) {
                e.preventDefault();
                document.getElementById('search-input').value = m;
                hideOpenAutocomplete();
                filterWorkouts();
            });
            dd.appendChild(item);
        });

        dd.classList.add('show');
        document.getElementById('search-input').classList.add('autocomplete-open');
        acSelectedIndex = -1;
    }

    function hideOpenAutocomplete() {
        var dd = document.getElementById('search-autocomplete');
        dd.classList.remove('show');
        dd.innerHTML = '';
        document.getElementById('search-input').classList.remove('autocomplete-open');
        acSelectedIndex = -1;
    }

    buildOpenKeywords();
    createOpenDropdown();

    // 검색 입력 이벤트
    var searchTimer;
    var searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', function() {
        showOpenAutocomplete(this.value);
        clearTimeout(searchTimer);
        searchTimer = setTimeout(filterWorkouts, 200);
    });

    searchInput.addEventListener('keydown', function(e) {
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
            document.getElementById('search-input').value = items[acSelectedIndex].textContent;
            hideOpenAutocomplete();
            filterWorkouts();
            return;
        } else if (e.key === 'Escape') {
            hideOpenAutocomplete();
            return;
        } else {
            return;
        }

        items.forEach(function(item) {
            item.classList.remove('selected');
        });
        if (acSelectedIndex >= 0) {
            items[acSelectedIndex].classList.add('selected');
            items[acSelectedIndex].scrollIntoView({ block: 'nearest' });
        }
    });

    searchInput.addEventListener('blur', function() {
        setTimeout(hideOpenAutocomplete, 150);
    });

    // 반응형 체크
    function checkMobile() {
        return window.innerWidth <= 768;
    }

    // 창 크기 변경 시 레이아웃 조정
    window.addEventListener('resize', function() {
        // 필요한 경우 레이아웃 재조정
    });

    // 동작 통계 바 차트
    var categories = {
        cardio: '카디오',
        barbell: '바벨',
        gymnastics: '체조',
        dumbbell: '덤벨',
        body: '바디웨이트',
        other: '기타'
    };

    var chart = document.getElementById('movement-chart');
    var chartAnimated = false;

    if (chart && movementData.length > 0) {
        var maxCount = movementData[0].count;

        // 범례
        var legendHtml = '<div class="chart-legend">';
        Object.entries(categories).forEach(function(entry) {
            var key = entry[0];
            var label = entry[1];
            legendHtml += '<div class="legend-item"><span class="legend-dot" data-cat="' + key + '"></span>' + label + '</div>';
        });
        legendHtml += '</div>';
        chart.insertAdjacentHTML('beforebegin', legendHtml);

        // 바 생성
        movementData.forEach(function(item) {
            var pct = (item.count / maxCount * 100).toFixed(1);
            chart.insertAdjacentHTML('beforeend',
                '<div class="bar-row">' +
                    '<span class="bar-label">' + item.name + '</span>' +
                    '<div class="bar-track">' +
                        '<div class="bar-fill" data-cat="' + item.cat + '" data-width="' + pct + '%">' + item.count + '</div>' +
                    '</div>' +
                '</div>'
            );
        });
    }

    // 스크롤 시 애니메이션
    function animateBars() {
        if (chartAnimated || !chart) return;
        var rect = chart.getBoundingClientRect();
        var chartTop = rect.top + window.scrollY;
        var scrollBottom = window.scrollY + window.innerHeight;
        if (scrollBottom > chartTop + 60) {
            chartAnimated = true;
            document.querySelectorAll('.bar-fill').forEach(function(bar, i) {
                setTimeout(function() {
                    bar.style.width = bar.dataset.width;
                }, i * 40);
            });
        }
    }
    window.addEventListener('scroll', animateBars);
    animateBars();
});
