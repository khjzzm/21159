document.addEventListener('DOMContentLoaded', function() {
    initializeToggles();
    applyRowClasses();
});

function initializeToggles() {
    // 성별 토글
    document.querySelectorAll('.segment-btn[data-gender]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.segment-btn[data-gender]').forEach(function(b) {
                b.classList.remove('active');
            });
            btn.classList.add('active');

            var gender = btn.dataset.gender;
            document.querySelectorAll('.records-section').forEach(function(sec) {
                sec.classList.remove('active');
            });
            document.getElementById(gender + '-records').classList.add('active');
        });
    });

    // 체급 시대 토글
    document.querySelectorAll('.segment-btn[data-era]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.segment-btn[data-era]').forEach(function(b) {
                b.classList.remove('active');
            });
            btn.classList.add('active');

            var era = btn.dataset.era;
            document.querySelectorAll('.table-container[data-era]').forEach(function(tc) {
                tc.style.display = tc.dataset.era === era ? '' : 'none';
            });
        });
    });
}

function applyRowClasses() {
    document.querySelectorAll('.lift-type').forEach(function(cell) {
        var row = cell.parentElement;
        var text = cell.textContent.trim();

        if (text === '인상') {
            row.classList.add('snatch-row');
        } else if (text === '용상') {
            row.classList.add('clean-jerk-row');
        } else if (text === '합계') {
            row.classList.add('total-row');
        }
    });
}
