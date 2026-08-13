<script setup>
import { computed } from 'vue'
import { useConfigStore } from '../stores/configStore.js'
import { getWeatherEmoji } from '../api/weatherApi.js'

const props = defineProps({
  forecast: { type: Array, default: () => [] }
})

const configStore = useConfigStore()

const items = computed(() =>
  props.forecast.map((item) => ({
    time: new Date(item.dt * 1000).getHours(),
    emoji: getWeatherEmoji(item.weather[0].main),
    temp: configStore.convert(item.main.temp)
  }))
)
</script>

<template>
  <div class="forecast-strip">
    <div v-for="(item, index) in items" :key="index" class="forecast-item">
      <p class="time">{{ item.time }}시</p>
      <p class="emoji">{{ item.emoji }}</p>
      <p class="temp">{{ item.temp }}{{ configStore.unitSymbol }}</p>
    </div>
  </div>
</template>

<style scoped>
.forecast-strip {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.forecast-item {
  flex: 0 0 auto;
  text-align: center;
  background: var(--accent-light-9);
  border: 2px solid var(--ink);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  min-width: 64px;
}
.time {
  font-size: 12px;
  color: var(--ink-faint);
  margin: 0 0 6px;
}
.emoji {
  font-size: 20px;
  margin: 0 0 6px;
}
.temp {
  font-size: 13px;
  font-weight: 700;
  margin: 0;
  color: var(--ink);
}
</style>
