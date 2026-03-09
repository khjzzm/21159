document.addEventListener('DOMContentLoaded', function() {
    generateKoreanTables();
    generateAmateurTables();
    initRecordTypeTabs();
    initKoreanFilters();
    initAmateurFilters();
    applyRowClasses();
});

// ========== Record Type Tabs ==========
function initRecordTypeTabs() {
    document.querySelectorAll('.record-type-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.record-type-btn').forEach(function(b) {
                b.classList.remove('active');
            });
            btn.classList.add('active');
            document.querySelectorAll('.record-type-section').forEach(function(s) {
                s.classList.remove('active');
            });
            document.getElementById(btn.dataset.type + '-section').classList.add('active');
        });
    });
}

// ========== Korean Record Filters ==========
function initKoreanFilters() {
    // Gender
    document.querySelectorAll('.segment-btn[data-kr-gender]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.segment-btn[data-kr-gender]').forEach(function(b) {
                b.classList.remove('active');
            });
            btn.classList.add('active');
            var gender = btn.dataset.krGender;
            document.querySelectorAll('#korean-section .records-section').forEach(function(sec) {
                sec.classList.remove('active');
            });
            document.getElementById('kr-' + gender + '-records').classList.add('active');
        });
    });

    // Age category
    document.querySelectorAll('.segment-btn[data-age]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.segment-btn[data-age]').forEach(function(b) {
                b.classList.remove('active');
            });
            btn.classList.add('active');
            var age = btn.dataset.age;
            document.querySelectorAll('#korean-section .table-container[data-age]').forEach(function(tc) {
                tc.style.display = tc.dataset.age === age ? '' : 'none';
            });
        });
    });
}

// ========== Amateur Record Filters ==========
function initAmateurFilters() {
    document.querySelectorAll('.segment-btn[data-am-gender]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.segment-btn[data-am-gender]').forEach(function(b) {
                b.classList.remove('active');
            });
            btn.classList.add('active');
            var gender = btn.dataset.amGender;
            document.querySelectorAll('#amateur-section .records-section').forEach(function(sec) {
                sec.classList.remove('active');
            });
            document.getElementById('am-' + gender + '-records').classList.add('active');
        });
    });
}

// ========== Table Generation ==========
var maleWeightClasses = ['60', '65', '70', '75', '85', '95', '110', '+110'];
var femaleWeightClasses = ['49', '53', '57', '61', '69', '77', '86', '+86'];
var ageCategories = ['general', 'junior', 'student', 'middle'];

function generateKoreanTables() {
    var menContainer = document.getElementById('kr-men-records');
    var womenContainer = document.getElementById('kr-women-records');

    ageCategories.forEach(function(age, i) {
        var menDiv = document.createElement('div');
        menDiv.className = 'table-container';
        menDiv.dataset.age = age;
        if (i > 0) menDiv.style.display = 'none';
        menDiv.innerHTML = generateRecordTable(maleWeightClasses);
        menContainer.appendChild(menDiv);

        var womenDiv = document.createElement('div');
        womenDiv.className = 'table-container';
        womenDiv.dataset.age = age;
        if (i > 0) womenDiv.style.display = 'none';
        womenDiv.innerHTML = generateRecordTable(femaleWeightClasses);
        womenContainer.appendChild(womenDiv);
    });
}

function generateAmateurTables() {
    var menContainer = document.getElementById('am-men-records');
    var womenContainer = document.getElementById('am-women-records');

    var menDiv = document.createElement('div');
    menDiv.className = 'table-container';
    menDiv.innerHTML = generateRecordTable(maleWeightClasses);
    menContainer.appendChild(menDiv);

    var womenDiv = document.createElement('div');
    womenDiv.className = 'table-container';
    womenDiv.innerHTML = generateRecordTable(femaleWeightClasses);
    womenContainer.appendChild(womenDiv);
}

function generateRecordTable(weightClasses) {
    var lifts = [
        { name: '인상', cls: 'lift-snatch', recordCls: 'snatch' },
        { name: '용상', cls: 'lift-cj', recordCls: 'clean-jerk' },
        { name: '합계', cls: 'lift-total', recordCls: 'total' }
    ];

    var html = '<table class="records-table"><thead><tr>';
    html += '<th>체급</th><th>종목</th><th>기록</th><th>성명</th>';
    html += '<th>소속</th><th>생년</th><th>수립대회</th><th>수립일</th>';
    html += '</tr></thead><tbody>';

    weightClasses.forEach(function(wc) {
        lifts.forEach(function(lift, i) {
            html += '<tr>';
            if (i === 0) {
                html += '<td class="weight-class" rowspan="3">' + wc + 'kg</td>';
            }
            html += '<td class="lift-type ' + lift.cls + '">' + lift.name + '</td>';
            html += '<td class="' + lift.recordCls + '">-</td>';
            html += '<td class="athlete">-</td>';
            html += '<td class="affiliation">-</td>';
            html += '<td class="birth-year">-</td>';
            html += '<td class="competition">-</td>';
            html += '<td class="date">-</td>';
            html += '</tr>';
        });
    });

    html += '</tbody></table>';
    return html;
}

// ========== Row Classes ==========
function applyRowClasses() {
    document.querySelectorAll('.lift-type').forEach(function(cell) {
        var row = cell.parentElement;
        var text = cell.textContent.trim();
        if (text === '인상') row.classList.add('snatch-row');
        else if (text === '용상') row.classList.add('clean-jerk-row');
        else if (text === '합계') row.classList.add('total-row');
    });
}
