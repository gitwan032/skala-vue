# Weather Web Service

Vue 3 + Vue Router + Pinia + Axios + Element Plus로 만든 실시간 날씨 웹 서비스입니다.

이 프로젝트는 "종합실습1~9" 과제와는 **완전히 별개의 프로젝트**입니다. 종합실습이 각 개념(v-for/v-if,
Composition API, 컴포넌트 분리, Router, Pinia, Axios, UI 라이브러리, 정비, 배포)을 하나씩 따로 보여주는
학습용 결과물이라면, 이 프로젝트는 그 개념들을 실제로 하나의 완결된 서비스로 통합한 결과물입니다.

## 실행 방법

```bash
npm install
cp .env.example .env   # OpenWeatherMap API 키 설정
npm run dev
```

`.env` 파일에 `VITE_OPENWEATHER_API_KEY` 값을 https://openweathermap.org 에서 발급받은 본인 키로 채워야
날씨 데이터가 정상적으로 조회됩니다.

## 주요 기능

- 도시명 검색 (한글/영문) → Open-Meteo Geocoding API로 좌표 변환 → OpenWeatherMap API로 실시간 날씨 + 시간별 예보 조회
- 홈 화면에 즐겨찾는 국내 주요 도시(서울/수원/부산/인천) 날씨를 자동으로 미리보기
- 도시 상세 페이지(`/city/:cityName`, 동적 라우트)에서 상세 정보 + 예보 확인
- 상단 네비게이션에서 언제든 섭씨/화씨 단위 전환 (Pinia 전역 상태, 모든 화면에 즉시 반영)
- Element Plus 기반 UI(카드, 입력창, 스켈레톤 로딩, 알림 등)
- Vue Router Lazy Loading + Catch-all Route(404 페이지)
- **전국 명산 컬렉션** (`/mountains`): 전국 6개 권역(수도권/강원권/충청권/전라권/경상권/제주권) 명산 30곳을 자료화
  - 가나다순 전체 보기, 🌄 아름다운 산, 🥵 힘든 산, 📍 지역별 5개 소개 등 4가지 기준으로 필터링
  - 표고·코스 특성 기준으로 초급/중급/고급 난이도 분류 및 기준 안내
  - 산마다 **월별 인증 도장** 찍기 — 이번 달에 이미 인증했으면 도장이 그대로 표시되고, 안 했다면 버튼으로 새로 인증
  - 인증 기록은 브라우저에 저장되어(localStorage) 새로고침해도 유지, 상단에 전체 컬렉션 진행률 표시

## 폴더 구조

```
src/
├── main.js / App.vue          # 앱 진입점, 상단 네비게이션 + 단위 전환 버튼
├── router/index.js             # Home / CityDetail(:cityName) / About / NotFound, lazy loading
├── stores/configStore.js        # 단위(섭씨/화씨) 전역 상태
├── api/weatherApi.js            # axios 기반 Open-Meteo + OpenWeatherMap 연동
├── stores/mountainStore.js      # 산 인증 도장(월별) 상태 관리, localStorage 영속화
├── data/mountains.js            # 전국 명산 30곳 데이터 (지역/높이/난이도/설명)
├── components/
│   ├── SearchBar.vue
│   ├── WeatherCard.vue
│   └── ForecastStrip.vue
└── views/
    ├── HomeView.vue
    ├── CityDetailView.vue
    ├── WeatherUILibrary.vue     # 전국 명산 컬렉션 + 인증 도장 화면 (/mountains)
    ├── AboutView.vue
    └── NotFoundView.vue
```

## 빌드 & 배포

```bash
npm run lint 2>/dev/null || true   # (이 프로젝트엔 별도 ESLint 미포함 - 필요시 추가)
npm run build                # 기본 프로덕션 빌드
npm run build:staging        # --mode staging
npm run build:production     # --mode production
```

빌드 후 `dist/` 폴더를 Netlify, Vercel, Nginx 등 원하는 정적 호스팅에 업로드하면 배포가 완료됩니다.
`.env`는 `.gitignore`에 등록되어 있어 API 키가 Git에 올라가지 않습니다.
