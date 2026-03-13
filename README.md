# 21-15-9 | CrossFit & 웨이트리프팅 계산기

**Fran부터 1RM까지** - CrossFit의 가장 유명한 벤치마크 워크아웃 "Fran"의 rep scheme에서 영감을 받은 종합 트레이닝 도구입니다. 웨이트리프팅 동작 간의 상관관계를 계산하고, NSCA 공식을 기반으로 1RM을 추정하며, 오픈 워크아웃 아카이브부터 히어로 WOD, 역도 세계 기록, 크로스핏 타이머까지 CrossFit 박스와 웨이트룸에서 필요한 모든 도구를 제공합니다.

🌐 **Live Site**: [21-15-9.com](https://21-15-9.com)

## 주요 기능

### 🏋️‍♂️ 웨이트리프팅 동작 상관관계
- 백 스쿼트 기준 상관관계 (스내치 60~65%, 클린 앤 저크 80~85%, 프론트 스쿼트 85~93%)
- 클린 앤 저크 기준 상관관계 (프론트 스쿼트 85~90%, 스내치 80~85%)
- CrossFit 특화 동작 간 상관관계 (파워 클린→클린, 파워 스내치→스내치, 푸시 프레스→저크)
- 클린, 저크, 데드리프트, 푸시 프레스 등 8개 동작 지원
- 입력 즉시 모든 연관 동작의 수행 가능 범위 자동 계산
- KG/LB 실시간 단위 변환 및 변환 무게 동시 표시

### 📊 NSCA 기반 1RM 최대중량
- 스쿼트, 벤치프레스, 데드리프트의 1RM부터 10RM까지 추정
- NSCA(National Strength and Conditioning Association) 공식 기반 정확한 계산
- 반복 횟수(1~10회)와 무게 입력으로 모든 RM 값 자동 산출
- 입력한 반복 횟수에 해당하는 RM 결과 강조 표시
- KG/LB 단위 변환 지원 및 변환 무게 동시 표시

### ⚖️ LB / KG Converter
- 파운드(LB)와 킬로그램(KG) 간 실시간 무게 단위 변환
- 소수점 둘째 자리까지 정밀한 변환 결과 제공

### 🔩 Plate Calculator
- 올림픽 규격 바벨 플레이트 조합 시각화
- 목표 무게에 필요한 플레이트 조합 자동 계산
- KG/LB 바벨 규격 모두 지원

### 🏆 CrossFit Open 워크아웃 아카이브
- 2011년부터 2026년까지 모든 CrossFit Open 워크아웃 완전 수록
- 연도별 드롭다운 필터링으로 원하는 연도 워크아웃만 보기
- 모든 워크아웃의 남녀별 중량 및 박스 높이 정확하게 구분
- AMRAP, For Time, For Load 등 워크아웃 타입 명확한 분류
- 각 워크아웃의 정확한 Time Cap 정보 표기
- 카드 클릭으로 워크아웃 내용 클립보드 복사

### 🧑‍🚒 Hero & Tribute Workouts
- 243개 크로스핏 히어로 & 트리뷰트 워크아웃 전체 아카이브
- 워크아웃 이름 또는 운동 동작으로 실시간 검색
- 각 워크아웃의 헌정 대상(Tribute) 및 배경 스토리 토글 표시
- RX 기준 무게 및 동작 표기
- 더블 클릭으로 워크아웃 내용 클립보드 복사

### 🥇 Weightlifting Record
- IWF 남녀 역도 세계 기록 현황 완전 수록
- 체급별 상세 정보: 남자 61kg부터 +109kg, 여자 45kg부터 +87kg 모든 체급
- 인상(Snatch), 용상(Clean & Jerk), 합계(Total) 3개 부문 완전 분리
- 각 기록의 선수, 국가, 대회, 날짜 정보 제공

### ⏱️ Timer
- For Time, AMRAP, EMOM, TABATA 4가지 타이머 모드 지원
- 시작 전 10초 준비시간(Countdown) 기능
- 경고 색상 변화 및 비프음으로 시간 알림
- 키보드 단축키: 스페이스바(시작/일시정지), R키(리셋), 1~4키(모드 변경)
- 모바일 가로 모드에서 전체 화면 타이머 경험
- 백그라운드 탭 전환 시에도 정확한 시간 동기화

### 💪 The Girls — CrossFit Benchmark WODs
- Fran, Grace, Diane 등 16개 벤치마크 WOD 수록
- 레벨별 목표 시간 가이드 (Beginner / Intermediate / Advanced / Elite)
- 남녀별 레벨 기준 분리
- 개인 기록(PR) 입력 및 localStorage 저장
- 현재 레벨 자동 판별 및 시각화

### 📊 Open Percentile
- 크로스핏 오픈 점수 입력 → 한국 참가자 중 상위 몇% 실시간 계산
- CrossFit Games 리더보드 API 기반 (Korea, RX 기준)
- 2024~2026 오픈 지원, 남녀 구분
- 완료(시간) / 타임캡(렙수) 입력 모드
- 샘플링 기반 순위 추정 및 퍼센타일 바 시각화

### 🚣 Erg Calculator
- 로잉, 스키에르그, 어썰트바이크 페이스 & 칼로리 계산기
- 거리/칼로리 ↔ 페이스/칼로리레이트 양방향 변환
- Concept2 공식 기반 체중 보정 칼로리 표시
- 장비별 독립 패널 및 실시간 계산

### 🔍 Search WOD
- 동작, 장비별 크로스핏 워크아웃 검색
- 필터 조합으로 원하는 WOD 찾기

### 🎲 Random WOD
- 랜덤 크로스핏 워크아웃 생성기

### 💾 데이터 관리
- 계산 결과 로컬 스토리지 저장 및 불러오기
- 결과 공유 및 클립보드 복사 기능
- 웨이트리프팅과 1RM 데이터 독립적 저장/관리

### 📱 PWA (Progressive Web App)
- 앱 설치 프롬프트 지원
- Service Worker 기반 오프라인 캐싱
- 오프라인/온라인 상태 감지 및 알림

### 👥 방문자수 추적 시스템
- 실시간 오늘 방문자수 및 총 방문자수 표시
- 30분 세션 타임아웃으로 중복 방문 방지
- Google Analytics 4 연동 상세 분석
- LocalStorage 기반 클라이언트 사이드 추적

### 🚫 404 페이지
- CrossFit 테마 디자인으로 브랜드 일관성 유지
- 메인 페이지 및 인기 페이지 바로가기 제공

## 기술 스택

- HTML5
- CSS3 (반응형 디자인)
- JavaScript (ES6+)
- Google Analytics 4
- PWA (Service Worker)

## 설치 및 실행

1. 저장소 클론
```bash
git clone https://github.com/khjzzm/21159.git
```

2. 웹 서버 실행
- 로컬 웹 서버를 사용하여 프로젝트 실행
- 또는 `index.html` 파일을 브라우저에서 직접 열기

## 브라우저 지원

- Chrome (최신 버전)
- Firefox (최신 버전)
- Safari (최신 버전)
- Edge (최신 버전)

## 파일 구조

```
21-15-9/
├── index.html              # 랜딩 페이지
├── 404.html                # 404 에러 페이지
├── sw.js                   # Service Worker (오프라인 캐싱)
├── manifest.json           # PWA 매니페스트
├── css/                    # 공통 스타일
│   ├── common.css          # 변수, 리셋, 기본 요소
│   ├── nav.css             # 네비게이션 및 사이드바
│   └── index.css           # 랜딩 페이지
├── js/                     # 공통 스크립트
│   ├── script.js           # 단위 변환, 토스트, 사이드바
│   ├── landing.js          # 랜딩 페이지 애니메이션
│   ├── input-validation.js # 입력 필드 유효성 검사
│   ├── pwa.js              # PWA 설치 프롬프트, 업데이트 알림
│   └── visitor-counter.js  # 방문자수 추적
├── assets/                 # 이미지 및 아이콘
│   ├── favicon.svg         # 파비콘
│   ├── icon-192.svg        # PWA 아이콘 192x192
│   ├── icon-512.svg        # PWA 아이콘 512x512
│   └── og-image.svg        # Open Graph 이미지
├── weightlifting/          # 웨이트리프팅 동작 상관관계
│   ├── index.html
│   ├── weightlifting.js
│   └── weightlifting.css
├── nsca/                   # NSCA 기반 1RM 최대중량
│   ├── index.html
│   ├── 1rm.js
│   └── 1rm.css
├── convert/                # LB / KG Converter
│   ├── index.html
│   ├── convert.js
│   └── convert.css
├── plates/                 # Plate Calculator
│   ├── index.html
│   ├── plates.js
│   └── plates.css
├── crossfit-wod/           # CrossFit Open 워크아웃 아카이브
│   ├── index.html
│   ├── open.js
│   └── open.css
├── hero-wod/               # Hero & Tribute Workouts
│   ├── index.html
│   ├── hero-wod.js
│   ├── hero-wod.css
│   └── hero_data.js
├── weightlifting-record/  # Weightlifting Record
│   ├── index.html
│   ├── records.js
│   └── records.css
├── timer/                  # 크로스핏 타이머
│   ├── index.html
│   ├── timer.js
│   └── timer.css
├── the-girls/              # The Girls 벤치마크 WOD
│   ├── index.html
│   ├── the-girls.js
│   └── the-girls.css
├── open-percentile/        # 오픈 퍼센타일 계산기
│   ├── index.html
│   ├── percentile.js
│   └── percentile.css
├── erg/                    # Erg Calculator
│   ├── index.html
│   ├── erg.js
│   └── erg.css
├── search-wod/             # Search WOD
│   ├── index.html
│   └── search-wod.css
└── random-wod/             # Random WOD
    ├── index.html
    └── random-wod.css
```
