(function() {
    const grid = document.getElementById('wod-grid');
    const searchInput = document.getElementById('search-input');
    const searchCount = document.getElementById('search-count');
    const scrollTopBtn = document.getElementById('scroll-top');

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

        card.addEventListener('click', function() {
            card.classList.toggle('expanded');
        });

        card.addEventListener('dblclick', function(e) {
            e.preventDefault();
            let text = wod.n + '\n' + wod.w;
            if (wod.rx) text += '\n' + wod.rx;
            navigator.clipboard.writeText(text).then(function() {
                showCopyToast('복사됨!');
            });
        });

        return card;
    }

    function showCopyToast(msg) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = msg;
        container.appendChild(toast);
        setTimeout(function() {
            toast.classList.add('show');
            setTimeout(function() {
                toast.classList.remove('show');
                setTimeout(function() { toast.remove(); }, 300);
            }, 1500);
        }, 50);
    }

    function renderWods(filter) {
        grid.innerHTML = '';
        const q = (filter || '').toLowerCase().trim();
        let count = 0;

        HERO_WODS.forEach(function(wod) {
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

    // Initial render
    renderWods('');

    // Search
    let debounceTimer;
    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function() {
            renderWods(searchInput.value);
        }, 200);
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
