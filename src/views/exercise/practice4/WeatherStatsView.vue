<script setup>
// 본인 추가 view(요구사항6): 날씨 통계 페이지. Store(⑤) 단위 변환이 함께 적용된다.
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useConfigStore } from '../../../stores/configStore.js'

const configStore = useConfigStore()

const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '수원', temp: 24, status: '비' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
  { id: 'city_04', name: '울산', temp: 22, status: '흐림' },
])

const maxTempCity = computed(() =>
  weatherList.value.reduce((max, c) => (c.temp > max.temp ? c : max), weatherList.value[0]),
)
const minTempCity = computed(() =>
  weatherList.value.reduce((min, c) => (c.temp < min.temp ? c : min), weatherList.value[0]),
)
const averageTemp = computed(() => {
  const sum = weatherList.value.reduce((acc, c) => acc + c.temp, 0)
  return configStore.convert(sum / weatherList.value.length)
})
</script>

<template>
  <div class="stats-view">
    <h3 class="stats-title">날씨 통계 (단위: {{ configStore.unitLabel }})</h3>
    <ul class="stats-list">
      <li>등록된 도시 수: {{ weatherList.length }}개</li>
      <li>평균 기온: {{ averageTemp }}{{ configStore.unitSymbol }}</li>
      <li>
        최고 기온 도시: {{ maxTempCity.name }} ({{ configStore.convert(maxTempCity.temp)
        }}{{ configStore.unitSymbol }})
      </li>
      <li>
        최저 기온 도시: {{ minTempCity.name }} ({{ configStore.convert(minTempCity.temp)
        }}{{ configStore.unitSymbol }})
      </li>
      <li>단위 전환 누적 횟수: {{ configStore.toggleCount }}회</li>
    </ul>
    <RouterLink to="/practice4" class="back-btn">← 메인 대시보드로 돌아가기</RouterLink>
  </div>
</template>

<style scoped>
.stats-view {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.stats-title {
  font-size: 16px;
  margin: 0 0 14px;
}
.stats-list {
  margin: 0 0 20px;
  padding-left: 18px;
  font-size: 13px;
  color: #374151;
  line-height: 1.9;
}
.back-btn {
  display: inline-block;
  background: #1f2937;
  color: #fff;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
}
</style>
