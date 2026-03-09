(function() {
    var wrapper = document.querySelector('.landing-wrapper');
    if (!wrapper) return;

    // reveal 애니메이션
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { root: wrapper, threshold: 0.05 });
    document.querySelectorAll('.reveal').forEach(function(el) {
        observer.observe(el);
    });
    setTimeout(function() {
        document.querySelectorAll('.hero-content .reveal').forEach(function(el) {
            el.classList.add('visible');
        });
    }, 100);

    // features-row 무한 롤링 (CSS transform 방식)
    document.querySelectorAll('.features-row').forEach(function(row) {
        // 카드 복제
        var cards = row.querySelectorAll('.feature-card');
        cards.forEach(function(card) {
            row.appendChild(card.cloneNode(true));
        });

        var isLeft = row.classList.contains('features-row-left');
        var speed = isLeft ? 0.5 : -0.5;
        var pos = isLeft ? 0 : -(row.scrollWidth / 2);
        var paused = false;
        var animId = null;
        var halfWidth = row.scrollWidth / 2;

        row.style.overflow = 'hidden';

        // 내부 래퍼 생성
        var track = document.createElement('div');
        track.style.display = 'flex';
        track.style.gap = '20px';
        track.style.willChange = 'transform';
        while (row.firstChild) track.appendChild(row.firstChild);
        row.appendChild(track);
        halfWidth = track.scrollWidth / 2;
        if (!isLeft) pos = -halfWidth;

        function roll() {
            if (!paused) {
                pos -= speed;
                if (isLeft && Math.abs(pos) >= halfWidth) pos = 0;
                if (!isLeft && pos >= 0) pos = -halfWidth;
                track.style.transform = 'translateX(' + pos + 'px)';
            }
            animId = requestAnimationFrame(roll);
        }


        var featuresObs = new IntersectionObserver(function(entries) {
            if (entries[0].isIntersecting) {
                if (!animId) roll();
                document.querySelectorAll('.features-section .reveal').forEach(function(el) {
                    el.classList.add('visible');
                });
            } else {
                if (animId) { cancelAnimationFrame(animId); animId = null; }
            }
        }, { root: wrapper, threshold: 0.1 });
        featuresObs.observe(document.querySelector('.features-section'));
    });
})();
