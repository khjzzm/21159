# 21-15-9 | CrossFit & 웨이트리프팅 계산기

**Fran부터 1RM까지** - CrossFit의 가장 유명한 벤치마크 워크아웃 "Fran"의 rep scheme에서 영감을 받은 종합 트레이닝 계산기입니다. 웨이트리프팅 동작 간의 상관관계를 계산하고 NSCA 공식을 기반으로 1RM을 추정하여 CrossFit 박스와 웨이트룸에서의 성과를 극대화하세요.

🌐 **Live Site**: [21-15-9.com](https://21-15-9.com)

## 주요 기능

### 🏋️‍♂️ 웨이트리프팅 & CrossFit 동작 상관관계 계산
- 백 스쿼트 기준 상관관계 (스내치, 클린 앤 저크, 프론트 스쿼트)
- 클린 앤 저크 기준 상관관계 (프론트 스쿼트, 스내치)
- CrossFit 특화 동작 간 상관관계 (파워 클린/스내치, 푸시 프레스)
- Fran, Grace, Isabel 등 벤치마크 워크아웃에 최적화

### 📊 NSCA 1RM 계산기
- 스쿼트, 벤치프레스, 데드리프트의 1RM-10RM 추정
- NSCA 공식 기반 정확한 계산
- KG/LB 단위 변환 지원
- CrossFit 워크아웃 스케일링에 활용

### 👥 방문자수 추적 시스템
- **실시간 방문자 카운터**: 오늘 방문자수 및 총 방문자수 표시
- **중복 방문 방지**: 30분 세션 타임아웃으로 정확한 집계
- **Google Analytics 4 연동**: 상세한 웹사이트 분석 및 통계
- **프라이버시 친화적**: LocalStorage 기반 클라이언트 사이드 추적

### 🚫 사용자 친화적 404 페이지 (NEW!)
- **CrossFit 테마 디자인**: 브랜드 일관성 유지
- **빠른 네비게이션**: 메인 페이지 및 인기 페이지 바로가기
- **에러 추적**: Google Analytics로 404 에러 분석
- **반응형 디자인**: 모든 디바이스에서 최적화된 경험

### 💾 데이터 관리
- 계산 결과 저장 및 불러오기
- 결과 공유 및 클립보드 복사 기능
- 로컬 스토리지를 활용한 데이터 보관

## 기술 스택

- HTML5
- CSS3 (반응형 디자인)
- JavaScript (ES6+)
- jQuery 3.5.1
- Google Analytics 4

## 설치 및 실행

1. 저장소 클론
```bash
git clone https://github.com/khjzzm/21159.git
```

2. 웹 서버 실행
- 로컬 웹 서버를 사용하여 프로젝트 실행
- 또는 `index.html` 파일을 브라우저에서 직접 열기

3. Google Analytics 설정 (선택사항)
- `ANALYTICS_SETUP.md` 파일의 가이드를 따라 Google Analytics 설정
- `index.html`에서 `GA_MEASUREMENT_ID`를 실제 측정 ID로 교체

## 브라우저 지원

- Chrome (최신 버전)
- Firefox (최신 버전)
- Safari (최신 버전)
- Edge (최신 버전)

## CrossFit 벤치마크 워크아웃

이 계산기는 다음과 같은 CrossFit 벤치마크 워크아웃에 도움이 됩니다:

- **Fran**: 21-15-9 스러스터 & 풀업
- **Grace**: 30 클린 앤 저크 for time
- **Isabel**: 30 스내치 for time
- **Helen**: 3라운드 - 400m 런, 21 케틀벨 스윙, 12 풀업

## 방문자수 추적 기능

### 로컬 카운터
- 실시간 오늘 방문자수 및 총 방문자수 표시
- 브라우저 LocalStorage를 활용한 데이터 저장
- 30분 세션 타임아웃으로 중복 방문 방지

### 개발자 도구 명령어
```javascript
getVisitorStats()           // 현재 방문자 통계 조회
resetVisitorCounters()      // 방문자 카운터 초기화 (관리자용)
```

### Google Analytics
- 상세한 방문자 분석 및 행동 패턴 추적
- 실시간 데이터 및 히스토리컬 리포트
- 페이지별, 디바이스별, 지역별 통계
- 404 에러 추적 및 분석

## 파일 구조

```
21-15-9/
├── index.html              # 메인 페이지
├── 404.html                # 사용자 친화적 404 에러 페이지
├── visitor-counter.js      # 방문자수 추적 시스템
├── ANALYTICS_SETUP.md      # Google Analytics 설정 가이드
├── common.css              # 공통 스타일
├── index.css               # 메인 페이지 스타일
├── script.js               # 메인 JavaScript
├── pwa.js                  # PWA 기능
├── weightlifting/          # 웨이트리프팅 계산기
├── 1rm/                    # 1RM 계산기
├── convert/                # lb↔kg 변환기
├── plates/                 # 플레이트 계산기
└── [기타 에셋들]
```

## 라이선스

MIT License

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 연락처

프로젝트 관리자 - [@khjzzm](https://github.com/khjzzm)

프로젝트 링크: [https://github.com/khjzzm/21159](https://github.com/khjzzm/21159) 