/**
 * 21-15-9 방문자수 추적 시스템
 * LocalStorage를 활용한 클라이언트 사이드 방문자 카운터
 */

class VisitorCounter {
    constructor() {
        this.storageKeys = {
            totalVisitors: '21159_total_visitors',
            todayVisitors: '21159_today_visitors',
            lastVisitDate: '21159_last_visit_date',
            lastVisitTime: '21159_last_visit_time'
        };
        
        this.initCounter();
    }

    initCounter() {
        const today = new Date().toDateString();
        const lastVisitDate = localStorage.getItem(this.storageKeys.lastVisitDate);
        const lastVisitTime = localStorage.getItem(this.storageKeys.lastVisitTime);
        const now = Date.now();
        
        // 세션 기반 중복 방문 방지 (30분 이내 재방문은 카운트하지 않음)
        const sessionTimeout = 30 * 60 * 1000; // 30분
        const isNewSession = !lastVisitTime || (now - parseInt(lastVisitTime)) > sessionTimeout;
        
        if (isNewSession) {
            // 새로운 세션으로 판단되면 방문자수 증가
            this.incrementVisitors(today, lastVisitDate);
            localStorage.setItem(this.storageKeys.lastVisitTime, now.toString());
        }
        
        // 날짜가 바뀌었으면 오늘 방문자수 초기화
        if (lastVisitDate !== today) {
            localStorage.setItem(this.storageKeys.todayVisitors, '0');
            localStorage.setItem(this.storageKeys.lastVisitDate, today);
        }
        
        this.displayVisitorCount();
        
        // Google Analytics 이벤트 전송 (GA가 설정된 경우)
        if (typeof gtag !== 'undefined' && isNewSession) {
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href
            });
        }
    }

    incrementVisitors(today, lastVisitDate) {
        // 총 방문자수 증가
        let totalVisitors = parseInt(localStorage.getItem(this.storageKeys.totalVisitors)) || 0;
        totalVisitors++;
        localStorage.setItem(this.storageKeys.totalVisitors, totalVisitors.toString());
        
        // 오늘 방문자수 증가
        let todayVisitors = parseInt(localStorage.getItem(this.storageKeys.todayVisitors)) || 0;
        
        // 날짜가 바뀌었으면 오늘 방문자수를 1로 설정, 아니면 증가
        if (lastVisitDate !== today) {
            todayVisitors = 1;
        } else {
            todayVisitors++;
        }
        
        localStorage.setItem(this.storageKeys.todayVisitors, todayVisitors.toString());
    }

    displayVisitorCount() {
        const totalVisitors = parseInt(localStorage.getItem(this.storageKeys.totalVisitors)) || 0;
        const todayVisitors = parseInt(localStorage.getItem(this.storageKeys.todayVisitors)) || 0;
        
        // 숫자에 콤마 추가
        const formatNumber = (num) => {
            return num.toLocaleString('ko-KR');
        };
        
        // DOM 요소에 방문자수 표시
        const todayElement = document.getElementById('today-visitors');
        const totalElement = document.getElementById('total-visitors');
        
        if (todayElement) {
            todayElement.textContent = formatNumber(todayVisitors);
            // 애니메이션 효과
            todayElement.style.opacity = '0';
            setTimeout(() => {
                todayElement.style.opacity = '1';
            }, 100);
        }
        
        if (totalElement) {
            totalElement.textContent = formatNumber(totalVisitors);
            // 애니메이션 효과
            totalElement.style.opacity = '0';
            setTimeout(() => {
                totalElement.style.opacity = '1';
            }, 150);
        }
    }

    // 관리자용 방문자수 초기화 함수 (개발자 도구에서 호출 가능)
    resetCounters() {
        Object.values(this.storageKeys).forEach(key => {
            localStorage.removeItem(key);
        });
        console.log('방문자수 카운터가 초기화되었습니다.');
        this.initCounter();
    }

    // 현재 방문자 통계 조회
    getStats() {
        return {
            totalVisitors: parseInt(localStorage.getItem(this.storageKeys.totalVisitors)) || 0,
            todayVisitors: parseInt(localStorage.getItem(this.storageKeys.todayVisitors)) || 0,
            lastVisitDate: localStorage.getItem(this.storageKeys.lastVisitDate),
            lastVisitTime: new Date(parseInt(localStorage.getItem(this.storageKeys.lastVisitTime)) || 0)
        };
    }
}

// 페이지 로드 시 방문자 카운터 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 전역 변수로 카운터 인스턴스 생성 (개발자 도구에서 접근 가능)
    window.visitorCounter = new VisitorCounter();
    
    // 개발자 도구에서 사용할 수 있는 유틸리티 함수들을 전역에 등록
    window.getVisitorStats = () => window.visitorCounter.getStats();
    window.resetVisitorCounters = () => window.visitorCounter.resetCounters();
    
    console.log('21-15-9 방문자수 추적 시스템이 초기화되었습니다.');
    console.log('현재 통계:', window.visitorCounter.getStats());
});

// 페이지 이탈 시 마지막 방문 시간 업데이트
window.addEventListener('beforeunload', function() {
    localStorage.setItem('21159_last_visit_time', Date.now().toString());
}); 