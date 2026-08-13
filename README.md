# skala-vue

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

---

## 종합실습 (Weather Hands-on)

`종합실습가이드_Vue.js_(우재남)Day4-3` 1.3절 기준으로, `ExerciseApp.vue`는 **블록 4개**로 구성됩니다.
④번은 화면을 여러 개 만드는 것이 아니라, 라우터 블록 하나가 Store → Axios → UI Library → Refinement →
Deployment 순서로 계속 진화한 최종 상태입니다. (`src/App.vue`의 `MODE = 'exercise'`일 때 확인)

| 블록 | 내용 | 위치 |
|---|---|---|
| ① Mockup | v-for/:key, v-if 조건부 렌더링, :value/@input 바인딩, 이벤트 수식어(.stop) | `src/components/exercise/WeatherMockup.vue` |
| ② Composition | reactive 상태, computed(filteredWeatherList), watch, watchEffect | `src/components/exercise/WeatherComposition.vue` |
| ③ Component | WeatherParent/BaseDashboardCard/SearchBar/WeatherCard 4분리 (props/emits/slot) | `src/components/exercise/practice3/` |
| ④ Router→Store→Axios→UI Library→Refinement→Deployment | 아래 표 참고 | `src/views/exercise/practice4/`, `src/components/exercise/practice4/`, `src/stores/configStore.js`, `src/api/weatherApi.js` |

④ 블록 안에서 실습별 요구사항이 반영된 위치:

| 실습 | 반영 내용 |
|---|---|
| Router | Lazy Loading(`() => import(...)`), Catch-all Route, `router.push`로 상세 이동, URL 쿼리(`?q=`) 동기화 |
| Store | `stores/configStore.js`(unit/unitSymbol/toggleUnit) + `UnitToggler.vue`를 Navigation Bar 옆에 배치 |
| Axios | `src/api/weatherApi.js` — Open-Meteo Forecast(실시간 날씨 + 시간별 예보) + Geocoding을 axios/async-await로 연동 |
| UI Library | Element Plus(el-card/el-input/el-tag/el-button/el-alert/el-skeleton) 적용 |
| Refinement | 위 라이브러리 적용 + 로딩/빈 상태 처리로 정비, 이 README로 문서화 |
| Deployment | 아래 "배포" 절 참고 |

### 실행 준비

```bash
npm install
npm run dev
```

Open-Meteo의 키 없는 공개 API를 사용하므로 별도 환경변수 없이 ④ 블록의 실시간 날씨와 예보가 동작합니다.
공개 API가 일시적으로 429 또는 네트워크 오류를 반환하면 화면이 비지 않도록 25~35℃ 임시 데이터로 대체됩니다.

### 배포 (Step 1~4)

```bash
# Step 1. ESLint 에러 0건
npm run format
npm run lint

# Step 2. 비밀키 미포함 확인
git grep -nE "[0-9a-f]{32}" -- src/

# Step 3. 빌드 — GitHub Pages 로 배포한다면 vite.config.js 에 아래 한 줄을 먼저 추가한다
#   base: '/skala-vue/'   (저장소 이름과 동일해야 함. 로컬 개발 주소가 http://localhost:5173/skala-vue/ 로 바뀐다)
npm run build

# Step 4. GitHub Pages 배포
npm install -D gh-pages   # package.json에는 이미 등록되어 있어 npm install만 해도 됨
npm run deploy            # build 후 dist/를 gh-pages 브랜치로 푸시
```

배포 후 GitHub 저장소 Settings → Pages 에서 브랜치를 `gh-pages` / `(root)`로 지정하면
`https://계정명.github.io/skala-vue/` 에서 확인할 수 있습니다. (Netlify·Vercel·S3 등 다른 정적 호스팅도 동일하게 인정됩니다.)

### 최종 제출 체크리스트

1. `npm run lint` 에러 0건 (경고는 허용)
2. API 키가 소스에 없다 (`git grep`으로 확인)
3. `.env.local`이 커밋되지 않았다
4. `node_modules`가 Git에 없다
5. 저장소가 Public이다
6. `src/App.vue`의 `MODE`가 `'exercise'`다
7. `components/exercise/` · `views/` · `stores/`에 과제 파일이 모두 있다
8. 배포 주소가 시크릿 창에서 정상적으로 열린다
9. 이 README에 배포 주소를 적어 둔다 → **배포 주소: https://gitwan032.github.io/skala-vue/**
