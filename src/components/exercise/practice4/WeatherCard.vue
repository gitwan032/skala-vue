<script setup>
// 종합실습3(Component) props/emits 계약(select-card, click-detail)을 유지하면서,
// 종합실습5(Store)에서 configStore 단위 변환이, 종합실습7(UI Library)에서 Element Plus 스타일이 추가되었다.
import { computed } from 'vue'
import { useConfigStore } from '../../../stores/configStore.js'

const props = defineProps({
  city: { type: Object, required: true },
})

const emit = defineEmits(['select-card', 'click-detail'])
const configStore = useConfigStore()

const displayTemp = computed(() => {
  const rawTemp = props.city.temp // 기본 원본 데이터는 섭씨 숫자
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32) // 화씨 변환 연산
  }
  return rawTemp // 'celsius'일 때는 원본 그대로 반환
})

const handleSelect = () => emit('select-card', props.city)
const handleDetail = () => emit('click-detail', props.city)
</script>

<template>
  <el-card class="weather-card" shadow="hover" @click="handleSelect">
    <div class="card-head">
      <span class="city-name">{{ city.name }}</span>
      <el-button size="small" @click.stop="handleDetail">상세보기</el-button>
    </div>
    <p class="status-line">{{ city.status }}</p>
    <p class="temp-line">{{ displayTemp }}{{ configStore.unitSymbol }}</p>
    <el-tag v-if="city.temp >= 25" type="danger" effect="light" size="small"
      >🔥 더움 (25도 이상)</el-tag
    >
    <el-tag v-else type="primary" effect="light" size="small">❄️ 선선함 (25도 미만)</el-tag>
  </el-card>
</template>

<style scoped>
.weather-card {
  cursor: pointer;
  margin-bottom: 12px;
}
.weather-card:last-child {
  margin-bottom: 0;
}
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.city-name {
  font-weight: 700;
  font-size: 15px;
}
.status-line {
  margin: 0 0 6px;
  font-size: 12px;
  color: #6b7280;
}
.temp-line {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 700;
}
</style>
