<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import { MOUNTAINS, REGIONS, DIFFICULTY_TAG_TYPE } from '../data/mountains.js'
import { useMountainStore } from '../stores/mountainStore.js'
import { fetchAllMountainWeather, weatherCodeEmoji, weatherCodeLabel } from '../api/weatherApi.js'
const mountainPhotoModules = import.meta.glob('../assets/mountains/*.webp', { eager: true, import: 'default' })
const mountainPhotos = Object.fromEntries(Object.entries(mountainPhotoModules).map(([path, url]) => [path.split('/').pop().replace('.webp', ''), url]))

const mountainStore = useMountainStore()
const route = useRoute()
const mountainWeather = ref({})
const focusedMountain = ref('')

const MOUNTAIN_COORDS = {
  bukhansan:[37.66,126.99],gwanaksan:[37.45,126.96],dobongsan:[37.70,127.02],suraksan:[37.70,127.08],manisan:[37.61,126.44],
  seoraksan:[38.12,128.47],odaesan:[37.80,128.54],taebaeksan:[37.10,128.92],chiaksan:[37.37,128.05],palbongsan:[37.70,127.70],
  gyeryongsan:[36.36,127.20],songnisan:[36.54,127.87],daedunsan:[36.12,127.32],worak:[36.89,128.10],oseosan:[36.46,126.66],
  jirisan:[35.34,127.73],wolchulsan:[34.77,126.70],mudeungsan:[35.13,126.99],naejangsan:[35.48,126.89],maisan:[35.76,127.41],
  gayasan:[35.82,128.12],palgongsan:[36.02,128.69],cheongnyangsan:[36.79,128.91],juwangsan:[36.39,129.16],sobaeksan:[36.96,128.48],
  hallasan:[33.36,126.53],sanbangsan:[33.24,126.31],seongsan:[33.46,126.94],darangswi:[33.47,126.82],saebyeol:[33.37,126.36]
}

const focusRequestedMountain = async () => {
  const requested = String(route.query.mountain || '')
  if (!requested) return
  focusedMountain.value = requested
  filterMode.value = 'all'
  await nextTick()
  document.getElementById(`mountain-${MOUNTAINS.find((mountain) => mountain.name === requested)?.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

onMounted(async () => {
  try {
    const locations = MOUNTAINS.map((m) => {
    const [lat, lon] = MOUNTAIN_COORDS[m.id]
      return { latitude: lat, longitude: lon, elevation: m.height }
    })
    const rows = await fetchAllMountainWeather(locations)
    mountainWeather.value = Object.fromEntries(MOUNTAINS.map((m, index) => [m.id, rows[index]]))
  } catch (error) { console.warn('명산 날씨 조회 지연:', error.response?.status || error.message) }
  focusRequestedMountain()
})
watch(() => route.query.mountain, focusRequestedMountain)

// 'all'(가나다순 전체) | 'beautiful'(아름다운 산) | 'hard'(힘든 산) | 'region'(지역별 5개 소개)
const filterMode = ref('all')
const selectedRegion = ref(REGIONS[0])

const filterOptions = [
  { value: 'all', label: '가나다순 전체' },
  { value: 'beautiful', label: '🌄 아름다운 산' },
  { value: 'hard', label: '🥵 힘든 산' },
  { value: 'region', label: '📍 지역별 소개' },
]

// 모든 목록의 기본 정렬은 가나다순
const sortByName = (list) => [...list].sort((a, b) => a.name.localeCompare(b.name, 'ko'))

const displayedMountains = computed(() => {
  if (filterMode.value === 'beautiful') return sortByName(MOUNTAINS.filter((m) => m.beautiful))
  if (filterMode.value === 'hard') return sortByName(MOUNTAINS.filter((m) => m.hard))
  if (filterMode.value === 'region') {
    return sortByName(MOUNTAINS.filter((m) => m.region === selectedRegion.value))
  }
  return sortByName(MOUNTAINS)
})

const weatherTone = (m) => {
  const w = mountainWeather.value[m.id]?.current
  if (!w) return 'loading'
  if (!w.is_day) return 'night'
  if (w.snowfall > 0 || w.weather_code >= 71 && w.weather_code <= 77) return 'snow'
  if (w.weather_code >= 51) return 'rain'
  if (w.weather_code >= 3) return 'cloud'
  return 'clear'
}

const currentMonthLabel = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}년 ${now.getMonth() + 1}월`
})

const handleStamp = (mountain) => {
  const stamped = mountainStore.stampMountain(mountain.id)
  if (stamped) {
    ElMessage.success(`${mountain.name} · ${currentMonthLabel.value} 인증 도장을 찍었습니다! 🎉`)
  } else {
    ElMessage.warning('이번 달에는 이미 인증 도장을 찍은 산입니다.')
  }
}
</script>

<template>
  <div class="mountain-view">
    <section class="mountain-hero">
      <h1>🏔️ 전국 명산 컬렉션</h1>
      <p class="hero-desc">
        전국 6개 권역의 명산 {{ MOUNTAINS.length }}곳을 소개합니다. 산을 오른 달에는 인증 도장을 찍어 나만의
        등산 컬렉션을 완성해보세요.
      </p>
    </section>

    <el-card class="stats-card" shadow="never">
      <div class="stats-row">
        <div class="stats-text">
          <p class="stats-title">컬렉션 진행률</p>
          <p class="stats-sub">
            {{ mountainStore.collectedCount }} / {{ mountainStore.totalMountainCount }}개 산 인증 · 누적 도장
            {{ mountainStore.totalStampCount }}개
          </p>
        </div>
        <el-progress
          :percentage="mountainStore.collectionProgress"
          :stroke-width="10"
          class="stats-progress"
        />
      </div>
    </el-card>

    <el-alert type="info" :closable="false" class="difficulty-legend">
      <template #title>
        <strong>난이도 분류 기준</strong>
        <span class="legend-item"><el-tag size="small" type="success">초급</el-tag> 표고 900m 미만 · 완만한 코스</span>
        <span class="legend-item"
          ><el-tag size="small" type="warning">중급</el-tag> 표고 900~1500m 또는 급경사·암릉 구간</span
        >
        <span class="legend-item"
          ><el-tag size="small" type="danger">고급</el-tag> 표고 1700m 이상 또는 국내 최장급 종주 코스</span
        >
      </template>
    </el-alert>

    <div class="filter-bar">
      <el-radio-group v-model="filterMode">
        <el-radio-button v-for="opt in filterOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </el-radio-button>
      </el-radio-group>

      <el-radio-group v-if="filterMode === 'region'" v-model="selectedRegion" size="small" class="region-picker">
        <el-radio-button v-for="r in REGIONS" :key="r" :value="r">{{ r }}</el-radio-button>
      </el-radio-group>
    </div>

    <div class="mountain-grid">
      <el-card v-for="m in displayedMountains" :id="`mountain-${m.id}`" :key="m.id" class="mountain-card" :class="{ 'mountain-card--focused': focusedMountain === m.name }" shadow="hover">
        <div class="card-image" :class="`mountain-weather--${weatherTone(m)}`" :style="{ backgroundImage: `url(${mountainPhotos[m.id]})` }">
          <div class="weather-overlay" v-if="mountainWeather[m.id]">
            <span>{{ weatherCodeEmoji(mountainWeather[m.id].current.weather_code, mountainWeather[m.id].current.is_day) }}</span>
            <strong>{{ Math.round(mountainWeather[m.id].current.temperature_2m) }}°</strong>
            <small>{{ weatherCodeLabel(mountainWeather[m.id].current.weather_code) }}</small>
          </div>
          <div v-else class="weather-overlay"><small>정상 날씨 확인 중</small></div>
        </div>

        <div class="card-body">
          <div class="card-head">
            <h3 class="mountain-name">{{ m.name }}</h3>
            <el-tag size="small" :type="DIFFICULTY_TAG_TYPE[m.difficulty]">{{ m.difficulty }}</el-tag>
          </div>
          <p class="mountain-meta">📍 {{ m.region }} · 표고 {{ m.height }}m</p>
          <p v-if="mountainWeather[m.id]" class="summit-weather">
            정상 체감 {{ Math.round(mountainWeather[m.id].current.apparent_temperature) }}° · 바람 {{ mountainWeather[m.id].current.wind_speed_10m }}m/s · 돌풍 {{ mountainWeather[m.id].current.wind_gusts_10m }}m/s
          </p>

          <div class="badge-row">
            <el-tooltip v-if="m.beautiful" :content="m.beautifulReason" placement="top">
              <span class="badge badge-beautiful">🌄 아름다운 산</span>
            </el-tooltip>
            <el-tooltip v-if="m.hard" :content="m.hardReason" placement="top">
              <span class="badge badge-hard">🥵 힘든 산</span>
            </el-tooltip>
          </div>

          <p class="mountain-desc">{{ m.description }}</p>

          <div class="stamp-zone">
            <template v-if="mountainStore.isStampedThisMonth(m.id)">
              <div class="stamp-seal">
                <span class="stamp-seal-text">인증</span>
                <span class="stamp-seal-month">{{ currentMonthLabel }}</span>
              </div>
              <p class="stamp-count">누적 인증 {{ mountainStore.stampCount(m.id) }}회</p>
            </template>
            <el-button v-else type="primary" size="small" plain @click="handleStamp(m)">
              🖋 이번 달 인증 도장 찍기
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.mountain-view {
  max-width: 1180px;
  margin: 0 auto;
}
.mountain-hero h1 {
  font-size: 20px;
  margin: 0 0 6px;
  color: var(--ink);
}
.hero-desc {
  font-size: 13px;
  color: var(--ink-faint);
  margin: 0 0 16px;
  line-height: 1.6;
}
.stats-card {
  margin-bottom: 14px;
}
.stats-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
.stats-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
  margin: 0 0 4px;
}
.stats-sub {
  font-size: 12px;
  color: var(--ink-faint);
  margin: 0;
  white-space: nowrap;
}
.stats-progress {
  flex: 1;
}
.difficulty-legend {
  margin-bottom: 16px;
}
.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: 14px;
  font-size: 12px;
  color: var(--ink-soft);
}
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}
.mountain-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 270px), 1fr));
  gap: 16px;
}
.mountain-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: color-mix(in srgb, var(--card-bg-solid) 54%, transparent) !important;
  backdrop-filter: blur(18px) saturate(1.04);
}
.mountain-card--focused{outline:6px solid color-mix(in srgb,var(--accent) 60%,transparent);outline-offset:4px;animation:mountainFocus 1.6s ease 2}@keyframes mountainFocus{50%{transform:translateY(-5px)}}
.mountain-card :deep(.el-card__body) {
  padding: 0;
}
.card-image {
  height: clamp(130px, 16vw, 190px);
  overflow: hidden;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  transition: filter .35s ease;
}
.card-image:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,transparent 35%,rgba(20,16,12,.55))}
:global([data-season='spring']) .card-image{filter:saturate(.9) hue-rotate(338deg) brightness(1.04)}
:global([data-season='summer']) .card-image{filter:saturate(1.08) brightness(1.02)}
:global([data-season='fall']) .card-image{filter:saturate(1.18) sepia(.2) hue-rotate(342deg)}
:global([data-season='winter']) .card-image{filter:saturate(.58) brightness(1.08) contrast(.95)}
.mountain-weather--cloud{filter:saturate(.72) brightness(.88)}
.mountain-weather--rain{filter:saturate(.52) brightness(.68) contrast(1.1)}
.mountain-weather--rain:before{content:"";position:absolute;inset:0;z-index:1;background:repeating-linear-gradient(105deg,transparent 0 15px,rgba(190,220,239,.42) 16px 18px)}
.mountain-weather--snow{filter:saturate(.35) brightness(1.16)}
.mountain-weather--night{filter:saturate(.55) brightness(.48) hue-rotate(12deg)}
.weather-overlay{position:absolute;z-index:2;left:12px;right:12px;bottom:10px;display:flex;align-items:center;gap:7px;color:white;text-shadow:0 1px 5px #000}.weather-overlay span{font-size:22px}.weather-overlay strong{font-size:20px}.weather-overlay small{margin-left:auto;font-weight:800}
.card-body {
  padding: 14px 16px 16px;
  min-height: 255px;
  display: flex;
  flex-direction: column;
}
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.mountain-name {
  font-size: 17px;
  font-weight: 800;
  margin: 0;
  color: var(--ink);
}
.mountain-meta {
  font-size: 12.5px;
  color: var(--ink-faint);
  margin: 4px 0 8px;
}
.summit-weather{font-size:11.5px;font-weight:750;color:var(--ink);margin:0 0 8px;padding:7px 9px;border-radius:10px;background:color-mix(in srgb,var(--accent-light-9) 52%,transparent);line-height:1.5}
.badge-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.badge {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 999px;
  font-weight: 600;
  cursor: default;
}
.badge-beautiful {
  background: var(--accent-light-8);
  color: var(--accent-dark-2);
}
.badge-hard {
  background: #fee2e2;
  color: #b91c1c;
}
.mountain-desc {
  font-size: 13px;
  color: var(--ink-soft);
  line-height: 1.6;
  margin: 0 0 14px;
  min-height: 38px;
}
.stamp-zone {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 10px;
  border-top: 2px dashed var(--ink);
  opacity: 1;
  margin-top: auto;
}
.stamp-seal {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border: 2px solid #dc2626;
  border-radius: 50%;
  color: #dc2626;
  transform: rotate(-8deg);
  line-height: 1.1;
  flex-shrink: 0;
}
.stamp-seal-text {
  font-size: 13px;
  font-weight: 800;
}
.stamp-seal-month {
  font-size: 8px;
  font-weight: 700;
}
.stamp-count {
  font-size: 12px;
  color: var(--ink-faint);
  margin: 0;
}
@media(max-width:700px){.stats-row{align-items:flex-start;flex-direction:column}.stats-sub{white-space:normal}.stats-progress{width:100%}.legend-item{display:flex;margin:7px 0 0}.filter-bar :deep(.el-radio-group){display:flex;overflow-x:auto;max-width:100%;flex-wrap:nowrap}.filter-bar :deep(.el-radio-button){flex:0 0 auto}.mountain-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.card-body{padding:12px;min-height:230px}.mountain-desc{min-height:auto}.stamp-zone{align-items:flex-start;flex-direction:column}}
@media(max-width:440px){.mountain-grid{grid-template-columns:1fr}.card-image{height:170px}.mountain-hero h1{font-size:18px}}
</style>
