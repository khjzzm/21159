(function () {
    'use strict';

    var STORAGE_KEY = 'benchmark-stats';

    var BENCHMARKS = [
        {
            id: 'strength',
            title: 'Strength',
            items: [
                '1RM Back Squat', '1RM Bench Press', '1RM Clean & Jerk', '1RM Deadlift',
                '1RM Front Squat', '1RM Hang Power Clean', '1RM Hang Power Snatch',
                '1RM Hang Squat Clean', '1RM Hang Squat Snatch', '1RM Overhead Squat',
                '1RM Power Clean', '1RM Power Snatch', '1RM Push Jerk', '1RM Push Press',
                '1RM Shoulder Press', '1RM Split Jerk', '1RM Squat Clean', '1RM Squat Snatch',
                '1RM Thruster', '1RM Weighted Pull-up'
            ]
        },
        {
            id: 'repmax',
            title: 'Rep Max',
            items: [
                '3RM Back Squat', '3RM Deadlift', '3RM Front Squat',
                '5RM Back Squat', '5RM Deadlift', '5RM Front Squat'
            ]
        },
        {
            id: 'gymnastics',
            title: 'Gymnastics',
            items: [
                '30 Muscle-ups For Time',
                'Max Bar Muscle-ups', 'Max Chest-to-Bar Pull-ups', 'Max Double-Unders',
                'Max Handstand Hold (Free)', 'Max Handstand Hold (Wall)',
                'Max Handstand Push-ups', 'Max Handstand Push-ups (Strict)',
                'Max L-Sit Hold', 'Max Muscle-ups', 'Max Muscle-ups (Strict)',
                'Max Pull-ups', 'Max Pull-ups (Strict)', 'Max Toes-to-Bar'
            ]
        },
        {
            id: 'cardio',
            title: 'Cardio',
            items: [
                'Bike 50 Cal',
                'Row 100m', 'Row 250m', 'Row 500m', 'Row 1000m', 'Row 2000m', 'Row 3000m', 'Row 5K',
                'Run 100m', 'Run 200m', 'Run 400m', 'Run 800m', 'Run 1 Mile', 'Run 2 Miles', 'Run 5k', 'Run 10K',
                'Run Row Run Rx', 'Run Row Run Scaled', 'Run Row Run Sprint'
            ]
        },
        {
            id: 'wod',
            title: 'WOD',
            items: [
                'Abbate', 'Adambrown', 'Adrian', 'Alec', 'Alexander', 'Amanda', 'Andi', 'Andy', 'Angie', 'Annie',
                'Arnie', 'Artie',
                'Badger', 'Barbara', 'Barbara Ann', 'Barraza', 'Bell', 'Bert', 'Big Sexy', 'Blake', 'Bowen',
                'Bradley', 'Bradshaw', 'Brehm', 'Brenton', 'Brian', 'Bruck', 'Bulger', 'Bull', 'Buriak',
                'Cameron', 'Candy', 'Capoot', 'Carse', 'CHAD1000x', 'Chelsea', 'Cindy', 'City 100', 'Clovis',
                'Coe', 'Coffey', 'Coffland', 'Collin', 'Crain', 'CrossFit Total',
                'Dae Han', 'Dallas 5', 'Daniel', 'Danny', 'Del', 'Desforges', 'DG', 'Diane', 'Dobogai',
                'Dominic J. Hall', 'Donny', 'Dork', 'Dragon', 'Drew', 'DT', 'Dunn', 'DVB',
                'Elizabeth', 'Ellen', 'Emily', 'Erin', 'Estrada', 'Eva', 'Eva Strong',
                'Falkel', 'Feeks', 'FERN', 'Fight Gone Bad', 'Filthy 50', 'Finseth', 'Foo', 'Forrest',
                'Fournier', 'Fran', 'Freestyle Diane',
                'Gage', 'Gale Force', 'Gallant', 'Garbo', 'Garrett', 'Gator', 'Gaza', 'GHD Annie', 'Glen',
                'Goose', 'Grace', 'Grettel', 'Griff', 'Gwen',
                'Hall', 'Hamilton', 'Hammer', 'Hammy', 'Hansen', 'Harper', 'Havana', 'Heavy Grace', 'Helen',
                'Helton', 'Hidalgo', 'Hildy', 'Holbrook', 'Holleyman', 'Hollywood', 'Hoover', 'Hope',
                'Hortman', 'Horton', 'Hotshots 19',
                'Ingrid', 'Isabel',
                'J.J.', 'Jack', 'Jackie', 'Jag 28', 'Jared', 'Jason', 'JBo', 'Jennifer', 'Jenny', 'Jerry',
                'Johnson', 'Jonathon Farmer', 'Jorge', 'Josh', 'Josh-O', 'Joshie', 'Josie', 'JT', 'Justin',
                'K27', 'Karen', 'Kelly', 'Kelly Brown', 'Kerrie', 'Kev', 'Kevin', 'Klepto', 'Kutschbach',
                'L1 Benchmark', 'Ladder Nancy', 'Lane', 'Larry', 'Laura', 'Ledesma', 'Lee', 'Leehan', 'Liam',
                'Linda', 'Locke', 'Loredo', 'Lorenzo', 'Luce', 'Luke', 'Lumberjack 20', 'Lyla', 'Lynne',
                'Maggie', 'Maloney', 'Manion', 'Manuel', 'Marco', 'Marguerita', 'Marston', 'Martin', 'Mary',
                'Matt 16', 'Maupin', 'Maxton', 'McCartney', 'McCluskey', 'McGhee', 'Meadows', 'Michael',
                'Miron', 'Monti', 'Moon', 'Moore', 'Morrison', 'Mr. Joshua', 'Muller', 'Murph',
                'Nancy', 'Nasty Girls', 'Nasty Girls V2', 'Nate', 'Ned', 'Nick', 'Nickman', 'Nicole',
                'Northrup', 'Nukes', 'Nunez', 'Nutts',
                'ODA 7313', 'Omar', 'Otis', 'Ozzy',
                'Partner Kelly', 'Pat', 'Paul', 'Paul Pena', 'Peyton', 'Pheezy', 'Pike', 'Pikey', 'PK',
                'Power Amanda',
                'Rahoi', 'Ralph', 'Randy', 'Rankel', 'Ren\u00e9', 'Rich', 'Ricky', 'Riley', 'RJ', 'Robbie',
                'Rocket', 'Roney', 'Roy', 'Ryan', 'Ryan Comas', 'Ryan SO',
                'Santiago', 'Santora', 'Schmalls', 'Scooter', 'Scotty', 'Sean', 'Servais', 'Severin', 'Sham',
                'Shawn', 'Ship', 'Sisson', 'Small', 'Smykowski', 'Spehar', 'Stephen', 'Strange',
                'Strict Elizabeth',
                'T', 'T.J.', 'T.U.P.', 'Tabata Something Else', 'Tabata This!', 'Tama', 'Taylor', 'Terry',
                'The Chief', 'The Don', 'The Ghost', 'The Lyon', 'The Other Total', 'The Seven', 'Thompson',
                'Tiff', 'Time Priority Angie', 'Timothy Helton', 'TK', 'Tom', 'Tommy V', 'Topsy', 'TPT9000',
                'Triple Deuce', 'Tully', 'Tumilson', 'Twelve Days of Christmas', 'Tyler',
                'Viola',
                'Wade', 'Walsh', 'War Frank', 'Weaver', 'Wes', 'Wesley', 'Weston', 'White', 'Whitt',
                'Whitten', 'Willy', 'Wilmot', 'Wittman', 'Woehlke', 'Wood', 'Wyk',
                'Yeti',
                'Zembiec', 'Zeus', 'Zimmerman'
            ]
        }
    ];

    var stats = {};
    var currentCategory = 'all';
    var searchQuery = '';
    var totalCount = 0;

    function loadStats() {
        try {
            stats = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        } catch (e) {
            stats = {};
        }
    }

    function saveStats() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    }

    function getFilledCount() {
        var count = 0;
        for (var k in stats) {
            if (stats[k] && stats[k].trim()) count++;
        }
        return count;
    }

    function updateSummary() {
        var el = document.getElementById('bm-summary-count');
        if (el) el.textContent = getFilledCount() + ' / ' + totalCount;
    }

    function escAttr(str) {
        return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function renderAll() {
        var container = document.getElementById('benchmark-list');
        var html = '';

        BENCHMARKS.forEach(function (cat) {
            html += '<div class="bm-category" data-category="' + cat.id + '">';
            html += '<div class="bm-category-header"><span class="bm-category-title">' + cat.title + '</span><span class="bm-category-count">' + cat.items.length + '</span></div>';

            cat.items.forEach(function (name) {
                var value = stats[name] || '';
                var filled = value.trim() ? ' filled' : '';
                html += '<div class="bm-item' + filled + '" data-name="' + escAttr(name) + '" data-category="' + cat.id + '">';
                html += '<span class="bm-name">' + escAttr(name) + '</span>';
                html += '<input class="bm-input" type="text" value="' + escAttr(value) + '" placeholder="--" data-name="' + escAttr(name) + '">';
                html += '</div>';
            });

            html += '</div>';
        });

        html += '<div class="no-results" id="no-results" style="display:none">검색 결과가 없습니다.</div>';
        container.innerHTML = html;
    }

    function applyFilters() {
        var categories = document.querySelectorAll('.bm-category');
        var query = searchQuery.toLowerCase();
        var visibleCount = 0;

        categories.forEach(function (cat) {
            var catId = cat.getAttribute('data-category');
            var categoryMatch = (currentCategory === 'all' || currentCategory === catId);
            var hasVisible = false;

            var items = cat.querySelectorAll('.bm-item');
            items.forEach(function (item) {
                var name = item.getAttribute('data-name').toLowerCase();
                var searchMatch = !query || name.indexOf(query) !== -1;
                var show = false;

                if (currentCategory === 'filled') {
                    show = searchMatch && item.classList.contains('filled');
                } else {
                    show = categoryMatch && searchMatch;
                }

                item.style.display = show ? '' : 'none';
                if (show) {
                    hasVisible = true;
                    visibleCount++;
                }
            });

            cat.style.display = hasVisible ? '' : 'none';
        });

        var noResults = document.getElementById('no-results');
        if (noResults) {
            noResults.style.display = visibleCount === 0 ? '' : 'none';
        }
    }

    function handleInput(e) {
        var input = e.target;
        if (!input.classList.contains('bm-input')) return;

        var name = input.getAttribute('data-name');
        var value = input.value.trim();
        var item = input.closest('.bm-item');

        if (value) {
            stats[name] = value;
            item.classList.add('filled');
        } else {
            delete stats[name];
            item.classList.remove('filled');
        }

        saveStats();
        updateSummary();
    }

    function handleKeydown(e) {
        if (e.key !== 'Enter') return;
        var input = e.target;
        if (!input.classList.contains('bm-input')) return;

        e.preventDefault();
        var allInputs = Array.prototype.slice.call(document.querySelectorAll('.bm-input'));
        var visibleInputs = allInputs.filter(function (inp) {
            return inp.closest('.bm-item').style.display !== 'none';
        });
        var idx = visibleInputs.indexOf(input);
        if (idx >= 0 && idx < visibleInputs.length - 1) {
            visibleInputs[idx + 1].focus();
        } else {
            input.blur();
        }
    }

    function handleShare() {
        var lines = [];
        BENCHMARKS.forEach(function (category) {
            var catLines = [];
            category.items.forEach(function (name) {
                if (stats[name] && stats[name].trim()) {
                    catLines.push(name + ': ' + stats[name]);
                }
            });
            if (catLines.length > 0) {
                lines.push('\u25A0 ' + category.title);
                lines = lines.concat(catLines);
                lines.push('');
            }
        });

        if (lines.length === 0) {
            showToast('기록된 벤치마크가 없습니다.');
            return;
        }

        var text = 'My Benchmark Stats\n\n' + lines.join('\n');
        shareContent('My Benchmark Stats', text, false);
    }

    function handleClear() {
        if (!confirm('모든 벤치마크 기록을 삭제하시겠습니까?')) return;
        stats = {};
        saveStats();
        document.querySelectorAll('.bm-input').forEach(function (input) {
            input.value = '';
        });
        document.querySelectorAll('.bm-item').forEach(function (item) {
            item.classList.remove('filled');
        });
        updateSummary();
        applyFilters();
        showToast('모든 기록이 삭제되었습니다.');
    }

    function initScrollTop() {
        var btn = document.getElementById('scroll-top-btn');
        if (!btn) return;

        window.addEventListener('scroll', function () {
            if (window.scrollY > 400) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        });

        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function init() {
        BENCHMARKS.forEach(function (cat) { totalCount += cat.items.length; });

        loadStats();
        renderAll();
        updateSummary();

        var container = document.getElementById('benchmark-list');
        container.addEventListener('input', handleInput);
        container.addEventListener('keydown', handleKeydown);

        document.querySelectorAll('.bm-tab').forEach(function (tab) {
            tab.addEventListener('click', function () {
                document.querySelectorAll('.bm-tab').forEach(function (t) { t.classList.remove('active'); });
                this.classList.add('active');
                currentCategory = this.getAttribute('data-category');
                applyFilters();
            });
        });

        var searchInput = document.getElementById('benchmark-search');
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                searchQuery = this.value.trim();
                applyFilters();
            });
        }

        var shareBtn = document.getElementById('share-btn');
        if (shareBtn) shareBtn.addEventListener('click', handleShare);

        var clearBtn = document.getElementById('clear-btn');
        if (clearBtn) clearBtn.addEventListener('click', handleClear);

        initScrollTop();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
