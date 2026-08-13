<script setup>
// 요구사항 4: 선택된 도시 객체를 props로 전달받아 표시.
// 카드 선택(select-card)과 상세보기(click-detail) 이벤트를 부모에게 전달 (emits)
const props = defineProps({
  city: { type: Object, required: true },
})

const emit = defineEmits(['select-card', 'click-detail'])

const handleSelect = () => emit('select-card', props.city)
const handleDetail = () => emit('click-detail', props.city)
</script>

<template>
  <div class="weather-card" @click="handleSelect">
    <div class="card-head">
      <span class="city-name">{{ city.name }} ({{ city.status }})</span>
      <button class="detail-btn" @click.stop="handleDetail">상세보기</button>
    </div>
    <p class="temp-line">현재 기온: {{ city.temp }}°C</p>
    <span v-if="city.temp >= 25" class="badge badge-hot">🔥 더움 (25도 이상)</span>
    <span v-else class="badge badge-cool">❄️ 선선함 (25도 미만)</span>
  </div>
</template>

<style scoped>
.weather-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px 16px;
  cursor: pointer;
  transition: box-shadow 0.15s;
  margin-bottom: 12px;
}
.weather-card:last-child {
  margin-bottom: 0;
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
</style>
