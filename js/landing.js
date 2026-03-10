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
    }, { root: wrapper, threshold: 0.15 });
    document.querySelectorAll('.reveal, .reveal-from-left, .reveal-from-right').forEach(function(el) {
        observer.observe(el);
    });
    setTimeout(function() {
        document.querySelectorAll('.hero-content .reveal').forEach(function(el) {
            el.classList.add('visible');
        });
    }, 100);
})();
