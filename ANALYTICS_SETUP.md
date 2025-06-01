# 웹사이트 방문자수 추적 설정 가이드

## 🎯 구현된 기능

### 1. 로컬 방문자 카운터
- **오늘 방문자수**: 매일 자정에 초기화되는 당일 방문자 수
- **총 방문자수**: 누적 방문자 수
- **중복 방문 방지**: 30분 이내 재방문은 카운트하지 않음
- **데이터 저장**: 브라우저 LocalStorage 활용

### 2. Google Analytics 4 (GA4) 연동
- 정확한 방문자 분석 및 상세 통계
- 실시간 데이터 추적
- 다양한 리포트 및 인사이트 제공

## 🚀 Google Analytics 설정 방법

### 1단계: Google Analytics 계정 생성
1. [Google Analytics](https://analytics.google.com/) 접속
2. "측정 시작" 버튼 클릭
3. 계정 이름 입력 (예: "21-15-9")
4. 속성 이름 입력 (예: "21-15-9 웹사이트")
5. 시간대를 "대한민국" 으로 설정
6. 통화를 "대한민국 원(₩)" 으로 설정

### 2단계: 데이터 스트림 설정
1. "웹" 플랫폼 선택
2. 웹사이트 URL 입력: `https://21-15-9.com`
3. 스트림 이름 입력: "21-15-9 메인 사이트"
4. "스트림 만들기" 클릭

### 3단계: 측정 ID 확인 및 적용
1. 생성된 스트림에서 **측정 ID** 복사 (형식: `G-XXXXXXXXXX`)
2. `index.html` 파일에서 다음 두 곳의 `GA_MEASUREMENT_ID`를 실제 측정 ID로 교체:

```html
<!-- 수정 전 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
</script>

<!-- 수정 후 (예시) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123DEF4"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-ABC123DEF4');
</script>
```

### 4단계: 다른 페이지에도 적용
다음 페이지들의 HTML에도 동일한 Google Analytics 코드를 추가해야 합니다:
- `/weightlifting/index.html`
- `/1rm/index.html`
- `/convert/index.html`
- `/plates/index.html`

## 📊 방문자수 확인 방법

### 로컬 카운터 확인
1. 웹사이트 메인 페이지 하단에서 실시간 확인
2. 개발자 도구(F12) → Console에서 다음 명령어로 상세 정보 확인:
   ```javascript
   getVisitorStats()           // 현재 통계 조회
   resetVisitorCounters()      // 카운터 초기화 (관리자용)
   ```

### Google Analytics 확인
1. [Google Analytics](https://analytics.google.com/) 로그인
2. 해당 속성 선택
3. **실시간** 리포트: 현재 방문자 수 확인
4. **수집** → **이벤트**: 페이지 조회 이벤트 확인
5. **보고서** → **수집** → **개요**: 일별/월별 방문자 통계

## 🔧 고급 설정 (선택사항)

### 이벤트 추가 추적
`visitor-counter.js` 파일에서 다음과 같은 추가 이벤트를 추적할 수 있습니다:

```javascript
// 페이지 체류 시간 추적
setTimeout(() => {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'engagement_time', {
            engagement_time_msec: 30000 // 30초 체류
        });
    }
}, 30000);

// 특정 섹션 클릭 추적
document.querySelectorAll('a[href^="/"]').forEach(link => {
    link.addEventListener('click', () => {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_navigation', {
                link_url: link.href,
                link_text: link.textContent
            });
        }
    });
});
```

### 프라이버시 설정
개인정보보호를 위해 IP 익명화를 설정할 수 있습니다:

```javascript
gtag('config', 'GA_MEASUREMENT_ID', {
    anonymize_ip: true,
    allow_ad_personalization_signals: false
});
```

## 🛠️ 문제 해결

### 방문자수가 표시되지 않는 경우
1. 브라우저 개발자 도구에서 JavaScript 오류 확인
2. `visitor-counter.js` 파일이 정상적으로 로드되는지 확인
3. LocalStorage가 비활성화되어 있지 않은지 확인

### Google Analytics 데이터가 수집되지 않는 경우
1. 측정 ID가 올바르게 입력되었는지 확인
2. 브라우저의 광고 차단기가 Google Analytics를 차단하지 않는지 확인
3. Google Analytics 실시간 리포트에서 테스트

## 📝 참고사항

- 로컬 방문자 카운터는 브라우저 LocalStorage에 저장되므로, 사용자가 브라우저 데이터를 삭제하면 초기화됩니다.
- Google Analytics는 더 정확하고 상세한 분석을 제공하므로, 공식적인 통계는 GA4를 기준으로 하는 것을 권장합니다.
- 30분 세션 타임아웃은 일반적인 웹 분석 표준을 따릅니다.
- GDPR 및 개인정보보호법 준수를 위해 쿠키 정책 공지를 고려해보세요. 