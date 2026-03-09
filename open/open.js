$(document).ready(function() {
    // 탭 토글
    $('.open-toggle .toggle-btn').click(function() {
        var tab = $(this).data('tab');
        $('.open-toggle .toggle-btn').removeClass('active');
        $(this).addClass('active');
        $('.open-tab').removeClass('active');
        $('#tab-' + tab).addClass('active');
        // 통계 탭 전환 시 바 애니메이션 트리거
        if (tab === 'stats') {
            chartAnimated = false;
            animateBars();
        }
    });

    // 연도 필터 기능 (select box)
    $('#year-select').change(function() {
        const selectedYear = $(this).val();
        
        // 워크아웃 표시/숨김
        if (selectedYear === 'all') {
            $('.workout-year').removeClass('hidden').show();
        } else {
            $('.workout-year').addClass('hidden').hide();
            $(`.workout-year[data-year="${selectedYear}"]`).removeClass('hidden').show();
        }
        
        // 스크롤을 워크아웃 목록으로 이동
        if (selectedYear !== 'all') {
            $('html, body').animate({
                scrollTop: $('.workouts-container').offset().top - 100
            }, 300);
        }
    });
    
    // 페이지 로드 시 모든 워크아웃 표시
    $('.workout-year').show();
    
    // 카드 호버 효과 개선
    $('.workout-card').hover(
        function() {
            $(this).addClass('hovered');
        },
        function() {
            $(this).removeClass('hovered');
        }
    );
    
    // 워크아웃 카드 클릭 시 클립보드 복사
    $('.workout-card').click(function() {
        const $card = $(this);
        const lines = [$card.find('.workout-number').text()];
        $card.find('.workout-content p').each(function() {
            const lineText = $(this).html()
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<strong>/gi, '')
                .replace(/<\/strong>/gi, '')
                .replace(/&amp;/g, '&')
                .replace(/<[^>]+>/g, '')
                .trim();
            if (lineText) lines.push(lineText);
        });
        const copyText = lines.join('\n');

        try {
            const textarea = document.createElement('textarea');
            textarea.value = copyText;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast('복사됨!');
        } catch(e) {
            navigator.clipboard.writeText(copyText).then(function() {
                showToast('복사됨!');
            });
        }
    });
    
    // 검색 기능 (향후 추가 가능)
    function searchWorkouts(searchTerm) {
        const term = searchTerm.toLowerCase();
        $('.workout-card').each(function() {
            const cardText = $(this).text().toLowerCase();
            if (cardText.includes(term)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    }
    
    // 반응형 체크
    function checkMobile() {
        return window.innerWidth <= 768;
    }
    
    // 창 크기 변경 시 레이아웃 조정
    $(window).resize(function() {
        // 필요한 경우 레이아웃 재조정
    });
    
    // 동작 통계 바 차트
    var movementData = [
        { name: 'Double-unders', count: 15, cat: 'cardio' },
        { name: 'Thrusters', count: 12, cat: 'barbell' },
        { name: 'Chest-to-bar pull-ups', count: 10, cat: 'gymnastics' },
        { name: 'Deadlifts', count: 10, cat: 'barbell' },
        { name: 'Toes-to-bars', count: 10, cat: 'gymnastics' },
        { name: 'Wall-ball shots', count: 10, cat: 'other' },
        { name: 'Snatches', count: 10, cat: 'barbell' },
        { name: 'Row (calories)', count: 9, cat: 'cardio' },
        { name: 'Cleans', count: 9, cat: 'barbell' },
        { name: 'Burpees', count: 9, cat: 'body' },
        { name: 'Bar muscle-ups', count: 6, cat: 'gymnastics' },
        { name: 'Handstand push-ups', count: 6, cat: 'gymnastics' },
        { name: 'Box jumps', count: 6, cat: 'body' },
        { name: 'Muscle-ups', count: 6, cat: 'gymnastics' },
        { name: 'Walking lunge', count: 5, cat: 'body' },
        { name: 'DB snatches', count: 5, cat: 'dumbbell' },
        { name: 'Overhead squats', count: 4, cat: 'barbell' },
        { name: 'Wall walks', count: 4, cat: 'gymnastics' },
        { name: 'Clean and jerks', count: 3, cat: 'barbell' },
        { name: 'Pull-ups', count: 2, cat: 'gymnastics' }
    ];

    var categories = {
        cardio: '카디오',
        barbell: '바벨',
        gymnastics: '체조',
        dumbbell: '덤벨',
        body: '바디웨이트',
        other: '기타'
    };

    var $chart = $('#movement-chart');
    var maxCount = movementData[0].count;

    // 범례
    var legendHtml = '<div class="chart-legend">';
    $.each(categories, function(key, label) {
        legendHtml += '<div class="legend-item"><span class="legend-dot" data-cat="' + key + '"></span>' + label + '</div>';
    });
    legendHtml += '</div>';
    $chart.before(legendHtml);

    // 바 생성
    $.each(movementData, function(i, item) {
        var pct = (item.count / maxCount * 100).toFixed(1);
        $chart.append(
            '<div class="bar-row">' +
                '<span class="bar-label">' + item.name + '</span>' +
                '<div class="bar-track">' +
                    '<div class="bar-fill" data-cat="' + item.cat + '" data-width="' + pct + '%">' + item.count + '</div>' +
                '</div>' +
            '</div>'
        );
    });

    // 스크롤 시 애니메이션
    var chartAnimated = false;
    function animateBars() {
        if (chartAnimated) return;
        var chartTop = $chart.offset().top;
        var scrollBottom = $(window).scrollTop() + $(window).height();
        if (scrollBottom > chartTop + 60) {
            chartAnimated = true;
            $('.bar-fill').each(function(i) {
                var $bar = $(this);
                setTimeout(function() {
                    $bar.css('width', $bar.data('width'));
                }, i * 40);
            });
        }
    }
    $(window).on('scroll', animateBars);
    animateBars();
}); 