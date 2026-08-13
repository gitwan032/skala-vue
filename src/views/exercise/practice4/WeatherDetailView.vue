<script setup>
// WeatherDetailView.vue: 지역별 상세 기상관측 정보를 보여주는 페이지.
// ④ Router(동적 경로 매칭) → ⑤ Store(단위 변환) → ⑥ Axios(실 API 데이터 + 예보) 가 반영된 최종 상태.
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useConfigStore } from '../../../stores/configStore.js'
import {
  QUICK_CITIES,
  fetchCurrentWeather,
  fetchForecast,
  fetchWeatherByCityName,
  getWeatherEmoji,
  isApiKeyConfigured,
} from '../../../api/weatherApi.js'

const route = useRoute()
const configStore = useConfigStore()

const isLoading = ref(false)
const errorMessage = ref('')
const cityLabel = ref('')
const current = ref(null)
const forecast = ref([])

const loadDetail = async (cityId) => {
  isLoading.value = true
  errorMessage.value = ''
  current.value = null
  forecast.value = []

  if (!isApiKeyConfigured()) {
    errorMessage.value =
      'OpenWeatherMap API 키가 설정되지 않았습니다. .env.local의 VITE_WEATHER_API_KEY를 확인해주세요.'
    isLoading.value = false
    return
  }

  try {
    // 요구사항: Router 동적 경로 매칭에 해당되는 도시ID(cityId)를 기반으로 Mount 시점에 데이터를 조회
    const quickCity = QUICK_CITIES.find((c) => c.id === cityId)
    if (quickCity) {
      cityLabel.value = quickCity.name
      const [currentData, forecastData] = await Promise.all([
        fetchCurrentWeather(quickCity.latitude, quickCity.longitude),
        fetchForecast(quickCity.latitude, quickCity.longitude),
      ])
      current.value = currentData
      forecast.value = forecastData
    } else {
      // 즐겨찾기 목록에 없는 도시는 이름으로 간주하여 실시간 검색(Open-Meteo + OpenWeatherMap)
      const cityName = decodeURIComponent(cityId)
      const result = await fetchWeatherByCityName(cityName)
      if (!result.place) {
        errorMessage.value = `해당 도시(${cityName})의 정보를 찾을 수 없습니다.`
        return
      }
      cityLabel.value = result.place.name
      current.value = result.current
      forecast.value = result.forecast
    }
  } catch (error) {
    console.error('상세 날씨 조회 실패:', error)
    errorMessage.value = '날씨 정보를 가져오는 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => loadDetail(route.params.cityId))
watch(
  () => route.params.cityId,
  (newId) => loadDetail(newId),
)

const displayTemp = computed(() =>
  current.value ? configStore.convert(current.value.main.temp) : null,
)
const displayFeelsLike = computed(() =>
  current.value ? configStore.convert(current.value.main.feels_like) : null,
)
const forecastItems = computed(() =>
  forecast.value.map((item) => ({
    hour: new Date(item.dt * 1000).getHours(),
    emoji: getWeatherEmoji(item.weather[0].main),
    temp: configStore.convert(item.main.temp),
  })),
)
</script>

<template>
  <div class="detail-view">
    <h2 class="detail-title">지역별 상세 기상 관측 정보</h2>

    <el-skeleton v-if="isLoading" :rows="5" animated />
    <el-alert v-else-if="errorMessage" :title="errorMessage" type="error" show-icon />

    <template v-else-if="current">
      <div class="detail-head">
        <span class="emoji">{{ getWeatherEmoji(current.weather[0].main) }}</span>
        <div>
          <p class="city">📍 {{ cityLabel }}</p>
          <p class="desc">{{ current.weather[0].description }}</p>
        </div>
      </div>
      <p class="temp">{{ displayTemp }}{{ configStore.unitSymbol }}</p>
      <ul class="detail-list">
        <li>체감 온도: {{ displayFeelsLike }}{{ configStore.unitSymbol }}</li>
        <li>대기 습도: {{ current.main.humidity }}%</li>
        <li>현재 풍속: {{ current.wind.speed }}m/s</li>
      </ul>

      <div v-if="forecastItems.length" class="forecast-strip">
        <div v-for="(item, index) in forecastItems" :key="index" class="forecast-item">
          <p class="f-time">{{ item.hour }}시</p>
          <p class="f-emoji">{{ item.emoji }}</p>
          <p class="f-temp">{{ item.temp }}{{ configStore.unitSymbol }}</p>
        </div>
      </div>
    </template>

    <RouterLink to="/practice4" class="back-btn">← 메인 대시보드로 돌아가기</RouterLink>
  </div>
</template>

<style scoped>
.detail-view {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.detail-title {
  font-size: 16px;
  margin: 0 0 14px;
}
.detail-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}
.emoji {
  font-size: 34px;
}
.city {
  font-weight: 700;
  font-size: 15px;
  margin: 0;
}
.desc {
  font-size: 12px;
  color: #6b7280;
  margin: 2px 0 0;
}
.temp {
  font-size: 30px;
  font-weight: 800;
  margin: 8px 0;
}
.detail-list {
  padding-left: 18px;
  font-size: 13px;
  color: #374151;
  line-height: 1.8;
  margin: 0 0 16px;
}
.forecast-strip {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
  margin-bottom: 16px;
}
.forecast-item {
  flex: 0 0 auto;
  text-align: center;
  background: #f9fafb;
  border-radius: 10px;
  padding: 10px 14px;
  min-width: 60px;
}
.f-time {
  font-size: 11px;
  color: #6b7280;
  margin: 0 0 6px;
}
.f-emoji {
  font-size: 18px;
  margin: 0 0 6px;
}
.f-temp {
  font-size: 12px;
  font-weight: 600;
  margin: 0;
}
.back-btn {
  display: inline-block;
  margin-top: 8px;
  background: #1f2937;
  color: #fff;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
}
</style>
