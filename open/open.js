$(document).ready(function() {
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
    
    // 워크아웃 카드 클릭 시 확장/축소 기능 (선택사항)
    $('.workout-card').click(function() {
        $(this).toggleClass('expanded');
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
    
    // 키보드 네비게이션
    $(document).keydown(function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.which) {
                case 70: // Ctrl+F - 검색
                    e.preventDefault();
                    // 검색 기능 구현
                    break;
            }
        }
        
        // 방향키로 select box 조작
        if (e.which === 38 || e.which === 40) { // 위/아래 화살표
            const select = $('#year-select');
            if (document.activeElement === select[0]) {
                // select가 포커스된 상태에서만 동작
                return;
            }
        }
    });
}); 