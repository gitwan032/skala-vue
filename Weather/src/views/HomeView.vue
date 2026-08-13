<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import SearchBar from '../components/SearchBar.vue'
import WeatherCard from '../components/WeatherCard.vue'
import { QUICK_CITIES, TEMPORARY_WEATHER_MODE, fetchAllQuickCities, fetchDetailedWeather, getWeatherEmoji, weatherCodeEmoji, weatherCodeLabel } from '../api/weatherApi.js'
import { MOUNTAINS } from '../data/mountains.js'
import { useConfigStore } from '../stores/configStore.js'
import { useFavoritesStore } from '../stores/favoritesStore.js'
import { useSeasonStore } from '../stores/seasonStore.js'
import koreaTopology from '../data/maps/korea-provinces.topo.json'
import worldTopology from 'world-atlas/countries-110m.json'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { feature as topoFeature } from 'topojson-client'

const mountainPhotoModules = import.meta.glob('../assets/mountains/*.webp', { eager: true, import: 'default' })
const mountainPhotos = Object.fromEntries(Object.entries(mountainPhotoModules).map(([path, url]) => [path.split('/').pop().replace('.webp', ''), url]))

const router = useRouter()
const configStore = useConfigStore()
const favoritesStore = useFavoritesStore()
const seasonStore = useSeasonStore()

const weatherByCity = ref({})
const isLoading = ref(true)
const searchText = ref('')
const activeTab = ref('all') // 'all' | cityId
const sortMode = ref('name') // 'name' | 'temp' | 'favorite'
const listMode = ref('city') // 'city' | 'mountain'
const naverMapEl = ref(null)
const mapMode = ref('fallback')
const mapZoom = ref(6)
const mapExpanded = ref(false)
let naverMap = null
let naverMarkers = []
let userMarker = null
let koreaProvinceLayer = null
let worldOutlineLayer = null
let geolocationWatchId = null
const localCoords = ref({ latitude: 37.5665, longitude: 126.978 })
const localWeather = ref(null)
const localSource = ref('현재 위치 확인 중')
const clockNow = ref(new Date())

const getCoords = () => new Promise((resolve) => {
  if (!navigator.geolocation) return resolve({ latitude: 37.5665, longitude: 126.978, fallback: true })
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude, fallback: false }),
    () => resolve({ latitude: 37.5665, longitude: 126.978, fallback: true }),
    { enableHighAccuracy: false, timeout: 7000, maximumAge: 600000 }
  )
})

const loadLocalAtmosphere = async () => {
  let coords
  try {
    coords = await getCoords()
    localCoords.value = { latitude: coords.latitude, longitude: coords.longitude }
    localSource.value = TEMPORARY_WEATHER_MODE
      ? (coords.fallback ? '서울 기준 · 임시 예보' : '내 위치 기준 · 임시 예보')
      : (coords.fallback ? '서울 기준 · 위치 권한 미사용' : '내 위치 실시간')
    localWeather.value = await fetchDetailedWeather(coords.latitude, coords.longitude)
  } catch {
    if (!coords || coords.fallback) {
      localCoords.value = { latitude: 37.5665, longitude: 126.978 }
      localSource.value = '서울 기준 · 임시 예보'
    } else {
      localSource.value = '내 위치 기준 · 임시 예보'
    }
  }
}

const localCurrent = computed(() => localWeather.value?.current || {})
const localDaily = computed(() => localWeather.value?.daily || {})
const localHourly = computed(() => localWeather.value?.hourly || {})
const localLocationName = computed(() => {
  if (localSource.value.includes('서울 기준')) return '서울특별시'
  const nearest = QUICK_CITIES.reduce((best, city) => {
    const distance = Math.hypot(city.latitude - localCoords.value.latitude, city.longitude - localCoords.value.longitude)
    return !best || distance < best.distance ? { city, distance } : best
  }, null)
  return nearest?.city.region || '서울특별시'
})
const localNowIndex = computed(() => Math.max(0, localHourly.value.time?.findIndex((time) => time >= localCurrent.value.time) ?? 0))
const localHourRows = computed(() => Array.from({ length: 10 }, (_, offset) => {
  const index = localNowIndex.value + offset
  const time = localHourly.value.time?.[index]
  return {
    label: offset === 0 ? '지금' : new Date(time).toLocaleTimeString('ko-KR', { hour: 'numeric' }),
    icon: weatherCodeEmoji(localHourly.value.weather_code?.[index], localCurrent.value.is_day),
    temp: localHourly.value.temperature_2m?.[index],
    rain: localHourly.value.precipitation_probability?.[index]
  }
}).filter((row) => row.temp !== undefined))
const localWeekRows = computed(() => (localDaily.value.time || []).slice(0, 7).map((time, index) => ({
  day: index === 0 ? '오늘' : new Date(`${time}T12:00:00`).toLocaleDateString('ko-KR', { weekday: 'short' }),
  icon: weatherCodeEmoji(localDaily.value.weather_code?.[index]),
  min: localDaily.value.temperature_2m_min?.[index],
  max: localDaily.value.temperature_2m_max?.[index],
  rain: localDaily.value.precipitation_probability_max?.[index]
})))
const atmosphereTone = computed(() => {
  const w = localCurrent.value
  if (!w.is_day) return 'night'
  if (w.snowfall > 0 || (w.weather_code >= 71 && w.weather_code <= 77)) return 'snow'
  if (w.weather_code >= 95) return 'storm'
  if (w.weather_code >= 51) return 'rain'
  if (w.weather_code >= 45) return 'fog'
  if (w.weather_code >= 2) return 'cloud'
  return 'clear'
})
const celestialStyle = computed(() => {
  const daily = localWeather.value?.daily
  if (!daily) return { '--sky-x': '50%', '--sky-y': '18%' }
  const sunrise = new Date(daily.sunrise[0]).getTime()
  const sunset = new Date(daily.sunset[0]).getTime()
  const now = clockNow.value.getTime()
  let progress
  if (localCurrent.value.is_day) progress = Math.max(0, Math.min(1, (now - sunrise) / (sunset - sunrise)))
  else {
    const nightStart = now >= sunset ? sunset : sunset - 86400000
    const nightEnd = now >= sunset ? sunrise + 86400000 : sunrise
    progress = Math.max(0, Math.min(1, (now - nightStart) / (nightEnd - nightStart)))
  }
  return {
    '--sky-x': `${8 + progress * 84}%`,
    '--sky-y': `${62 - Math.sin(progress * Math.PI) * 48}%`,
    '--star-rotation': `${((clockNow.value.getHours() + clockNow.value.getMinutes() / 60) / 24) * 360}deg`
  }
})

const loadAll = async () => {
  isLoading.value = true
  try { weatherByCity.value = await fetchAllQuickCities() }
  catch (error) { console.warn('전국 날씨 조회 지연:', error.response?.status || error.message) }
  finally { isLoading.value = false }
}

const fallbackMarkerStyle = (city) => ({
  left: `${city.latitude < 34 ? 50 + (city.longitude - 126.53) * 12 : 35 + ((city.longitude - 126) / 3.5) * 31}%`,
  top: `${city.latitude < 34 ? 91 : 6 + ((38.65 - city.latitude) / 4.35) * 78}%`
})
const primaryMapIds = new Set(['seoul', 'busan', 'daegu', 'incheon', 'gwangju', 'daejeon', 'ulsan', 'jeju'])
const secondaryMapIds = new Set([...primaryMapIds, 'chuncheon', 'gangneung', 'jeonju', 'pohang', 'suwon', 'sejong'])
const visibleMapCities = computed(() => {
  if (mapZoom.value <= 6) return QUICK_CITIES.filter(c => primaryMapIds.has(c.id))
  if (mapZoom.value <= 8) return QUICK_CITIES.filter(c => secondaryMapIds.has(c.id))
  return QUICK_CITIES
})

const renderNaverForecastMap = async () => {
  try {
    await nextTick()
    if (!naverMapEl.value || !L) return
    mapMode.value = 'leaflet'
    naverMap = L.map(naverMapEl.value, {
      minZoom: 2, maxZoom: 11, zoomSnap: .5, worldCopyJump: true,
      zoomControl: true, attributionControl: true
    })
    const worldCountries = topoFeature(worldTopology, worldTopology.objects.countries)
    worldOutlineLayer = L.geoJSON(worldCountries, {
      interactive: false,
      style: { color: '#71897f', weight: .45, opacity: .5, fillColor: '#c9d9c3', fillOpacity: .88 }
    })
    const topologyObject = koreaTopology.objects[Object.keys(koreaTopology.objects)[0]]
    const provinces = topoFeature(koreaTopology, topologyObject)
    koreaProvinceLayer = L.geoJSON(provinces, {
      style: (feature) => ({
        color: '#31463d', weight: feature.properties?.name === '서울특별시' ? 1.7 : 1.15,
        opacity: .82, fillColor: '#a8c99a', fillOpacity: .95,
        lineCap: 'round', lineJoin: 'round'
      }),
      onEachFeature: (feature, layer) => {
        const name = feature.properties?.name || feature.properties?.NAME_1 || ''
        if (name) layer.bindTooltip(name, { sticky: true, className: 'province-tooltip' })
      }
    }).addTo(naverMap)
    const focusKorea = () => {
      naverMap?.invalidateSize({ pan: false })
      if (koreaProvinceLayer) naverMap?.setView([36.15, 127.85], 6.5, { animate: false })
    }
    requestAnimationFrame(() => requestAnimationFrame(focusKorea))
    naverMarkers = QUICK_CITIES.map((city) => {
      const weather = weatherByCity.value[city.id]
      const temp = weather ? `${configStore.convert(weather.main.temp)}${configStore.unitSymbol}` : '–'
      const icon = weather ? getWeatherEmoji(weather.weather[0].main) : '☁️'
      const marker = L.marker([city.latitude, city.longitude], { icon: L.divIcon({
        className: 'weather-leaflet-icon', html: `<button class="naver-weather-marker"><span>${icon}</span><b>${city.name}</b><strong>${temp}</strong></button>`, iconSize: [76, 55], iconAnchor: [38, 28]
      }) }).on('click', () => router.push(`/city/${encodeURIComponent(city.name)}`)).addTo(naverMap)
      return { city, marker }
    })
    const syncMarkerDensity = () => {
      mapZoom.value = naverMap.getZoom()
      if (mapZoom.value < 5) {
        if (!naverMap.hasLayer(worldOutlineLayer)) worldOutlineLayer.addTo(naverMap)
      } else if (naverMap.hasLayer(worldOutlineLayer)) worldOutlineLayer.remove()
      const ids = mapZoom.value <= 7 ? primaryMapIds : mapZoom.value <= 9 ? secondaryMapIds : null
      naverMarkers.forEach(({ city, marker }) => {
        const visible = !ids || ids.has(city.id)
        marker.setOpacity(visible ? 1 : 0)
        const element = marker.getElement()
        if (element) element.style.pointerEvents = visible ? 'auto' : 'none'
      })
    }
    naverMap.on('zoomend', syncMarkerDensity)
    syncMarkerDensity()
    userMarker = L.marker([localCoords.value.latitude, localCoords.value.longitude], { zIndexOffset: 1000, icon: L.divIcon({ className: 'my-location-icon', html: '<div class="my-location-marker"><i></i><b>내 위치</b></div>', iconSize: [64, 30], iconAnchor: [16, 15] }) }).addTo(naverMap)
    if (navigator.geolocation) {
      geolocationWatchId = navigator.geolocation.watchPosition(({ coords }) => {
        localCoords.value = { latitude: coords.latitude, longitude: coords.longitude }
        userMarker?.setLatLng([coords.latitude, coords.longitude])
      }, () => {}, { enableHighAccuracy: false, maximumAge: 60000, timeout: 10000 })
    }
    window.setTimeout(focusKorea, 450)
  } catch (error) {
    console.error('전국 지도 초기화 실패:', error)
    mapMode.value = 'fallback'
  }
}

watch(mapExpanded, async (expanded) => {
  await nextTick()
  window.setTimeout(() => {
    naverMap?.invalidateSize({ pan: false })
    if (!expanded && koreaProvinceLayer) {
      naverMap?.setView([36.15, 127.85], 6.5, { animate: false })
    }
  }, 380)
})

onMounted(async () => {
  await Promise.all([loadAll(), loadLocalAtmosphere()])
  renderNaverForecastMap()
})

const handleSelectTab = (key) => {
  if (key === 'random') {
    const random = QUICK_CITIES[Math.floor(Math.random() * QUICK_CITIES.length)]
    router.push(`/city/${encodeURIComponent(random.name)}`)
    return
  }
  activeTab.value = key
}

const handleSearchSubmit = () => {
  const trimmed = searchText.value.trim()
  if (!trimmed) return
  const mountainMatch = MOUNTAINS.find((mountain) =>
    mountain.name.includes(trimmed) || mountain.region.includes(trimmed)
  )
  if (mountainMatch) {
    router.push({ path: '/mountains', query: { mountain: mountainMatch.name } })
    return
  }
  const localMatch = QUICK_CITIES.find((c) => c.name.includes(trimmed))
  router.push(`/city/${encodeURIComponent(localMatch?.name || trimmed)}`)
}

const sortOptions = [
  { value: 'name', label: '이름순' },
  { value: 'temp', label: '온도순' },
  { value: 'favorite', label: '즐겨찾기순' },
]

const baseCities = computed(() =>
  activeTab.value === 'all' ? QUICK_CITIES : QUICK_CITIES.filter((c) => c.id === activeTab.value)
)

const filteredCities = computed(() => {
  const kw = searchText.value.trim()
  if (!kw) return baseCities.value
  return baseCities.value.filter((c) => c.name.includes(kw) || c.region.includes(kw))
})

const visibleCities = computed(() => sortedCities.value.slice(0, 12))
const seasonMountainIds = {
  spring: ['jirisan', 'sobaeksan', 'hallasan', 'gyeryongsan', 'gwanaksan', 'mudeungsan'],
  summer: ['seoraksan', 'odaesan', 'chiaksan', 'wolchulsan', 'juwangsan', 'hallasan'],
  fall: ['naejangsan', 'seoraksan', 'odaesan', 'chiaksan', 'bukhansan', 'palgongsan'],
  winter: ['taebaeksan', 'seoraksan', 'hallasan', 'sobaeksan', 'deogyusan', 'gyeryongsan']
}
const cityMountainRegion = {
  seoul: '수도권', incheon: '수도권', suwon: '수도권', ansan: '수도권',
  chuncheon: '강원권', gangneung: '강원권',
  daejeon: '충청권', sejong: '충청권', cheonan: '충청권',
  gwangju: '전라권', jeonju: '전라권', yeosu: '전라권',
  busan: '경상권', daegu: '경상권', ulsan: '경상권', pohang: '경상권', gyeongju: '경상권', andong: '경상권', jinju: '경상권',
  jeju: '제주권', seogwipo: '제주권'
}
const activeMountainRegion = computed(() => cityMountainRegion[activeTab.value] || null)
const seasonalMountains = computed(() => {
  const preferred = seasonMountainIds[seasonStore.season] || seasonMountainIds.summer
  const score = (mountain) => {
    const position = preferred.indexOf(mountain.id)
    const regionScore = activeMountainRegion.value && mountain.region === activeMountainRegion.value ? 0 : 1000
    return regionScore + (position === -1 ? 100 + MOUNTAINS.indexOf(mountain) : position)
  }
  const query = searchText.value.trim()
  return [...MOUNTAINS]
    .filter((mountain) => !query || mountain.name.includes(query) || mountain.region.includes(query) || mountain.description.includes(query))
    .sort((a, b) => score(a) - score(b))
    .slice(0, 12)
})
const seasonLabel = computed(() => ({ spring: '봄꽃', summer: '청량', fall: '단풍', winter: '설경' }[seasonStore.season]))
const mountainHeading = computed(() => {
  const city = QUICK_CITIES.find((item) => item.id === activeTab.value)
  return city ? `🏔️ ${city.name} 주변 ${seasonLabel.value} 명산` : `🏔️ ${seasonLabel.value} 명산 추천`
})

const sortedCities = computed(() => {
  const list = [...filteredCities.value]
  if (sortMode.value === 'temp') {
    return list.sort((a, b) => {
      const ta = weatherByCity.value[a.id]?.main?.temp ?? -999
      const tb = weatherByCity.value[b.id]?.main?.temp ?? -999
      return tb - ta
    })
  }
  if (sortMode.value === 'favorite') {
    return list.sort(
      (a, b) => Number(favoritesStore.isFavorite(b.id)) - Number(favoritesStore.isFavorite(a.id))
    )
  }
  return list.sort((a, b) => a.name.localeCompare(b.name, 'ko'))
})

const averageTempLabel = computed(() => {
  const temps = QUICK_CITIES.map((c) => weatherByCity.value[c.id]?.main?.temp).filter(
    (t) => Number.isFinite(t)
  )
  if (temps.length === 0) return '-'
  const avg = temps.reduce((sum, t) => sum + t, 0) / temps.length
  return `${configStore.convert(avg)}${configStore.unitSymbol}`
})

const insightText = computed(() => {
  const entries = QUICK_CITIES.map((c) => ({ city: c, temp: weatherByCity.value[c.id]?.main?.temp })).filter(
    (e) => Number.isFinite(e.temp)
  )
  if (entries.length < 2) return null
  const hottest = entries.reduce((a, b) => (b.temp > a.temp ? b : a))
  const coolest = entries.reduce((a, b) => (b.temp < a.temp ? b : a))
  if (hottest.city.id === coolest.city.id) return null
  return `오늘은 ${hottest.city.name}이(가) 가장 덥고, ${coolest.city.name}이(가) 가장 선선해요.`
})

// 전국 기온 훑어보기: 온도 확보된 도시만, 자동 스크롤 캐러셀
let atmosphereTimer = null
let clockTimer = null

onMounted(() => {
  atmosphereTimer = setInterval(loadLocalAtmosphere, 10 * 60 * 1000)
  clockTimer = setInterval(() => { clockNow.value = new Date() }, 60 * 1000)
})
onBeforeUnmount(() => {
  clearInterval(atmosphereTimer)
  clearInterval(clockTimer)
  if (geolocationWatchId !== null) navigator.geolocation.clearWatch(geolocationWatchId)
  try {
    naverMap?.off()
    naverMap?.eachLayer((layer) => {
      if (!layer?._icon || layer._icon.parentNode) return
      layer._icon = null
    })
    naverMap?.remove()
  } catch (error) {
    console.warn('지도 정리 지연:', error.message)
  }
  naverMap = null
  naverMarkers = []
  userMarker = null
  koreaProvinceLayer = null
  worldOutlineLayer = null
})
</script>

<template>
  <div class="home-view">
    <div class="live-atmosphere" :class="`atmosphere--${atmosphereTone}`" :style="celestialStyle" aria-hidden="true">
      <div class="star-field star-field--near"></div>
      <div class="star-field star-field--far"></div>
      <i class="celestial-body">{{ localCurrent.is_day ? '☀' : '●' }}</i>
      <div class="cloud cloud--one"></div><div class="cloud cloud--two"></div>
      <div class="precipitation"></div>
    </div>
    <section class="local-weather-hero">
      <div class="home-unit-switch" role="group" aria-label="홈 화면 온도 단위 선택">
        <button
          type="button"
          :class="{ active: configStore.unit === 'celsius' }"
          :aria-pressed="configStore.unit === 'celsius'"
          @click="configStore.setUnit('celsius')"
        ><b>°C</b><small>섭씨</small></button>
        <button
          type="button"
          :class="{ active: configStore.unit === 'fahrenheit' }"
          :aria-pressed="configStore.unit === 'fahrenheit'"
          @click="configStore.setUnit('fahrenheit')"
        ><b>°F</b><small>화씨</small></button>
      </div>
      <div class="local-weather-title"><span class="live-dot"></span><small>{{ localSource }}</small><h1>{{ localLocationName }}</h1></div>
      <template v-if="localWeather">
        <div class="local-hero-temp">{{ configStore.convert(localCurrent.temperature_2m) }}<small>{{ configStore.unitSymbol }}</small></div>
        <p>{{ weatherCodeLabel(localCurrent.weather_code) }}</p>
        <b>최고:{{ configStore.convert(localDaily.temperature_2m_max?.[0]) }}{{ configStore.unitSymbol }}&nbsp; 최저:{{ configStore.convert(localDaily.temperature_2m_min?.[0]) }}{{ configStore.unitSymbol }}</b>
      </template>
      <p v-else class="local-loading">서울 기준 날씨를 불러오는 중…</p>
    </section>

    <section v-if="localWeather" class="local-hourly dock-card">
      <p class="local-summary">현재 {{ weatherCodeLabel(localCurrent.weather_code) }} 상태입니다. 돌풍은 최대 {{ Math.round(localCurrent.wind_gusts_10m || 0) }}m/s입니다.</p>
      <div class="local-hour-track">
        <div v-for="hour in localHourRows" :key="hour.label" class="local-hour">
          <b>{{ hour.label }}</b><small v-if="hour.rain">{{ hour.rain }}%</small><span>{{ hour.icon }}</span><strong>{{ configStore.convert(hour.temp) }}{{ configStore.unitSymbol }}</strong>
        </div>
      </div>
    </section>

    <div class="weather-overview" :class="{ 'weather-overview--expanded': mapExpanded }">
    <section v-if="localWeather" class="local-week dock-card">
      <h2>▦ 7일간의 일기예보 <small v-if="TEMPORARY_WEATHER_MODE">25~35℃ 임시 데이터</small></h2>
      <div v-for="row in localWeekRows" :key="row.day" class="local-day-row">
        <b>{{ row.day }}</b><span>{{ row.icon }} <small v-if="row.rain">{{ row.rain }}%</small></span><em>{{ configStore.convert(row.min) }}{{ configStore.unitSymbol }}</em><i></i><strong>{{ configStore.convert(row.max) }}{{ configStore.unitSymbol }}</strong>
      </div>
    </section>
    <section class="forecast-map-card dock-card">
      <div class="map-head">
        <div><h2>🗺️ 전국 일기예보</h2><p>지도에서 지역 날씨를 한눈에 확인하고 마커를 눌러 상세 예보를 보세요.</p></div>
        <div class="map-actions"><span class="map-provider">대한민국 시·도 · 축소 시 세계</span><button class="map-expand-btn" type="button" :aria-expanded="mapExpanded" @click.stop="mapExpanded = !mapExpanded">{{ mapExpanded ? '축소 보기' : '크게 보기' }}</button></div>
      </div>
      <div class="map-stage" @click="mapExpanded = true">
        <div ref="naverMapEl" class="naver-map" :class="{ 'naver-map--visible': mapMode === 'leaflet' }"></div>
        <div v-if="mapMode === 'fallback'" class="korea-weather-map">
          <svg class="korea-map-art" viewBox="0 0 620 780" role="img" aria-label="대한민국 전국 예보 지도">
            <defs>
              <linearGradient id="landGradient" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#b8d88a"/><stop offset="1" stop-color="#7fac73"/></linearGradient>
              <filter id="landShadow"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-opacity=".22"/></filter>
            </defs>
            <path class="map-land" filter="url(#landShadow)" fill="url(#landGradient)" d="M260 35 L338 52 374 95 363 137 390 174 365 213 397 255 372 294 400 339 369 382 388 424 349 462 359 503 323 537 319 585 284 624 258 590 250 544 218 511 228 467 199 428 218 389 191 346 210 302 184 255 210 218 198 177 228 145 220 102 244 75 Z"/>
            <path class="map-ridge" d="M255 75 C296 150 267 225 320 292 S273 420 320 536" fill="none" stroke="#6e9464" stroke-width="8" stroke-linecap="round" opacity=".45"/>
            <path class="map-river" d="M218 210 C265 225 300 207 353 230 M228 390 C280 372 325 393 374 370" fill="none" stroke="#9ed4eb" stroke-width="5" opacity=".85"/>
            <ellipse class="map-land" cx="282" cy="708" rx="53" ry="25" fill="url(#landGradient)" transform="rotate(-12 282 708)"/>
            <circle cx="406" cy="622" r="5" fill="#8ab67a"/><circle cx="431" cy="644" r="4" fill="#8ab67a"/><circle cx="184" cy="605" r="4" fill="#8ab67a"/>
            <text x="310" y="665" text-anchor="middle">대한민국</text><text x="282" y="714" text-anchor="middle">제주</text>
          </svg>
          <button
            v-for="city in visibleMapCities" :key="`map-${city.id}`" type="button" class="fallback-weather-marker"
            :style="fallbackMarkerStyle(city)" :title="`${city.region} 상세 날씨`"
            @click="router.push(`/city/${encodeURIComponent(city.name)}`)"
          >
            <span>{{ weatherByCity[city.id] ? getWeatherEmoji(weatherByCity[city.id].weather[0].main) : '☁️' }}</span>
            <b>{{ city.name }}</b><strong>{{ weatherByCity[city.id] ? configStore.convert(weatherByCity[city.id].main.temp) : '–' }}{{ weatherByCity[city.id] ? configStore.unitSymbol : '' }}</strong>
          </button>
          <div class="fallback-my-location" :style="fallbackMarkerStyle(localCoords)"><i></i><b>내 위치</b></div>
          <p class="naver-map-help">실제 지도를 불러오지 못해 전국 예보판으로 표시 중</p>
        </div>
      </div>
    </section>
    </div>
    <section class="tab-bar dock-card">
      <button
        type="button"
        class="tab-item tab-item--all"
        :class="{ 'tab-item--active': activeTab === 'all' }"
        @click="handleSelectTab('all')"
      >
        <span class="tab-icon">🏠</span>
        <span>전체</span>
      </button>
      <div class="tab-divider" />
      <button
        v-for="city in QUICK_CITIES"
        :key="city.id"
        type="button"
        class="tab-item"
        :class="{ 'tab-item--active': activeTab === city.id }"
        @click="handleSelectTab(city.id)"
      >
        <span class="tab-icon">{{ weatherByCity[city.id] ? getWeatherEmoji(weatherByCity[city.id].weather[0].main) : '☁️' }}</span>
        <span>{{ city.name }}</span>
      </button>
      <button type="button" class="tab-item tab-item--random" @click="handleSelectTab('random')">
        <span class="tab-icon">🔀</span>
        <span>랜덤</span>
      </button>
    </section>
    <p class="tab-hint">↔ 옆으로 밀어서 {{ QUICK_CITIES.length }}개 지역을 모두 볼 수 있어요</p>

    <el-card class="search-card" shadow="never">
      <p class="search-title">🔍 도시 · 명산 통합 검색</p>
      <SearchBar v-model="searchText" @submit="handleSearchSubmit" />
      <p class="search-status">도시와 산 이름을 함께 검색할 수 있어요 · {{ searchText || '입력 대기 중' }}</p>
    </el-card>

    <el-alert v-if="insightText" type="info" :closable="false" class="insight-banner">
      <template #title>💡 {{ insightText }}</template>
    </el-alert>

    <el-card class="list-card" shadow="never">
      <div class="list-head">
        <h2>{{ listMode === 'city' ? '📍 지역별 날씨 현황' : mountainHeading }}</h2>
        <div v-if="listMode === 'city'" class="list-stats">
          <span>📋 검색결과 {{ sortedCities.length }}개</span>
          <span>⭐ 즐겨찾기 {{ favoritesStore.count }}개</span>
          <span>🌡️ 평균 {{ averageTempLabel }}</span>
        </div>
        <div v-else class="list-stats"><span>{{ seasonStore.current.label }}에 먼저 가볼 만한 산 {{ seasonalMountains.length }}곳</span><span>선택 지역·검색어·계절에 따라 자동 변경</span></div>
        <div class="list-mode-switch" role="group" aria-label="목록 전환">
          <button :class="{ active: listMode === 'city' }" @click="listMode = 'city'">도시 날씨</button>
          <button :class="{ active: listMode === 'mountain' }" @click="listMode = 'mountain'">계절 명산</button>
        </div>
        <el-select v-if="listMode === 'city'" v-model="sortMode" class="sort-select" size="default">
          <el-option v-for="opt in sortOptions" :key="opt.value" :value="opt.value" :label="opt.label" />
        </el-select>
      </div>

      <div v-if="listMode === 'city' && visibleCities.length > 0" class="city-grid">
        <WeatherCard
          v-for="city in visibleCities"
          :key="city.id"
          :city="city"
          :weather="weatherByCity[city.id]"
          :loading="isLoading && !weatherByCity[city.id]"
        />
      </div>
      <div v-else-if="listMode === 'mountain' && seasonalMountains.length" class="mountain-recommend-grid">
        <button v-for="mountain in seasonalMountains" :key="mountain.id" class="mountain-recommend-card" @click="router.push({ path: '/mountains', query: { mountain: mountain.name } })">
          <span class="mountain-thumb"><img :src="mountainPhotos[mountain.id]" :alt="`${mountain.name} 특징 풍경`" /></span>
          <span class="mountain-card-copy"><b>{{ mountain.name }}</b><small>📍 {{ mountain.region }} · {{ mountain.height }}m</small><em>{{ mountain.description }}</em></span>
          <strong>{{ mountain.difficulty }}</strong>
        </button>
      </div>
      <p v-else class="empty-hint">검색 결과가 없습니다.</p>
    </el-card>
  </div>
</template>

<style scoped>
.home-view {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  isolation: isolate;
}
.home-view > :not(.live-atmosphere) { position: relative; z-index: 1; }
.live-atmosphere{position:fixed;z-index:0;inset:0;overflow:hidden;pointer-events:none;background:linear-gradient(180deg,#85c9f1 0%,#d9eef7 58%,var(--bg) 100%);transition:background 1.2s ease}
.live-atmosphere:before{content:"";position:absolute;inset:-22%;z-index:1;opacity:0;background-repeat:no-repeat;transform:rotate(var(--star-rotation));transform-origin:center;transition:opacity 1s}
.live-atmosphere:after{position:absolute;right:4vw;top:140px;color:#ffffff99;font-size:11px;font-weight:700;letter-spacing:.12em;opacity:0}
.star-field{position:absolute;inset:-12%;z-index:0;opacity:0;transition:opacity 1s;transform-origin:center;pointer-events:none}.star-field--near{background-image:radial-gradient(circle,#ffffffa8 0 1px,transparent 1.55px),radial-gradient(circle,#fff8d58f 0 .8px,transparent 1.4px),radial-gradient(circle,#bfd8ff8c 0 .9px,transparent 1.45px);background-size:117px 109px,173px 151px,229px 193px;background-position:17px 21px,68px 42px,111px 84px;transform:rotate(var(--star-rotation));animation:starPulse 5.5s ease-in-out infinite}.star-field--far{background-image:radial-gradient(circle,#ffffff8a 0 .6px,transparent 1.05px);background-size:43px 47px;background-position:8px 14px;transform:rotate(var(--star-rotation));animation:starPulse 7.5s ease-in-out -2s infinite}.atmosphere--night .star-field{opacity:.34}.atmosphere--night .star-field--far{opacity:.18}@keyframes starPulse{50%{filter:brightness(1.14);opacity:.24}}
:global([data-season='spring']) .live-atmosphere:before{background-image:radial-gradient(circle at 18% 26%,#fff 0 2px,transparent 3px),radial-gradient(circle at 26% 33%,#fff 0 1px,transparent 2px),radial-gradient(circle at 35% 39%,#fff 0 2px,transparent 3px),radial-gradient(circle at 47% 32%,#fff 0 1px,transparent 2px),radial-gradient(circle at 60% 26%,#fff 0 2px,transparent 3px),radial-gradient(circle at 72% 41%,#fff 0 1px,transparent 2px),radial-gradient(circle at 81% 29%,#fff 0 1px,transparent 2px)}
:global([data-season='spring']) .live-atmosphere:after{content:'봄 · 북두칠성 / 사자자리'}
:global([data-season='summer']) .live-atmosphere:before{background-image:radial-gradient(circle at 27% 18%,#fff 0 2px,transparent 3px),radial-gradient(circle at 48% 25%,#fff 0 2px,transparent 3px),radial-gradient(circle at 66% 19%,#fff 0 2px,transparent 3px),radial-gradient(circle at 38% 45%,#fff 0 1px,transparent 2px),radial-gradient(circle at 58% 48%,#fff 0 1px,transparent 2px),radial-gradient(circle at 75% 52%,#fff 0 1px,transparent 2px),radial-gradient(circle at 19% 57%,#fff 0 1px,transparent 2px)}
:global([data-season='summer']) .live-atmosphere:after{content:'여름 · 대삼각형 / 은하수'}
:global([data-season='fall']) .live-atmosphere:before{background-image:radial-gradient(circle at 23% 31%,#fff 0 2px,transparent 3px),radial-gradient(circle at 38% 22%,#fff 0 1px,transparent 2px),radial-gradient(circle at 54% 31%,#fff 0 2px,transparent 3px),radial-gradient(circle at 68% 43%,#fff 0 1px,transparent 2px),radial-gradient(circle at 78% 27%,#fff 0 2px,transparent 3px),radial-gradient(circle at 45% 55%,#fff 0 1px,transparent 2px)}
:global([data-season='fall']) .live-atmosphere:after{content:'가을 · 페가수스 사각형'}
:global([data-season='winter']) .live-atmosphere:before{background-image:radial-gradient(circle at 21% 20%,#fff 0 2px,transparent 3px),radial-gradient(circle at 33% 38%,#fff 0 2px,transparent 3px),radial-gradient(circle at 47% 27%,#fff 0 1px,transparent 2px),radial-gradient(circle at 59% 43%,#fff 0 2px,transparent 3px),radial-gradient(circle at 71% 21%,#fff 0 2px,transparent 3px),radial-gradient(circle at 78% 51%,#fff 0 1px,transparent 2px),radial-gradient(circle at 52% 58%,#fff 0 1px,transparent 2px)}
:global([data-season='winter']) .live-atmosphere:after{content:'겨울 · 오리온 / 겨울 대삼각형'}
.celestial-body{position:absolute;left:var(--sky-x);top:var(--sky-y);transform:translate(-50%,-50%);font-style:normal;font-size:clamp(52px,8vw,104px);line-height:1;color:#ffd83d;text-shadow:0 0 25px #fff5a5,0 0 70px #ffc53d88;transition:left 60s linear,top 60s linear}
.cloud{position:absolute;width:clamp(180px,30vw,420px);height:90px;border-radius:50%;background:#fff9;filter:blur(20px);opacity:0;animation:cloudDrift 40s linear infinite}.cloud--one{top:18%;left:-30%}.cloud--two{top:42%;left:-45%;animation-duration:58s;animation-delay:-18s;transform:scale(.7)}
.precipitation{position:absolute;inset:0;opacity:0;background:repeating-linear-gradient(105deg,transparent 0 24px,#bfdff066 25px 27px);animation:rainMove .5s linear infinite}
.atmosphere--cloud{background:linear-gradient(180deg,#8fa9ba,#d5e0e5 63%,var(--bg))}.atmosphere--cloud .cloud,.atmosphere--rain .cloud,.atmosphere--storm .cloud,.atmosphere--fog .cloud{opacity:.78}
.atmosphere--rain{background:linear-gradient(180deg,#536b7c,#a6b6bf 65%,var(--bg))}.atmosphere--rain .precipitation,.atmosphere--storm .precipitation{opacity:1}
.atmosphere--storm{background:linear-gradient(180deg,#263547,#708291 62%,var(--bg))}.atmosphere--fog{background:linear-gradient(180deg,#b5c1c6,#e6e8e5 70%,var(--bg))}.atmosphere--snow{background:linear-gradient(180deg,#a9c5dc,#eef5f7 70%,var(--bg))}.atmosphere--snow .precipitation{opacity:.75;background-image:radial-gradient(#fff 2px,transparent 2.5px);background-size:25px 25px;animation:rainMove 3s linear infinite}
.atmosphere--night{background:linear-gradient(180deg,#060a20 0%,#17294c 55%,#61758d 82%,var(--bg) 100%)}.atmosphere--night:before{opacity:.3}.atmosphere--night:after{opacity:.55}.atmosphere--night .celestial-body{color:#eef1ff;text-shadow:8px -3px 0 #17294c,0 0 28px #cbd5ff;font-size:clamp(48px,7vw,88px)}
.local-weather-hero{position:relative;min-height:260px;padding:32px 20px 18px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;text-align:center;text-shadow:0 2px 12px #0008}.home-unit-switch{position:absolute;top:12px;right:12px;display:flex;gap:3px;padding:4px;border:2px solid #ffffffb8;border-radius:999px;background:#07142a70;box-shadow:0 7px 24px #0003;backdrop-filter:blur(18px) saturate(1.15);text-shadow:none}.home-unit-switch button{min-width:66px;height:38px;display:flex;align-items:center;justify-content:center;gap:5px;padding:0 11px;border:0;border-radius:999px;background:transparent;color:#ffffffc9;cursor:pointer;font-family:inherit;transition:background .2s,color .2s,transform .2s}.home-unit-switch button:hover{transform:translateY(-1px);color:#fff}.home-unit-switch button.active{background:var(--accent);color:#fff;box-shadow:inset 0 0 0 2px #ffffff38}.home-unit-switch b{font-size:16px;font-weight:900}.home-unit-switch small{font-size:11px;font-weight:850}.local-weather-title{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:7px}.local-weather-title h1{flex-basis:100%;margin:5px 0 0;font-size:clamp(24px,3.5vw,37px);font-weight:600}.local-weather-title small{font-weight:800}.local-hero-temp{font-size:clamp(70px,10vw,112px);font-weight:200;line-height:.86;letter-spacing:-.07em}.local-hero-temp small{font-size:.24em;vertical-align:top;letter-spacing:0;margin-left:7px}.local-weather-hero>p{font-size:17px;font-weight:700;margin:9px 0 2px}.local-weather-hero>b{font-size:14px}.local-loading{padding:18px;border-radius:999px;background:#0004}.local-hourly{padding:12px 14px;background:rgba(21,29,57,.64)!important;color:#f7f8ff;border-color:#ffffff38!important}.local-summary{margin:0;padding:0 5px 10px;border-bottom:1px solid #ffffff4d;font-size:12px}.local-hour-track{display:flex;overflow-x:auto;justify-content:space-between}.local-hour{flex:1 0 75px;display:flex;flex-direction:column;align-items:center;gap:9px;padding:10px 4px}.local-hour small{color:#54d8ff;font-size:10px}.local-hour span{font-size:24px}.local-hour strong{font-size:16px}.weather-overview{display:grid;grid-template-columns:minmax(360px,.95fr) minmax(480px,1.25fr);grid-template-areas:'week map';gap:16px;position:relative;z-index:1;align-items:stretch;min-width:0}.forecast-map-card{grid-area:map;min-width:0}.local-week{grid-area:week;min-width:0;padding:14px;display:flex;flex-direction:column;background:rgba(21,29,57,.64)!important;color:#f7f8ff;border-color:#ffffff38!important}.local-week h2{flex:0 0 auto;display:flex;justify-content:space-between;gap:8px;font-size:12px;color:#aeb9d1;margin:0 0 7px}.local-week h2 small{color:#72ddff;font-size:9px}.local-day-row{height:auto;min-height:43px;flex:1 1 43px;display:grid;grid-template-columns:44px 74px 50px 1fr 50px;align-items:center;border-top:1px solid #ffffff36;font-size:12px}.local-day-row span small{color:#50d9ff}.local-day-row em{color:#aeb9d1;font-style:normal}.local-day-row i{height:5px;border-radius:99px;background:linear-gradient(90deg,#ffd21f 20%,#ff7a1b 82%)}.local-day-row strong{text-align:right}.weather-overview.weather-overview--expanded{grid-template-columns:minmax(0,1fr);grid-template-areas:'map' 'week'}
.location-weather{min-height:100%;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:14px;background:color-mix(in srgb,var(--card-bg) 58%,transparent);backdrop-filter:blur(22px)}.location-weather>div:first-child{display:grid;grid-template-columns:auto 1fr;align-items:center;column-gap:8px}.location-weather small{grid-column:2;color:var(--ink-faint)}.live-dot{width:9px;height:9px;border-radius:50%;background:#20bd64;box-shadow:0 0 0 5px #20bd6422}.location-reading{display:flex;align-items:flex-end;gap:12px}.location-reading strong{font-size:clamp(48px,8vw,78px);line-height:.9}.location-reading span{font-weight:800;font-size:17px}.location-details{display:flex;gap:8px;flex-wrap:wrap}.location-details span{padding:6px 9px;border:1.5px solid color-mix(in srgb,var(--ink) 35%,transparent);border-radius:999px;background:#ffffff38;font-size:11px;font-weight:700}
.home-view :deep(.el-card),.home-view .dock-card{background:color-mix(in srgb,var(--card-bg) 70%,transparent)!important;backdrop-filter:blur(20px) saturate(1.08)}
.forecast-map-card{padding:12px}.map-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:8px;min-width:0}.map-head>div:first-child{min-width:0}.map-head h2{font-size:clamp(15px,1.8vw,19px);margin:0 0 2px}.map-head p{font-size:11px;color:var(--ink-faint);margin:0}.map-provider{flex:0 0 auto;border:2px solid var(--ink);border-radius:999px;padding:5px 9px;background:color-mix(in srgb,var(--card-bg) 72%,transparent);font-size:10px;font-weight:800;white-space:nowrap}.map-expand-btn{flex:0 0 auto;min-width:68px;height:30px;border:2px solid var(--ink);border-radius:999px;padding:5px 11px;background:var(--accent);color:#fff;font-family:inherit;font-size:10px;font-weight:900;line-height:1;white-space:nowrap;cursor:pointer}.map-expand-btn:hover{filter:brightness(1.06)}.map-stage{width:100%;height:310px;position:relative;border:var(--border-w) solid var(--ink);border-radius:var(--radius-md);overflow:hidden;background:#8ec9e8;cursor:zoom-in;transition:height .35s ease}.weather-overview--expanded .map-stage{height:clamp(520px,62vw,720px);cursor:default}.naver-map{position:absolute;inset:0;visibility:hidden;background:#8ec9e8}.naver-map--visible{visibility:visible}.korea-weather-map{position:absolute;inset:0;background:linear-gradient(145deg,#89c8ea,#d9f0f6 58%,#69afd7);overflow:hidden}.korea-map-art{position:absolute;inset:3% 15%;width:70%;height:94%;filter:saturate(.92)}.korea-map-art text{font-size:16px;font-weight:900;fill:#47705b;opacity:.62}.map-river{vector-effect:non-scaling-stroke}
.search-card{background:color-mix(in srgb,var(--card-bg) 42%,transparent)!important;backdrop-filter:blur(24px) saturate(1.1)!important}.search-card :deep(.el-input__wrapper){background:color-mix(in srgb,#fff 34%,transparent)!important;backdrop-filter:blur(18px)}
:global(.leaflet-container){background:linear-gradient(145deg,#7ebee0,#b8dfed);font-family:inherit}:global(.leaflet-tile-pane){display:none!important}:global(.leaflet-control-attribution){display:none!important}:global(.leaflet-control-zoom a){color:#241c15}:global(.province-tooltip){border:2px solid #342a22!important;border-radius:10px!important;background:#fffdf7e8!important;font-weight:800!important;box-shadow:none!important}:global(.weather-leaflet-icon),:global(.my-location-icon){background:none!important;border:0!important}
.fallback-weather-marker{position:absolute;z-index:2;transform:translate(-50%,-50%);display:grid;grid-template-columns:auto auto;align-items:center;column-gap:3px;min-width:58px;padding:4px 6px;border:2px solid var(--ink);border-radius:12px;background:color-mix(in srgb,var(--card-bg) 78%,transparent);color:var(--ink);box-shadow:0 3px 8px #23332c33;cursor:pointer;backdrop-filter:blur(7px)}.fallback-weather-marker span{grid-row:span 2;font-size:16px}.fallback-weather-marker b{font-size:10px;line-height:1}.fallback-weather-marker strong{font-size:13px;line-height:1.1}.fallback-weather-marker:hover{z-index:4;background:var(--accent);color:#fff;transform:translate(-50%,-50%) scale(1.12)}.naver-map-help{position:absolute;left:10px;bottom:8px;margin:0;padding:5px 8px;border-radius:9px;background:#fffbd9d9;font-size:10px;color:#554b3d}.naver-map-help code{font-size:9px}
:global(.naver-weather-marker){display:grid;grid-template-columns:auto auto;align-items:center;column-gap:4px;min-width:72px;padding:5px 7px;border:2px solid #241c15;border-radius:13px;background:#fffdf7e8;color:#241c15;box-shadow:0 4px 12px #0003;cursor:pointer;backdrop-filter:blur(8px)}:global(.naver-weather-marker span){grid-row:span 2;font-size:18px}:global(.naver-weather-marker b){font-size:11px}:global(.naver-weather-marker strong){font-size:14px}
.map-actions{display:flex;align-items:center;justify-content:flex-end;gap:5px;flex:0 0 auto;min-width:0}.map-actions>b{font-size:11px}.fallback-my-location{position:absolute;z-index:5;transform:translate(-50%,-50%);display:flex;align-items:center;gap:4px;color:#1769d2;font-size:10px;font-weight:900}.fallback-my-location i,:global(.my-location-marker i){width:13px;height:13px;border:3px solid white;border-radius:50%;background:#1579ee;box-shadow:0 0 0 5px #1579ee44}.fallback-my-location b{background:#fffc;padding:2px 5px;border-radius:8px}:global(.my-location-marker){display:flex;align-items:center;gap:5px;color:#1268ce;font-size:11px;font-weight:900;white-space:nowrap}:global(.my-location-marker b){padding:3px 6px;border-radius:9px;background:#ffffffe8;box-shadow:0 2px 8px #0003}
@keyframes cloudDrift{to{left:115%}}@keyframes rainMove{to{background-position:0 28px}}
.tab-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  padding: 14px 16px;
}
.tab-bar{order:99}.tab-hint{order:100}
.tab-divider {
  width: 2px;
  align-self: stretch;
  background: var(--ink);
  opacity: 0.15;
  flex-shrink: 0;
}
.tab-item {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 64px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  border: var(--border-w) solid var(--ink);
  background: var(--card-bg);
  font-size: 12px;
  font-weight: 700;
  color: var(--ink);
  cursor: pointer;
}
.tab-item--all {
  min-width: 60px;
}
.tab-item--active {
  background: var(--accent);
  color: #fff;
}
.tab-icon {
  font-size: 20px;
}
.tab-hint {
  text-align: center;
  font-size: 12px;
  color: var(--ink-faint);
  margin: -6px 0 0;
}
.search-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.search-title {
  font-size: 15px;
  font-weight: 800;
  margin: 0;
}
.search-status {
  font-size: 12px;
  color: var(--ink-faint);
  margin: 0;
}
.api-warning {
  font-size: 12px;
  color: var(--accent-dark-2);
  background: var(--accent-light-9);
  border: var(--border-w) solid var(--ink);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  margin: 0;
}
.insight-banner {
  border: 3px solid var(--ink) !important;
  border-left: 9px solid var(--accent) !important;
  background: color-mix(in srgb, var(--accent-light-8) 74%, transparent) !important;
  box-shadow: 0 7px 18px color-mix(in srgb, var(--ink) 16%, transparent) !important;
  backdrop-filter: blur(22px) saturate(1.15);
  padding: 13px 16px !important;
}
.insight-banner :deep(.el-alert__content){padding:0 2px}.insight-banner :deep(.el-alert__title){color:var(--ink)!important;font-size:15px!important;font-weight:900!important;line-height:1.55!important;letter-spacing:-.02em}.insight-banner :deep(.el-alert__icon){color:var(--accent-dark-2)!important;font-size:20px!important}
.list-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}
.list-head h2 {
  font-size: 17px;
  margin: 0;
  flex: 0 0 auto;
}
.list-stats {
  display: flex;
  gap: 14px;
  flex: 1;
  font-size: 12px;
  color: var(--ink-soft);
  font-weight: 600;
}
.sort-select {
  width: 130px;
}
.city-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}
.empty-hint {
  text-align: center;
  font-size: 13px;
  color: var(--ink-faint);
  padding: 30px 0;
}
.list-mode-switch{display:flex;border:2px solid var(--ink);border-radius:999px;padding:3px;background:color-mix(in srgb,var(--card-bg-solid) 48%,transparent)}.list-mode-switch button{border:0;border-radius:999px;padding:8px 13px;background:transparent;color:var(--ink);font-size:12px;font-weight:800;cursor:pointer}.list-mode-switch button.active{background:var(--accent);color:#fff}.mountain-recommend-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.mountain-recommend-card{min-width:0;padding:0;overflow:hidden;text-align:left;border:var(--border-w) solid var(--ink);border-radius:var(--radius-md);background:color-mix(in srgb,var(--card-bg-solid) 52%,transparent);color:var(--ink);cursor:pointer;backdrop-filter:blur(18px)}.mountain-thumb{display:block;height:142px;position:relative;overflow:hidden;background:#64796f}.mountain-thumb img{width:100%;height:100%;display:block;object-fit:cover;object-position:center;transition:transform .35s ease}.mountain-recommend-card:hover .mountain-thumb img{transform:scale(1.045)}.mountain-card-copy{display:flex;flex-direction:column;padding:13px 14px 8px;min-height:105px}.mountain-card-copy b{font-size:17px;line-height:1.3}.mountain-card-copy small{color:var(--ink-faint);margin:5px 0 8px;line-height:1.45}.mountain-card-copy em{font-size:12px;line-height:1.55;font-style:normal;color:var(--ink-soft);min-height:38px;overflow:hidden}.mountain-recommend-card>strong{display:inline-block;margin:0 14px 13px;padding:4px 8px;border-radius:99px;background:var(--accent-light-8);color:var(--ink);font-size:11px}:global([data-season='spring']) .mountain-thumb{filter:saturate(.92) hue-rotate(338deg) brightness(1.06)}:global([data-season='summer']) .mountain-thumb{filter:saturate(1.12)}:global([data-season='fall']) .mountain-thumb{filter:saturate(1.2) sepia(.22) hue-rotate(342deg)}:global([data-season='winter']) .mountain-thumb{filter:saturate(.55) brightness(1.1)}
@media(max-width:1080px){.city-grid,.mountain-recommend-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.weather-overview{grid-template-columns:minmax(320px,.9fr) minmax(400px,1.1fr)}.weather-overview.weather-overview--expanded{grid-template-columns:minmax(0,1fr)}}
@media(max-width:760px){.weather-overview{grid-template-columns:1fr;grid-template-areas:'map' 'week'}.map-stage{height:300px}.weather-overview--expanded .map-stage{height:70vh}.city-grid,.mountain-recommend-grid{gap:10px}.local-weather-hero{min-height:225px}}
@media(max-width:600px){.location-weather{padding:16px}.location-reading{gap:6px}.location-reading span{font-size:12px}.celestial-body{top:max(var(--sky-y),130px)}.list-stats{flex-basis:100%;overflow-x:auto}.map-head p,.map-provider{display:none}.fallback-weather-marker{min-width:47px;padding:3px}.fallback-weather-marker span{font-size:13px}.fallback-weather-marker b{font-size:9px}.fallback-weather-marker strong{font-size:11px}.naver-map-help{max-width:80%}}
@media(max-width:500px){.city-grid,.mountain-recommend-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.list-mode-switch{order:4}.mountain-thumb{height:95px}}
@media(max-width:460px){.local-weather-hero{padding-top:72px}.home-unit-switch{top:10px;left:50%;right:auto;transform:translateX(-50%)}.home-unit-switch button{min-width:62px;height:34px}}
@media(max-width:350px){.city-grid,.mountain-recommend-grid{grid-template-columns:1fr}}
</style>
