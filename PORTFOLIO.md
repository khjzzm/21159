# 21-15-9 | CrossFit & 웨이트리프팅 종합 계산기

> **Fran부터 1RM까지** - CrossFit의 대표 벤치마크 워크아웃에서 영감받은 종합 피트니스 계산기

---

## 📋 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | 21-15-9 \| CrossFit & 웨이트리프팅 계산기 |
| **개발 기간** | 2024.01 ~ 2025.01 (지속적 업데이트) |
| **Live URL** | [21-15-9.com](https://21-15-9.com) |
| **GitHub** | [khjzzm/21159](https://github.com/khjzzm/21159) |
| **프로젝트 성격** | 개인 프로젝트 |
| **주요 사용자** | CrossFit 운동자, 웨이트리프터, 피트니스 애호가 |

### 💡 한 줄 소개
CrossFit의 대표 벤치마크 워크아웃 "Fran"의 rep scheme(21-15-9)에서 영감받아 개발한 **올인원 피트니스 계산기 웹 애플리케이션**

---

## 🎯 프로젝트 배경

### 문제 인식
- **단위 혼재 문제**: CrossFit 프로그래밍(lb) vs 국내 체육관(kg) 단위 불일치
- **복잡한 계산**: 웨이트리프팅 동작 간 상관관계 계산의 어려움
- **안전성 우려**: 1RM 테스트의 부상 위험성
- **정보 부족**: CrossFit Open 워크아웃 히스토리 정보 접근성 저하

### 해결 방안
- **통합 플랫폼**: 모든 계산을 한 곳에서 처리하는 올인원 솔루션
- **직관적 UX**: 복잡한 계산을 몇 초 만에 완료할 수 있는 인터페이스
- **모바일 최적화**: 체육관 현장에서 즉시 활용 가능한 반응형 디자인
- **데이터 아카이빙**: 15년간의 CrossFit Open 워크아웃 완전 기록

---

## 🛠 기술 스택

### Frontend
- **HTML5**, **CSS3**, **JavaScript (ES6+)**
- **jQuery 3.5.1** - DOM 조작 및 이벤트 처리
- **Responsive Design** - 모바일 퍼스트 접근

### 고급 기능
- **PWA (Progressive Web App)** - Service Worker, Manifest
- **LocalStorage** - 클라이언트 사이드 데이터 영속성
- **Google Analytics 4** - 사용자 행동 분석

### 배포 & 운영
- **GitHub Pages** - 정적 사이트 호스팅
- **Custom Domain** - 21-15-9.com
- **SEO 최적화** - Structured Data, Open Graph

---

## 🏆 핵심 기능

### 1. 🏋️‍♂️ 웨이트리프팅 동작 상관관계 계산기
```
백 스쿼트 기준 상관관계:
├── 스내치: 60-65%
├── 클린앤저크: 80-85%
└── 프론트 스쿼트: 85-93%
```
**특징:**
- 엘리트 선수 데이터 기반 정확한 비율 적용
- CrossFit 벤치마크 워크아웃 무게 설정에 활용
- 실시간 양방향 계산 지원

### 2. 📊 NSCA 1RM 계산기
**기능:**
- 1-10회 반복 데이터로 최대중량 추정
- 부상 위험 없는 안전한 1RM 테스트 대안
- 초보자도 쉽게 사용할 수 있는 직관적 인터페이스

**적용 공식:**
```javascript
1RM = weight × (1 + (reps / 30))  // NSCA 공식
```

### 3. ⚖️ lb ↔ kg 단위 변환기
**제공 기능:**
- 실시간 양방향 변환 (정확한 변환율: 2.20462262)
- 51-500lb 범위 상세 변환표
- CrossFit 워크아웃 표준 중량 변환 가이드

### 4. 🥇 바벨 플레이트 계산기
**구현 특징:**
- **올림픽 역도 국제 규격 완벽 재현**
- 실제 플레이트 색상 및 두께 시각화
  - 25kg(빨강), 20kg(파랑), 15kg(노랑), 10kg(초록), 5kg(흰색)
- 남자(20kg)/여자(15kg) 바벨 구분 지원
- 직관적인 시각적 피드백

### 5. 🚪 크로스핏 오픈 아카이브 (2011-2025)
**데이터 규모:**
- **15년간 모든 워크아웃 완전 기록**
- 75개+ 워크아웃 상세 정보
- 정확한 남녀 중량/박스 높이 구분

**기능:**
- 연도별 필터링 시스템
- 워크아웃 타입별 분류 (AMRAP, For Time, For Load)
- 시간 제한(Time Cap) 정보 제공

### 6. ⏱️ 크로스핏 타이머
**지원 모드:**
- **For Time** - 시간 기록 측정
- **AMRAP** - 정해진 시간 내 최대 라운드
- **EMOM** - 매분 정시 시작 워크아웃
- **TABATA** - 20초 운동 / 10초 휴식

**고급 기능:**
- 키보드 단축키 지원 (Space: 시작/정지, R: 리셋)
- 시각적/청각적 알림 시스템
- 모바일 가로모드 전체화면 최적화

### 7. 📈 방문자 추적 시스템
**클라이언트 사이드 추적:**
- 실시간 방문자 카운터 (오늘/총계)
- 30분 세션 타임아웃으로 중복 방지
- LocalStorage 기반 프라이버시 친화적 구현

**서버 사이드 분석:**
- Google Analytics 4 연동
- 사용자 행동 패턴 상세 분석

---

## 🎨 기술적 구현 포인트

### 반응형 디자인
```css
/* 중단점 설계 */
@media (max-width: 768px)  /* 태블릿 */
@media (max-width: 480px)  /* 모바일 */
```
- **모바일 퍼스트 접근법** 적용
- CrossFit 브랜드 컬러(#e60012) 활용한 일관된 디자인
- 다크모드 지원으로 사용자 경험 향상

### PWA 구현
```javascript
// Service Worker 캐싱 전략
const CACHE_NAME = '21-15-9-v1';
const urlsToCache = [
  '/',
  '/common.css',
  '/script.js',
  // ... 모든 핵심 리소스
];
```
- **오프라인 접근 가능**
- 홈화면 추가 기능 (Add to Home Screen)
- 네이티브 앱 수준의 사용자 경험

### 성능 최적화
- **CSS/JS 파일 버전 관리**: `?v=timestamp`로 캐시 무효화
- **SVG 아이콘 사용**: 벡터 그래픽으로 용량 최소화
- **지연 로딩**: 필요한 시점에 리소스 로드

### SEO 최적화
```html
<!-- Structured Data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "21-15-9",
  "applicationCategory": "HealthApplication"
}
</script>
```
- **Schema.org** 구조화 데이터 적용
- **Open Graph, Twitter Card** 소셜 미디어 최적화
- **커스텀 404 페이지** 사용자 경험 개선

---

## 📊 성과 및 임팩트

### 사용자 경험 개선
- ✅ **계산 시간 단축**: 복잡한 운동 계산을 몇 초 만에 완료
- ✅ **현장 활용도**: 모바일 최적화로 체육관에서 즉시 사용
- ✅ **접근성**: 초보자도 쉽게 사용할 수 있는 직관적 UI

### 데이터 정확성
- ✅ **과학적 근거**: NSCA 공식 기반 계산
- ✅ **엘리트 데이터**: 실제 선수 데이터 기반 상관관계
- ✅ **국제 규격**: 올림픽 역도 공식 규격 준수

### 커뮤니티 기여
- ✅ **정보 아카이빙**: 15년간 CrossFit Open 히스토리 보존
- ✅ **접근성 향상**: 한국 CrossFit 커뮤니티 정보 접근성 개선
- ✅ **오픈소스**: 무료 공개로 피트니스 생태계 기여

---

## 🚀 배운 점 & 성장 포인트

### 기술적 성장
**Vanilla JavaScript 심화:**
- 복잡한 상태 관리를 프레임워크 없이 구현
- 이벤트 기반 아키텍처 설계 경험
- 크로스 브라우저 호환성 확보

**웹 표준 기술 습득:**
- PWA 기술 스택 완전 이해
- 웹 접근성(WCAG) 가이드라인 적용
- SEO 최적화 실무 경험

### 비즈니스 관점
**틈새 시장 이해:**
- CrossFit 커뮤니티 특성 파악
- 사용자 페르소나 기반 기능 설계
- 실제 현장 니즈 반영

**데이터 기반 의사결정:**
- Google Analytics를 통한 사용자 행동 분석
- A/B 테스트를 통한 UI/UX 개선
- 지속적인 피드백 수렴 및 반영

### 프로젝트 관리
**장기 프로젝트 운영:**
- 1년 이상 지속적인 기능 추가 및 개선
- 버전 관리를 통한 안정적인 배포
- 사용자 피드백 기반 우선순위 설정

**확장 가능한 아키텍처:**
- 모듈별 기능 분리로 유지보수성 확보
- 새로운 계산기 추가 시 기존 코드 재사용
- 일관된 디자인 시스템 구축

---

## 💭 회고 및 개선점

### 성공 요인
1. **사용자 중심 설계**: 실제 체육관 현장에서의 사용성 고려
2. **점진적 개선**: MVP부터 시작해 지속적인 기능 추가
3. **커뮤니티 피드백**: 실제 사용자들의 의견을 적극 반영

### 아쉬운 점 및 개선 방향
1. **백엔드 시스템**: 사용자 데이터 저장을 위한 서버 구축 필요
2. **소셜 기능**: 기록 공유 및 랭킹 시스템 도입 검토
3. **데이터 분석**: 더 정교한 사용자 행동 분석 시스템 구축

---

## 🔗 링크 모음

- **🌐 Live Site**: [21-15-9.com](https://21-15-9.com)
- **💻 GitHub Repository**: [github.com/khjzzm/21159](https://github.com/khjzzm/21159)
- **📊 Google Analytics**: [상세 트래픽 분석 데이터]

---

## 📸 주요 스크린샷

### 메인 페이지
![메인 페이지](./screenshots/main-page.png)
*전체적인 UI/UX와 브랜딩 요소*

### 바벨 플레이트 계산기
![플레이트 계산기](./screenshots/plate-calculator.png)
*올림픽 역도 규격의 시각적 구현*

### 크로스핏 오픈 아카이브
![오픈 아카이브](./screenshots/open-archive.png)
*15년간의 데이터 아카이빙 시스템*

### 모바일 반응형
![모바일 뷰](./screenshots/mobile-responsive.png)
*다양한 디바이스에서의 완벽한 호환성*

---

*"Fran부터 1RM까지, 모든 계산을 한 번에" - 21-15-9의 철학* 