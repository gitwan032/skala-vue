<script setup>
// WeatherParent.vue (요구사항 1: 모든 반응형 데이터 유지)
import { ref, computed, watch, watchEffect } from 'vue'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'
import StatusBar from './StatusBar.vue'

const searchQuery = ref('')
const selectedCityInfo = ref(null)
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '수원', temp: 24, status: '비' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
  { id: 'city_04', name: '인천', temp: 22, status: '흐림' },
])

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

// SearchBar에서 update-query 이벤트로 전달된 검색어를 반영
const handleUpdateQuery = (value) => {
  searchQuery.value = value
}

// WeatherCard에서 select-card 이벤트로 전달된 도시 객체를 반영
const selectCard = (city) => {
  selectedCityInfo.value = city
}

// WeatherCard에서 click-detail 이벤트로 전달된 도시 객체로 alert 표시
const showDetail = (city) => {
  window.alert(`${city.name}의 현재 날씨는 [${city.status}] 상태입니다.`)
}
</script>

<template>
  <div class="weather-parent">
    <h2 class="section-title">종합실습3 · Weather Component (4개 컴포넌트 분리)</h2>

    <BaseDashboardCard title="도시 검색" icon="🔍">
      <SearchBar :search-query="searchQuery" @update-query="handleUpdateQuery" />
    </BaseDashboardCard>

    <BaseDashboardCard title="지역별 날씨 현황" icon="📋">
      <p v-if="searchQuery && filteredWeatherList.length === 0" class="empty-msg">
        검색 결과와 일치하는 도시가 없습니다.
      </p>
      <div v-else>
        <WeatherCard
          v-for="city in displayList"
          :key="city.id"
          :city="city"
          @select-card="selectCard"
          @click-detail="showDetail"
        />
      </div>
    </BaseDashboardCard>

    <StatusBar :message="statusMessage" />
  </div>
</template>

<style scoped>
.weather-parent {
  max-width: 640px;
  margin: 0 auto 40px;
}
.section-title {
  font-size: 18px;
  margin-bottom: 18px;
}
.empty-msg {
  color: #9ca3af;
  font-size: 13px;
  text-align: center;
  padding: 20px 0;
}
</style>
