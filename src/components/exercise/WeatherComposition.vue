<script setup>
// 종합실습2 · Weather Composition
import { ref, computed, watch, watchEffect } from 'vue'

// 요구사항 1: 반응형 상태 관리 (1일차 동일한 데이터)
const searchQuery = ref('')
const selectedCityInfo = ref(null)
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '수원', temp: 24, status: '비' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
  { id: 'city_04', name: '인천', temp: 22, status: '흐림' },
])

// 요구사항 2: computed - 검색어가 도시 이름에 포함된 항목만 필터링
const filteredWeatherList = computed(() => {
  if (!searchQuery.value) return weatherList.value
  return weatherList.value.filter((city) => city.name.includes(searchQuery.value))
})

// 요구사항 4: 템플릿에 실제로 뿌려줄 목록 (검색어가 비었으면 원본, 있으면 필터링 결과)
const displayList = computed(() =>
  searchQuery.value ? filteredWeatherList.value : weatherList.value,
)

const statusMessage = computed(() =>
  selectedCityInfo.value
    ? `${selectedCityInfo.value.name}이 선택되었습니다.`
    : '카드를 클릭하거나 검색해 보세요.',
)

// 요구사항 5(본인 추가): 평균 기온 computed
const averageTemp = computed(() => {
  const list = weatherList.value
  const sum = list.reduce((acc, city) => acc + city.temp, 0)
  return Math.round((sum / list.length) * 10) / 10
})

// 요구사항 3: watch - selectedCityInfo 감시 (상태바 문구 변경 시 콘솔로그)
watch(selectedCityInfo, (newVal) => {
  if (newVal) {
    console.log(
      `[watch 감지] 상태바 문구가 업데이트되었습니다 -> '${newVal.name}이 선택되었습니다.'`,
    )
  }
})

// 요구사항 3: watchEffect - searchQuery 타이핑 추적
watchEffect(() => {
  console.log(
    `[watchEffect 자동 호출] 현재 검색어 '${searchQuery.value}'에 매칭되는 데이터를 필터링합니다.`,
  )
})

// 요구사항 5(본인 추가): 검색 결과 건수 변화를 감시하는 watcher
watch(filteredWeatherList, (newList) => {
  console.log(`[watch 추가] 검색 결과 개수가 ${newList.length}건으로 변경되었습니다.`)
})

const handleSearchInput = (event) => {
  searchQuery.value = event.target.value
}

const selectCard = (city) => {
  selectedCityInfo.value = city
}

const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
</script>

<template>
  <div class="weather-composition">
    <h2 class="section-title">종합실습2 · Weather Composition</h2>

    <section class="panel">
      <h3 class="panel-title">🔍 도시 검색</h3>
      <input
        class="search-input"
        type="text"
        placeholder="검색할 도시 이름 입력"
        :value="searchQuery"
        @input="handleSearchInput"
      />
      <p class="search-echo">검색 중인 도시: {{ searchQuery }}</p>
      <p class="avg-line">평균 기온(전체 도시): {{ averageTemp }}°C</p>
    </section>

    <section class="panel">
      <h3 class="panel-title">📋 지역별 날씨 현황</h3>

      <p v-if="searchQuery && filteredWeatherList.length === 0" class="empty-msg">
        검색 결과와 일치하는 도시가 없습니다.
      </p>

      <div v-else class="card-list">
        <div
          v-for="city in displayList"
          :key="city.id"
          class="weather-card"
          @click="selectCard(city)"
        >
          <div class="card-head">
            <span class="city-name">{{ city.name }} ({{ city.status }})</span>
            <button class="detail-btn" @click.stop="showDetail(city.name, city.status)">
              상세보기
            </button>
          </div>
          <p class="temp-line">현재 기온: {{ city.temp }}°C</p>
          <span v-if="city.temp >= 25" class="badge badge-hot">🔥 더움 (25도 이상)</span>
          <span v-else class="badge badge-cool">❄️ 선선함 (25도 미만)</span>
        </div>
      </div>
    </section>

    <p class="status-bar">{{ statusMessage }}</p>
    <p class="console-hint">
      ※ watch / watchEffect 로그는 브라우저 개발자도구 콘솔에서 확인할 수 있습니다.
    </p>
  </div>
</template>

<style scoped>
.weather-composition {
  max-width: 640px;
  margin: 0 auto 40px;
}
.section-title {
  font-size: 18px;
  margin-bottom: 18px;
}
.panel {
  background: #fff;
  border-radius: 14px;
  padding: 18px 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.panel-title {
  font-size: 15px;
  margin: 0 0 12px;
}
.search-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}
.search-echo {
  margin: 10px 0 0;
  font-size: 13px;
  color: #4b5563;
}
.avg-line {
  margin: 4px 0 0;
  font-size: 13px;
  color: #6b7280;
}
.empty-msg {
  color: #9ca3af;
  font-size: 13px;
  text-align: center;
  padding: 20px 0;
}
.card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.weather-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px 16px;
  cursor: pointer;
  transition: box-shadow 0.15s;
}
.weather-card:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.city-name {
  font-weight: 700;
  font-size: 15px;
}
.detail-btn {
  border: 1px solid #d1d5db;
  background: #f9fafb;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
}
.temp-line {
  margin: 0 0 8px;
  font-size: 13px;
  color: #374151;
}
.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}
.badge-hot {
  background: #fee2e2;
  color: #dc2626;
}
.badge-cool {
  background: #dbeafe;
  color: #2563eb;
}
.status-bar {
  text-align: center;
  background: #dcfce7;
  color: #166534;
  padding: 10px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
}
.console-hint {
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
}
</style>
