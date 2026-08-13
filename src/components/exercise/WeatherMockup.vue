<script setup>
// 종합실습1 · Weather Mockup
import { ref } from 'vue'

// 요구사항 1: 배열 렌더링 (v-for) - 임의의 날씨 데이터 배열
// 요구사항 5: 본인만의 데이터 추가 (city_04 인천 추가)
const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '수원', temp: 24, status: '비' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
  { id: 'city_04', name: '인천', temp: 22, status: '흐림' },
])

// 요구사항 3: 양방향 바인딩 및 한글 처리 (:value, @input)
const searchText = ref('')
const handleSearchInput = (event) => {
  searchText.value = event.target.value
}

// 요구사항 4: 이벤트 - 카드 클릭 시 상태바 문구 변경
const statusMessage = ref('카드를 클릭하거나 검색해 보세요.')
const selectCard = (city) => {
  statusMessage.value = `${city.name}이 선택되었습니다.`
}

// 요구사항 4: 상세보기 버튼 클릭 (버블링 없이 window.alert)
const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
</script>

<template>
  <div class="weather-mockup">
    <h2 class="section-title">종합실습1 · Weather Mockup</h2>

    <section class="panel">
      <h3 class="panel-title">🔍 도시 검색</h3>
      <input
        class="search-input"
        type="text"
        placeholder="검색할 도시 이름 입력"
        :value="searchText"
        @input="handleSearchInput"
      />
      <p class="search-echo">검색 중인 도시: {{ searchText }}</p>
    </section>

    <section class="panel">
      <h3 class="panel-title">📋 지역별 날씨 현황</h3>
      <div class="card-list">
        <div
          v-for="city in weatherList"
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
  </div>
</template>

<style scoped>
.weather-mockup {
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
}
</style>
