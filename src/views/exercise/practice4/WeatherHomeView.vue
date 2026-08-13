<script setup>
// WeatherHomeView.vue: 종합실습4(Router)의 WeatherParent 대체 화면.
// ④ Router → ⑤ Store(단위) → ⑥ Axios(실시간 데이터+외부 API) → ⑦ UI Library(Element Plus) 순으로
// 같은 화면이 계속 진화한 최종 상태입니다.
import { ref, computed, watch, watchEffect, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseDashboardCard from '../../../components/exercise/practice4/BaseDashboardCard.vue'
import SearchBar from '../../../components/exercise/practice4/SearchBar.vue'
import WeatherCard from '../../../components/exercise/practice4/WeatherCard.vue'
import {
  QUICK_CITIES,
  fetchQuickCityWeather,
  fetchWeatherByCityName,
} from '../../../api/weatherApi.js'

const route = useRoute()
const router = useRouter()

// 요구사항(Axios): 하드코딩 목데이터 대신 Open-Meteo 실시간 데이터로 채운다
const weatherList = ref([])
const isLoadingQuickCities = ref(true)
const searchError = ref('')
const isSearching = ref(false)

// URL 쿼리 스트링(?q=...)으로부터 검색 상태 초기화 (실시간 검색 상태 동기화)
const searchQuery = ref(route.query.q ? String(route.query.q) : '')
const selectedCityInfo = ref(null)

const filteredWeatherList = computed(() => {
  if (!searchQuery.value) return weatherList.value
  return weatherList.value.filter((city) => city.name.includes(searchQuery.value))
})
const displayList = computed(() =>
  searchQuery.value ? filteredWeatherList.value : weatherList.value,
)

const statusMessage = computed(() =>
  selectedCityInfo.value
    ? `${selectedCityInfo.value.name}이 선택되었습니다.`
    : '카드를 클릭하거나 검색해 보세요.',
)

watch(selectedCityInfo, (newVal) => {
  if (newVal) {
    console.log(
      `[watch 감지] 상태바 문구가 업데이트되었습니다 -> '${newVal.name}이 선택되었습니다.'`,
    )
  }
})

watchEffect(() => {
  console.log(
    `[watchEffect 자동 호출] 현재 검색어 '${searchQuery.value}'에 매칭되는 데이터를 필터링합니다.`,
  )
})

watch(searchQuery, (newVal) => {
  router.replace({ query: newVal ? { q: newVal } : {} })
})

const loadQuickCities = async () => {
  isLoadingQuickCities.value = true
  try {
    weatherList.value = await Promise.all(QUICK_CITIES.map(fetchQuickCityWeather))
  } catch (error) {
    console.error('즐겨찾기 도시 날씨 조회 실패:', error)
  } finally {
    isLoadingQuickCities.value = false
  }
}
onMounted(loadQuickCities)

const handleUpdateQuery = (value) => {
  searchQuery.value = value
}

const selectCard = (city) => {
  selectedCityInfo.value = city
}

// 요구사항(Router): window.alert() 제거, Programmatic Navigation으로 대체
const goDetail = (city) => {
  router.push('/practice4/weather/' + encodeURIComponent(city.id))
}

// 요구사항(Axios): 즐겨찾기에 없는 도시도 Open-Meteo로 실시간 검색
const handleSubmitSearch = async () => {
  const keyword = searchQuery.value.trim()
  if (!keyword) return

  const matched = weatherList.value.find((city) => city.name === keyword)
  if (matched) {
    goDetail(matched)
    return
  }

  searchError.value = ''
  isSearching.value = true
  try {
    const result = await fetchWeatherByCityName(keyword)
    if (!result.place) {
      searchError.value = `'${keyword}' 검색 결과가 없습니다.`
      return
    }
    router.push('/practice4/weather/' + encodeURIComponent(result.place.name))
  } catch (error) {
    console.error('실시간 검색 실패:', error)
    searchError.value = '검색 중 오류가 발생했습니다.'
  } finally {
    isSearching.value = false
  }
}
</script>

<template>
  <div class="weather-home">
    <BaseDashboardCard title="도시 검색" icon="🔍">
      <SearchBar
        :search-query="searchQuery"
        @update-query="handleUpdateQuery"
        @submit-search="handleSubmitSearch"
      />
      <p class="hint">
        즐겨찾기 도시는 입력할 때마다 바로 필터링되고, Enter를 누르면 실시간으로 해당 도시를
        검색합니다.
      </p>
      <el-alert
        v-if="searchError"
        :title="searchError"
        type="warning"
        :closable="false"
        show-icon
        style="margin-top: 10px"
      />
    </BaseDashboardCard>

    <BaseDashboardCard title="지역별 날씨 현황" icon="📋">
      <el-skeleton v-if="isLoadingQuickCities" :rows="4" animated />
      <p v-else-if="searchQuery && filteredWeatherList.length === 0" class="empty-msg">
        검색 결과와 일치하는 도시가 없습니다.
      </p>
      <div v-else>
        <WeatherCard
          v-for="city in displayList"
          :key="city.id"
          :city="city"
          @select-card="selectCard"
          @click-detail="goDetail"
        />
      </div>
    </BaseDashboardCard>

    <el-alert :title="statusMessage" type="success" :closable="false" center />
  </div>
</template>

<style scoped>
.hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: #9ca3af;
}
.empty-msg {
  color: #9ca3af;
  font-size: 13px;
  text-align: center;
  padding: 20px 0;
}
</style>
