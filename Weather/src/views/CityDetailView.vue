<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConfigStore } from '../stores/configStore.js'
import {
  QUICK_CITIES,
  TEMPORARY_WEATHER_MODE,
  fetchAllQuickCities,
  fetchDetailedWeatherByCityName,
  weatherCodeEmoji,
  weatherCodeLabel
} from '../api/weatherApi.js'

const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()
const loading = ref(true)
const error = ref('')
const place = ref(null)
const detail = ref(null)
const cityWeather = ref({})
const query = ref('')

const c = (value) => `${configStore.convert(Number(value || 0))}${configStore.unitSymbol}`
const current = computed(() => detail.value?.current || {})
const daily = computed(() => detail.value?.daily || {})
const hourly = computed(() => detail.value?.hourly || {})
const nowIndex = computed(() => Math.max(0, hourly.value.time?.findIndex((t) => t >= current.value.time) ?? 0))
const hourRows = computed(() => Array.from({ length: 12 }, (_, offset) => {
  const i = nowIndex.value + offset
  return {
    time: offset === 0 ? '지금' : new Date(hourly.value.time?.[i]).toLocaleTimeString('ko-KR', { hour: 'numeric' }),
    icon: weatherCodeEmoji(hourly.value.weather_code?.[i], isDayAt(hourly.value.time?.[i])),
    temp: hourly.value.temperature_2m?.[i],
    rain: hourly.value.precipitation_probability?.[i]
  }
}).filter((row) => row.temp !== undefined))
const weekRows = computed(() => (daily.value.time || []).slice(0, 7).map((time, i) => ({
  day: i === 0 ? '오늘' : new Date(`${time}T12:00:00`).toLocaleDateString('ko-KR', { weekday: 'short' }),
  icon: weatherCodeEmoji(daily.value.weather_code[i]),
  min: daily.value.temperature_2m_min[i],
  max: daily.value.temperature_2m_max[i],
  rain: daily.value.precipitation_probability_max[i]
})))
const rangeMin = computed(() => Math.min(...(daily.value.temperature_2m_min || [0])))
const rangeMax = computed(() => Math.max(...(daily.value.temperature_2m_max || [1])))
const weatherClass = computed(() => {
  const code = current.value.weather_code ?? 0
  if (!current.value.is_day) return 'night'
  if (code >= 95) return 'storm'
  if (code >= 51) return 'rain'
  if (code >= 3) return 'cloudy'
  return 'clear'
})
const windDirection = computed(() => {
  const names = ['북', '북동', '동', '남동', '남', '남서', '서', '북서']
  return names[Math.round((current.value.wind_direction_10m || 0) / 45) % 8]
})
const aqiLabel = computed(() => {
  const aqi = detail.value?.air?.us_aqi ?? 0
  return aqi <= 50 ? '좋음' : aqi <= 100 ? '보통' : aqi <= 150 ? '민감군 주의' : '나쁨'
})
const uvLabel = computed(() => {
  const uv = hourly.value.uv_index?.[nowIndex.value] ?? 0
  return uv < 3 ? '낮음' : uv < 6 ? '보통' : uv < 8 ? '높음' : '매우 높음'
})
const visibility = computed(() => Math.round((hourly.value.visibility?.[nowIndex.value] || 0) / 1000))
const deviation = computed(() => {
  const avg = ((daily.value.temperature_2m_max?.[0] || 0) + (daily.value.temperature_2m_min?.[0] || 0)) / 2
  const next = (daily.value.temperature_2m_max || []).slice(1, 7)
  const normal = next.length ? next.reduce((a, b) => a + b, 0) / next.length : avg
  return avg - normal
})
const sunEvent = computed(() => {
  const isDay = Boolean(current.value.is_day)
  return { label: isDay ? '일몰' : '일출', value: isDay ? daily.value.sunset?.[0] : daily.value.sunrise?.[0] }
})
const editorialDate = computed(() => new Date().toLocaleDateString('ko-KR', {
  month: 'long', day: 'numeric', weekday: 'short'
}))
const outfitItems = computed(() => {
  const temp = current.value.apparent_temperature ?? current.value.temperature_2m ?? 0
  if (temp >= 28) return ['반팔', '얇은 셔츠', '반바지', '면바지']
  if (temp >= 23) return ['반팔', '얇은 셔츠', '면바지', '가벼운 겉옷']
  if (temp >= 17) return ['긴팔', '얇은 니트', '청바지', '바람막이']
  if (temp >= 10) return ['니트', '재킷', '긴바지', '얇은 코트']
  return ['두꺼운 니트', '패딩', '기모 바지', '목도리']
})
function isDayAt(time) {
  if (!time || !daily.value.sunrise?.[0]) return current.value.is_day
  const stamp = new Date(time).getTime()
  return stamp >= new Date(daily.value.sunrise[0]).getTime() && stamp < new Date(daily.value.sunset[0]).getTime()
}
const clock = (time) => time ? new Date(time).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' }) : '-'
const barStyle = (row) => {
  const span = Math.max(1, rangeMax.value - rangeMin.value)
  return { left: `${((row.min - rangeMin.value) / span) * 62}%`, width: `${Math.max(16, ((row.max - row.min) / span) * 62)}%` }
}
const load = async (name) => {
  loading.value = true; error.value = ''
  try {
    const result = await fetchDetailedWeatherByCityName(name)
    if (!result.place) throw new Error('검색 결과가 없습니다.')
    place.value = result.place; detail.value = result.detail
  } catch (e) { error.value = e.message || '날씨를 불러오지 못했습니다.' }
  finally { loading.value = false }
}
const search = () => { if (query.value.trim()) router.push(`/city/${encodeURIComponent(query.value.trim())}`) }
onMounted(() => {
  load(route.params.cityName)
  fetchAllQuickCities().then((data) => { cityWeather.value = data }).catch(() => {})
})
watch(() => route.params.cityName, (name) => name && load(name))
</script>

<template>
  <div class="weather-window" :class="`weather-${weatherClass}`">
    <aside class="weather-sidebar">
      <div class="traffic"><i></i><i></i><i></i><span>▣</span></div>
      <form class="side-search" @submit.prevent="search"><button type="submit" aria-label="도시 검색">⌕</button><input v-model="query" placeholder="도시 검색" @keyup.enter.prevent="search" /></form>
      <div class="city-list">
        <button v-for="city in QUICK_CITIES" :key="city.id" :class="{ selected: route.params.cityName.includes(city.name) }" @click="router.push(`/city/${city.name}`)">
          <span><b>{{ city.region }}</b><small>{{ new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' }) }}</small></span>
          <strong>{{ cityWeather[city.id] ? configStore.convert(cityWeather[city.id].main.temp) : '–' }}{{ cityWeather[city.id] ? configStore.unitSymbol : '' }}</strong>
          <em>{{ cityWeather[city.id]?.weather?.[0]?.description || '날씨 불러오는 중' }}</em>
          <small>최고:{{ cityWeather[city.id] ? configStore.convert(cityWeather[city.id].main.temp_max) : '–' }}{{ cityWeather[city.id] ? configStore.unitSymbol : '' }}&nbsp; 최저:{{ cityWeather[city.id] ? configStore.convert(cityWeather[city.id].main.temp_min) : '–' }}{{ cityWeather[city.id] ? configStore.unitSymbol : '' }}</small>
        </button>
      </div>
    </aside>

    <main v-if="!loading && detail" class="weather-content">
      <section class="editorial-current-card">
        <a class="home-link" @click="router.push('/')">‹ 모든 도시</a>
        <header class="editorial-city">
          <h1>{{ place.name }}</h1>
          <p>현재 위치 · {{ editorialDate }}</p>
        </header>
        <div class="editorial-reading">
          <div class="editorial-icon" aria-hidden="true">{{ weatherCodeEmoji(current.weather_code, current.is_day) }}</div>
          <div class="editorial-data">
            <div class="editorial-temp">{{ configStore.convert(current.temperature_2m) }}<sup>{{ configStore.unitSymbol }}</sup></div>
            <p class="editorial-condition">{{ weatherCodeLabel(current.weather_code) }}</p>
            <div class="editorial-range"><span>↓ {{ c(daily.temperature_2m_min[0]) }}</span><span>↑ {{ c(daily.temperature_2m_max[0]) }}</span></div>
            <div class="editorial-controls" aria-label="시간대 둘러보기"><button>≪</button><button>▷</button><button>≫</button></div>
          </div>
        </div>
        <section class="outfit-panel">
          <div class="outfit-title"><span>♧</span><div><h2>더움</h2><p>{{ place.name }} {{ c(current.temperature_2m) }} 기준</p></div></div>
          <div class="outfit-chips"><span v-for="item in outfitItems" :key="item">{{ item }}</span></div>
          <div class="sun-times"><span>☀︎ {{ clock(daily.sunrise[0]) }}</span><span>☀︎ {{ clock(daily.sunset[0]) }}</span></div>
        </section>
      </section>

      <section class="glass-card hourly-card editorial-hourly">
        <p class="hourly-title">{{ place.name }} · HOURLY FORECAST</p>
        <p class="summary">오늘은 {{ weatherCodeLabel(current.weather_code) }} 상태입니다. 돌풍은 최대 {{ Math.round(current.wind_gusts_10m || 0) }}m/s입니다.</p>
        <div class="hourly-scroll">
          <div v-for="hour in hourRows" :key="hour.time" class="hour"><b>{{ hour.time }}</b><small v-if="hour.rain">{{ hour.rain }}%</small><span>{{ hour.icon }}</span><strong>{{ c(hour.temp) }}</strong></div>
        </div>
      </section>

      <div class="dashboard-grid">
        <section class="glass-card forecast-card wide-card">
          <h2>▦ 7일간의 일기예보 {{ TEMPORARY_WEATHER_MODE ? '· 임시 데이터' : '' }}</h2>
          <div v-for="row in weekRows" :key="row.day" class="day-row"><b>{{ row.day }}</b><span class="day-icon">{{ row.icon }} <small v-if="row.rain">{{ row.rain }}%</small></span><em>{{ c(row.min) }}</em><div class="temp-range"><i :style="barStyle(row)"></i></div><strong>{{ c(row.max) }}</strong></div>
        </section>

        <section class="glass-card metric-card air-card"><h2>◌ 대기질</h2><div class="metric-big">{{ Math.round(detail.air?.us_aqi || 0) }}</div><b>{{ aqiLabel }}</b><div class="air-scale"><i :style="{ left: `${Math.min(100, (detail.air?.us_aqi || 0) / 2)}%` }"></i></div><p>PM2.5 {{ Math.round(detail.air?.pm2_5 || 0) }}㎍/㎥ · 현재 대기 상태입니다.</p></section>
        <section class="glass-card metric-card wind-card"><h2>≋ 바람 · 산 정상</h2><div class="wind-layout"><div><p>바람 <b>{{ current.wind_speed_10m }}m/s</b></p><p>돌풍 <b>{{ current.wind_gusts_10m }}m/s</b></p><p>방향 <b>{{ windDirection }} {{ current.wind_direction_10m }}°</b></p></div><div class="compass"><i :style="{ transform: `rotate(${current.wind_direction_10m + 180}deg)` }">➤</i><b>{{ windDirection }}</b><small>{{ current.wind_speed_10m }}<br>m/s</small></div></div><p class="mountain-note">고지대는 돌풍이 더 강할 수 있습니다.</p></section>
        <section class="glass-card metric-card"><h2>☀ 자외선 지수</h2><div class="metric-big">{{ Math.round(hourly.uv_index[nowIndex] || 0) }}</div><b>{{ uvLabel }}</b><div class="uv-scale"></div><p>자외선 차단제를 준비하세요.</p></section>
        <section class="glass-card metric-card sun-card"><h2>♨ {{ sunEvent.label }}</h2><div class="metric-big">{{ clock(sunEvent.value) }}</div><div class="sun-arc"><i :class="{ moon: !current.is_day }"></i></div><p>{{ current.is_day ? `일출: ${clock(daily.sunrise[0])}` : `일몰: ${clock(daily.sunset[0])}` }}</p></section>
        <section class="glass-card metric-card"><h2>♨ 체감 온도</h2><div class="metric-big">{{ c(current.apparent_temperature) }}</div><p>실제 기온과 {{ Math.abs(current.apparent_temperature-current.temperature_2m).toFixed(1) }}° 차이납니다.</p></section>
        <section class="glass-card metric-card"><h2>💧 강수량</h2><div class="metric-big">{{ current.precipitation }}mm</div><b>현재</b><p>오늘 총 {{ daily.precipitation_sum[0] }}mm 예상</p></section>
        <section class="glass-card metric-card"><h2>◉ 가시거리</h2><div class="metric-big">{{ visibility }}km</div><p>현재 시야가 {{ visibility >= 10 ? '좋습니다.' : '제한적입니다.' }}</p></section>
        <section class="glass-card metric-card"><h2>≋ 습도</h2><div class="metric-big">{{ current.relative_humidity_2m }}%</div><p>체감 온도에 반영된 현재 습도입니다.</p></section>
        <section class="glass-card metric-card pressure-card"><h2>◉ 기압</h2><div class="gauge"><i :style="{ transform: `rotate(${Math.max(-110, Math.min(110, (current.surface_pressure-1013)*3))}deg)` }"></i><b>{{ Math.round(current.surface_pressure).toLocaleString() }}</b><small>hPa</small></div></section>
        <section class="glass-card metric-card"><h2>⌁ 평균</h2><div class="metric-big">{{ deviation >= 0 ? '+' : '' }}{{ deviation.toFixed(1) }}°</div><b>일일 평균 최고 기온과의 차이</b><p>오늘 평균 {{ c((daily.temperature_2m_max[0]+daily.temperature_2m_min[0])/2) }}</p></section>
      </div>
      <footer>{{ place.name }} 날씨 · {{ TEMPORARY_WEATHER_MODE ? '25~35℃ 임시 예보 데이터' : 'Open-Meteo 실시간 데이터' }}</footer>
    </main>
    <main v-else class="weather-content state"><p v-if="loading">날씨를 불러오는 중…</p><p v-else>{{ error }}</p></main>
  </div>
</template>

<style scoped>
.weather-window{--glass:rgba(36,48,82,.68);--line:rgba(255,255,255,.24);display:grid;grid-template-columns:270px 1fr;min-height:calc(100vh - 32px);max-width:1440px;margin:0 auto;color:#f7f8ff;border:1px solid rgba(255,255,255,.25);border-radius:28px;overflow:hidden;background:radial-gradient(circle at 72% 4%,rgba(105,142,206,.35),transparent 30%),linear-gradient(155deg,#071027,#213859 70%,#44617e);box-shadow:0 24px 80px #04091980;position:relative}.weather-window:before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.6;background-image:radial-gradient(#fff 1px,transparent 1px),radial-gradient(#fff 1px,transparent 1px);background-size:83px 83px,137px 137px;background-position:13px 21px,70px 42px}.weather-clear{background:radial-gradient(circle at 72% 10%,#fff7bc 0 2%,#6fb6e8 20%,transparent 42%),linear-gradient(#3b94da,#76b9df 60%,#d5a86d)}.weather-cloudy{background:radial-gradient(ellipse at 70% 15%,#b8c8dc99,transparent 35%),linear-gradient(155deg,#40526a,#70839a 55%,#2d3c56)}.weather-rain,.weather-storm{background:linear-gradient(160deg,#111827,#30415d 55%,#182435)}.weather-night{background:radial-gradient(circle at 76% 10%,#cad7ff 0 1.4%,transparent 1.6%),radial-gradient(ellipse at 70% 3%,#28365f,transparent 38%),linear-gradient(155deg,#04091d,#172443 58%,#304a69)}
.weather-sidebar{position:relative;z-index:1;background:rgba(9,14,34,.7);backdrop-filter:blur(24px);border-right:1px solid var(--line);padding:14px 10px}.traffic{display:flex;gap:9px;padding:2px 6px 20px}.traffic i{width:14px;height:14px;border-radius:50%;background:#ff4b55}.traffic i:nth-child(2){background:#ffc400}.traffic i:nth-child(3){background:#20c769}.traffic span{margin-left:auto}.side-search{height:38px;border-radius:20px;background:#ffffff0e;display:flex;align-items:center;padding:0 13px;gap:8px}.side-search input{width:100%;border:0;outline:0;background:none;color:white;font-size:14px}.city-list{height:calc(100vh - 118px);overflow:auto;margin-top:8px}.city-list button{width:100%;height:96px;display:grid;grid-template-columns:1fr auto;text-align:left;padding:12px;border:1px solid #ffffff16;border-radius:16px;background:#ffffff09;color:white;margin:7px 0;cursor:pointer}.city-list button.selected{border:3px solid #ffffff66;background:#ffffff18}.city-list b{font-size:16px}.city-list span small{display:block}.city-list strong{font-size:30px;font-weight:400}.city-list em{align-self:end;font-style:normal;font-size:12px}.city-list>button>small{align-self:end}.weather-content{position:relative;z-index:1;width:min(900px,calc(100vw - 320px));margin:0 auto;padding:42px 24px}.hero{text-align:center;min-height:180px}.home-link{position:absolute;left:24px;top:24px;cursor:pointer;color:#fff}.hero h1{font-size:28px;margin:4px}.hero-temp{font-size:72px;font-weight:200;line-height:.95}.hero p,.hero b{margin:3px;font-size:17px}.glass-card{background:var(--glass);border:1px solid #ffffff0c;border-radius:20px;backdrop-filter:blur(24px);box-shadow:inset 0 1px #ffffff0c}.hourly-card{padding:12px 10px 8px;margin-bottom:14px}.summary{margin:0 0 7px;padding:0 4px 9px;border-bottom:1px solid var(--line);font-size:13px}.hourly-scroll{display:flex;overflow:auto}.hour{min-width:76px;display:flex;flex-direction:column;align-items:center;gap:7px;padding:5px}.hour small,.day-icon small{color:#5edcff}.hour span{font-size:23px}.dashboard-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.wide-card{grid-column:span 2;grid-row:span 2}.metric-card{min-height:145px;padding:13px}.metric-card h2,.forecast-card h2{font-size:12px;color:#aeb9d1;text-transform:uppercase;margin:0 0 10px}.forecast-card{padding:12px}.day-row{display:grid;grid-template-columns:42px 60px 36px 1fr 38px;align-items:center;height:47px;border-top:1px solid var(--line)}.day-row em{font-style:normal;color:#aeb9d1}.temp-range{height:5px;background:#172340;border-radius:10px;position:relative}.temp-range i{position:absolute;height:100%;background:linear-gradient(90deg,#ffd21e,#ff8a00);border-radius:10px}.metric-big{font-size:29px;font-weight:500}.metric-card>p{font-size:12px;margin:18px 0 0}.air-card,.wind-card{grid-column:span 2}.air-scale,.uv-scale{height:5px;margin-top:15px;border-radius:5px;background:linear-gradient(90deg,#4cd4ff,#48e66e,#ffe245,#ff732b,#dc175c);position:relative}.air-scale i{position:absolute;top:-3px;width:10px;height:10px;border:2px solid white;border-radius:50%;background:#333}.wind-layout{display:grid;grid-template-columns:1fr 130px}.wind-layout p{margin:8px;border-bottom:1px solid var(--line);font-size:12px}.wind-layout p b{float:right}.compass{width:118px;height:118px;border-radius:50%;border:7px dotted #ffffff24;position:relative;display:grid;place-items:center}.compass i{position:absolute;font-style:normal;font-size:56px;color:white}.compass b{position:absolute;top:-7px}.compass small{text-align:center}.mountain-note{margin:3px!important;color:#aeb9d1}.sun-arc{height:36px;border-top:3px solid #a9b2c9;border-radius:50%;position:relative;margin-top:15px}.sun-arc i{position:absolute;width:10px;height:10px;border-radius:50%;background:#ffd53d;left:64%;top:-6px}.gauge{width:112px;height:70px;margin:auto;border-radius:100px 100px 0 0;border:9px dotted #aab6cf;position:relative;text-align:center;padding-top:32px}.gauge i{position:absolute;left:50%;bottom:0;width:3px;height:52px;background:white;transform-origin:bottom}.gauge b{font-size:18px}.gauge small{display:block}.weather-content footer{text-align:center;padding:34px;color:#dce3f1;font-size:12px}.state{display:grid;place-items:center;font-size:18px}
@media(max-width:900px){.weather-window{grid-template-columns:1fr;border-radius:0}.weather-sidebar{display:none}.weather-content{width:100%;padding:30px 12px}.dashboard-grid{grid-template-columns:repeat(2,1fr)}.hero{min-height:170px}}@media(max-width:520px){.dashboard-grid{grid-template-columns:1fr}.wide-card,.air-card,.wind-card{grid-column:span 1}.day-row{grid-template-columns:40px 54px 32px 1fr 34px}.hero-temp{font-size:60px}}

/* 기존 Dock 디자인 안에 날씨 분위기만 자연스럽게 입히는 최종 테마 */
.weather-window{--glass:color-mix(in srgb,var(--card-bg) 88%,transparent);--line:color-mix(in srgb,var(--ink) 22%,transparent);display:block;min-height:auto;max-width:1180px;color:var(--ink);border:var(--border-w) solid var(--ink);border-radius:var(--radius-lg);background:linear-gradient(180deg,color-mix(in srgb,var(--accent-light-8) 72%,transparent),var(--card-bg) 34%);box-shadow:none;overflow:hidden}
.weather-window:before{opacity:.18;background-size:110px 110px,170px 170px}
.weather-clear:after,.weather-cloudy:after,.weather-rain:after,.weather-storm:after,.weather-night:after{content:"";position:absolute;inset:0 0 auto;height:clamp(180px,28vw,330px);pointer-events:none;opacity:.28;background:radial-gradient(circle at 78% 23%,var(--accent-light-3),transparent 24%),linear-gradient(180deg,var(--accent-light-7),transparent)}
.weather-night:after{background:radial-gradient(circle at 78% 23%,#f7edbd 0 3%,transparent 3.5%),linear-gradient(180deg,#52678d88,transparent)}
.weather-rain:after,.weather-storm:after{background:repeating-linear-gradient(105deg,transparent 0 18px,#6f8ca544 19px 21px),linear-gradient(180deg,#8ca0b388,transparent)}
.weather-sidebar{display:none}.weather-content{width:100%;max-width:1040px;padding:clamp(18px,4vw,46px);position:relative}.hero{min-height:clamp(150px,22vw,225px)}.home-link{color:var(--ink);font-weight:800}.hero h1{font-size:clamp(1.2rem,3vw,2rem)}.hero-temp{font-size:clamp(3.1rem,8vw,5.4rem);font-weight:500}.hero p,.hero b{font-size:clamp(.8rem,1.5vw,1.05rem)}
.glass-card{background:var(--glass);border:2px solid var(--ink);border-radius:var(--radius-md);color:var(--ink);box-shadow:none}.summary,.day-row{border-color:var(--line)}.metric-card h2,.forecast-card h2{color:var(--ink-faint)}.day-row em{color:var(--ink-faint)}.temp-range{background:var(--accent-light-8)}.metric-card{min-width:0}.metric-card>p{overflow-wrap:anywhere}.compass{border-color:var(--accent-light-5)}.compass i{color:var(--ink)}.mountain-note{color:var(--ink-faint)}.weather-content footer{color:var(--ink-faint)}
.dashboard-grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(8px,1.4vw,14px)}
@media(max-width:980px){.dashboard-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.wide-card,.air-card,.wind-card{grid-column:span 2}}
@media(max-width:720px){.dashboard-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.wide-card,.air-card,.wind-card{grid-column:span 2}.hour{min-width:68px}.wind-layout{grid-template-columns:1fr 106px}.compass{width:96px;height:96px}.day-row{grid-template-columns:38px 52px 34px 1fr 36px;font-size:12px}}
@media(max-width:430px){.weather-content{padding:14px 9px}.dashboard-grid{grid-template-columns:1fr}.wide-card,.air-card,.wind-card{grid-column:span 1}.metric-card{min-height:132px}.day-row{grid-template-columns:36px 46px 32px 1fr 33px}.home-link{top:14px;left:12px}.hourly-card{margin-inline:-1px}}

/* 도시별 화면: 흑백 편집형 레이아웃 */
.weather-window{--glass:#070707;--line:#2d2d2d;max-width:1220px;padding:14px;background:#000!important;color:#f7f7f5;border:2px solid #292929;border-radius:28px;box-shadow:0 28px 90px #0008}
.weather-window:before,.weather-window:after{display:none!important}.weather-content{max-width:1180px;padding:0;width:100%}.home-link{top:22px;left:24px;color:#a8a8a8;font-size:12px;letter-spacing:.08em;z-index:2}.home-link:hover{color:#fff}
.editorial-current-card{min-height:720px;padding:58px 46px 30px;border:2px solid #242424;border-radius:24px;background:#030303;display:flex;flex-direction:column;position:relative;overflow:hidden}.editorial-city h1{font-size:clamp(34px,5vw,58px);font-weight:300;letter-spacing:-.055em;margin:4px 0 20px}.editorial-city p,.hourly-title{color:#9a9a9e;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:clamp(11px,1.5vw,16px);letter-spacing:.2em;margin:0;text-transform:uppercase}
.editorial-reading{display:grid;grid-template-columns:minmax(190px,.8fr) minmax(320px,1.45fr);align-items:center;gap:54px;flex:1;max-width:860px}.editorial-icon{font-size:clamp(112px,18vw,210px);filter:grayscale(1) brightness(2);text-align:center;line-height:1}.editorial-data{padding-top:22px}.editorial-temp{font-size:clamp(100px,17vw,178px);font-weight:200;line-height:.82;letter-spacing:-.08em}.editorial-temp sup{font-size:.25em;color:#aaa;vertical-align:top;margin-left:.12em;letter-spacing:0}.editorial-condition{font-size:clamp(23px,3.2vw,38px);font-weight:300;margin:42px 0 24px}.editorial-range{display:flex;gap:34px;color:#aaa;font-size:20px;margin-bottom:30px}.temperature-badge{display:inline-flex;padding:13px 24px;border:2px solid #f5f5f5;border-radius:999px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;letter-spacing:.18em}.editorial-controls{display:flex;align-items:center;gap:54px;margin:42px 6px 28px}.editorial-controls button{border:0;background:none;color:#737373;font-size:32px;line-height:1;cursor:pointer}.editorial-controls button:hover{color:#fff}.editorial-advice{color:#a3a3a6;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.1em;font-size:13px;margin:0}
.outfit-panel{border-top:1px solid #292929;margin-top:24px;padding:34px 6px 6px;position:relative}.outfit-title{display:flex;gap:22px;align-items:flex-start}.outfit-title>span{font-size:31px}.outfit-title h2{font-size:32px;font-weight:300;margin:0 0 5px}.outfit-title p{color:#888;margin:0}.outfit-chips{display:flex;flex-wrap:wrap;gap:10px;margin:28px 0 44px}.outfit-chips span{border:1px solid #454545;border-radius:999px;padding:9px 18px;color:#aaa;font-size:13px}.sun-times{display:flex;justify-content:space-between;color:#aaa;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px}
.glass-card{background:#050505;border:2px solid #242424;color:#f4f4f2;border-radius:24px;box-shadow:none;backdrop-filter:none}.editorial-hourly{margin:28px 0;padding:38px 34px 26px}.hourly-title{margin-bottom:28px}.editorial-hourly .summary{color:#85858a;border-color:#292929;font-size:12px;padding-bottom:15px}.editorial-hourly .hourly-scroll{justify-content:space-between;gap:18px}.editorial-hourly .hour{min-width:72px;gap:16px;padding:10px 4px}.editorial-hourly .hour>b{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;color:#aaa;letter-spacing:.08em}.editorial-hourly .hour span{filter:grayscale(1) brightness(2);font-size:28px}.editorial-hourly .hour strong{font-size:18px;font-weight:400}
.dashboard-grid{gap:16px}.metric-card h2,.forecast-card h2{color:#777b82;letter-spacing:.04em}.day-row{border-color:#292929}.day-row em{color:#777}.temp-range{background:#1f1f1f}.compass{border-color:#333}.compass i{color:#fff}.mountain-note,.weather-content footer{color:#767676}.air-card,.wind-card{background:#070707}.gauge{border-color:#393939}.sun-arc{border-color:#555}
@media(max-width:820px){.editorial-current-card{min-height:660px;padding:55px 28px 26px}.editorial-reading{grid-template-columns:minmax(130px,.7fr) minmax(260px,1.3fr);gap:26px}.editorial-controls{gap:38px}.editorial-hourly{padding:28px 20px}.weather-window{padding:8px;border-radius:20px}}
@media(max-width:580px){.editorial-current-card{padding:54px 20px 24px}.editorial-reading{grid-template-columns:1fr;gap:8px}.editorial-icon{text-align:left;font-size:90px}.editorial-temp{font-size:104px}.editorial-condition{margin:26px 0 18px}.editorial-range{margin-bottom:22px}.editorial-controls{margin:30px 4px 20px}.outfit-panel{margin-top:38px}.editorial-hourly .hourly-scroll{justify-content:flex-start}.dashboard-grid{grid-template-columns:1fr}.wide-card,.air-card,.wind-card{grid-column:span 1}}

/* 홈과 동일한 Dock · 계절색 · 투명 카드 디자인. 기능과 그리드 배치는 유지한다. */
.weather-window{
  --detail-glass:color-mix(in srgb,var(--card-bg-solid) 58%,transparent);
  --detail-glass-strong:color-mix(in srgb,var(--card-bg-solid) 72%,transparent);
  --detail-line:color-mix(in srgb,var(--ink) 24%,transparent);
  max-width:1220px;
  padding:14px;
  color:var(--ink);
  border:var(--border-w) solid var(--ink);
  border-radius:var(--radius-lg);
  background:linear-gradient(145deg,color-mix(in srgb,var(--accent-light-8) 44%,transparent),color-mix(in srgb,var(--card-bg-solid) 22%,transparent))!important;
  box-shadow:none;
  backdrop-filter:blur(18px) saturate(1.08);
}
.weather-window:before{display:block!important;content:"";position:absolute;inset:0;pointer-events:none;opacity:.16;background:radial-gradient(circle at 15% 12%,var(--accent-light-3),transparent 25%),radial-gradient(circle at 85% 32%,var(--accent-light-7),transparent 28%)}
.weather-window:after{display:none!important}.weather-content{position:relative;z-index:1}
.home-link{top:24px;left:26px;color:var(--ink);font-size:13px;font-weight:900;letter-spacing:-.01em;padding:7px 12px;border:2px solid var(--ink);border-radius:999px;background:var(--detail-glass-strong);backdrop-filter:blur(14px)}.home-link:hover{color:#fff;background:var(--accent)}
.editorial-current-card{min-height:700px;padding:68px 46px 30px;border:var(--border-w) solid var(--ink);border-radius:var(--radius-lg);background:var(--detail-glass);color:var(--ink);backdrop-filter:blur(22px) saturate(1.08);box-shadow:none}
.editorial-city h1{font-size:clamp(34px,5vw,58px);font-weight:850;letter-spacing:-.055em;margin:4px 0 12px;color:var(--ink)}
.editorial-city p,.hourly-title{color:var(--ink-soft);font-family:inherit;font-size:clamp(12px,1.5vw,15px);font-weight:800;letter-spacing:.04em;margin:0;text-transform:none}
.editorial-reading{grid-template-columns:minmax(190px,.8fr) minmax(320px,1.45fr);gap:54px;max-width:860px}
.editorial-icon{filter:none;font-size:clamp(112px,18vw,210px);text-shadow:0 8px 24px color-mix(in srgb,var(--accent) 30%,transparent)}
.editorial-temp{font-size:clamp(100px,17vw,178px);font-weight:650;color:var(--ink)}.editorial-temp sup{color:var(--ink-soft);font-weight:800}
.editorial-condition{font-size:clamp(23px,3.2vw,38px);font-weight:800;margin:34px 0 18px;color:var(--ink)}
.editorial-range{gap:34px;color:var(--ink-soft);font-size:20px;font-weight:800;margin-bottom:20px}
.editorial-controls{display:flex;align-items:center;gap:18px;margin:26px 0 8px}.editorial-controls button{display:grid;place-items:center;width:48px;height:42px;border:2px solid var(--ink);border-radius:999px;background:var(--detail-glass-strong);color:var(--ink);font-size:24px;font-weight:900;cursor:pointer}.editorial-controls button:hover{color:#fff;background:var(--accent)}
.outfit-panel{border-top:2px solid var(--detail-line);margin-top:26px;padding:30px 6px 6px}.outfit-title h2{font-size:32px;font-weight:850;color:var(--ink)}.outfit-title p{color:var(--ink-soft);font-weight:700}.outfit-chips{margin:24px 0 38px}.outfit-chips span{border:2px solid var(--ink);padding:9px 18px;color:var(--ink);background:var(--detail-glass-strong);font-size:13px;font-weight:800}.sun-times{color:var(--ink-soft);font-family:inherit;font-size:13px;font-weight:800}
.glass-card{background:var(--detail-glass);border:var(--border-w) solid var(--ink);color:var(--ink);border-radius:var(--radius-lg);box-shadow:none;backdrop-filter:blur(20px) saturate(1.06)}
.editorial-hourly{margin:22px 0;padding:28px 28px 22px}.hourly-title{margin-bottom:18px}.editorial-hourly .summary{color:var(--ink-soft);border-color:var(--detail-line);font-size:13px;font-weight:700;padding-bottom:13px}.editorial-hourly .hourly-scroll{justify-content:space-between;gap:14px}.editorial-hourly .hour{min-width:72px;gap:12px;padding:10px 4px}.editorial-hourly .hour>b{font-family:inherit;font-size:12px;color:var(--ink);font-weight:850;letter-spacing:0}.editorial-hourly .hour span{filter:none;font-size:28px}.editorial-hourly .hour strong{font-size:18px;font-weight:850}.hour small,.day-icon small{color:var(--accent-dark-2);font-weight:900}
.dashboard-grid{gap:16px}.metric-card h2,.forecast-card h2{color:var(--ink-soft);font-weight:900;letter-spacing:.02em}.day-row{border-color:var(--detail-line)}.day-row em{color:var(--ink-soft);font-weight:750}.temp-range{background:color-mix(in srgb,var(--accent-light-8) 72%,transparent)}.compass{border-color:var(--accent-light-5)}.compass i{color:var(--ink)}.mountain-note,.weather-content footer{color:var(--ink-soft)}.air-card,.wind-card{background:var(--detail-glass)}.gauge{border-color:var(--accent-light-5)}.sun-arc{border-color:var(--ink-faint)}.metric-card{color:var(--ink)}.metric-big{font-weight:850}.metric-card>p{color:var(--ink-soft);font-weight:650}.wind-layout p{border-color:var(--detail-line)}
@media(max-width:820px){.editorial-current-card{min-height:650px;padding:62px 28px 26px}.editorial-reading{grid-template-columns:minmax(130px,.7fr) minmax(260px,1.3fr);gap:26px}.editorial-controls{gap:12px}.editorial-hourly{padding:24px 18px}.weather-window{padding:8px;border-radius:20px}}
@media(max-width:580px){.editorial-current-card{padding:68px 20px 24px}.editorial-reading{grid-template-columns:1fr;gap:8px}.editorial-icon{text-align:left;font-size:90px}.editorial-temp{font-size:104px}.editorial-condition{margin:22px 0 14px}.editorial-range{margin-bottom:16px}.editorial-controls{margin:22px 0 8px}.outfit-panel{margin-top:28px}.editorial-hourly .hourly-scroll{justify-content:flex-start}.dashboard-grid{grid-template-columns:1fr}.wide-card,.air-card,.wind-card{grid-column:span 1}}

/* 도시 검색과 빠른 이동을 모든 화면에서 유지한다. */
@media(min-width:901px){
  .weather-window{display:grid;grid-template-columns:250px minmax(0,1fr);align-items:start}
  .weather-sidebar{display:block;position:sticky;top:14px;height:calc(100vh - 28px);min-height:620px;padding:14px 10px;border:var(--border-w) solid var(--ink);border-radius:var(--radius-lg);background:var(--detail-glass);color:var(--ink);backdrop-filter:blur(22px) saturate(1.08)}
  .weather-content{min-width:0;max-width:none;padding-left:14px}
  .traffic{padding-bottom:12px}.traffic span{color:var(--ink)}
  .side-search{border:2px solid var(--ink);background:var(--detail-glass-strong)}
  .side-search button{border:0;background:transparent;color:var(--ink);font-size:18px;font-weight:900;cursor:pointer}
  .side-search input{color:var(--ink);font-weight:750}.side-search input::placeholder{color:var(--ink-faint)}
  .city-list{height:calc(100vh - 116px);margin-top:8px;padding-right:2px}
  .city-list button{height:90px;border:2px solid color-mix(in srgb,var(--ink) 58%,transparent);background:var(--detail-glass-strong);color:var(--ink)}
  .city-list button.selected{border:3px solid var(--ink);background:color-mix(in srgb,var(--accent-light-8) 78%,transparent);box-shadow:inset 7px 0 0 var(--accent)}
  .city-list strong{font-size:25px;font-weight:800}.city-list b{font-size:14px}.city-list em,.city-list small{color:var(--ink-soft)}
}
@media(max-width:900px){
  .weather-sidebar{display:block;position:relative;padding:10px;border:var(--border-w) solid var(--ink);border-radius:var(--radius-md);background:var(--detail-glass);color:var(--ink);backdrop-filter:blur(20px)}
  .traffic{display:none}.side-search{height:42px;border:2px solid var(--ink);background:var(--detail-glass-strong)}.side-search button{border:0;background:transparent;color:var(--ink);font-size:18px;font-weight:900;cursor:pointer}.side-search input{color:var(--ink);font-weight:750}.side-search input::placeholder{color:var(--ink-faint)}
  .city-list{display:flex;height:auto;gap:8px;margin-top:9px;padding-bottom:4px;overflow-x:auto}
  .city-list button{flex:0 0 176px;width:176px;height:76px;margin:0;padding:8px;border:2px solid color-mix(in srgb,var(--ink) 58%,transparent);background:var(--detail-glass-strong);color:var(--ink);border-radius:13px}
  .city-list button.selected{border:3px solid var(--ink);background:color-mix(in srgb,var(--accent-light-8) 78%,transparent)}
  .city-list strong{font-size:21px;font-weight:800}.city-list b{font-size:12px}.city-list em,.city-list small{color:var(--ink-soft);font-size:10px}
  .weather-content{padding-top:10px}
}
</style>
