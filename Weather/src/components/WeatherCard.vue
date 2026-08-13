<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useConfigStore } from '../stores/configStore.js'
import { useFavoritesStore } from '../stores/favoritesStore.js'
import { getWeatherEmoji } from '../api/weatherApi.js'

const props = defineProps({
  city: { type: Object, required: true },
  weather: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

const router = useRouter()
const configStore = useConfigStore()
const favoritesStore = useFavoritesStore()

const displayTemp = computed(() => {
  if (!props.weather) return null
  return configStore.convert(props.weather.main.temp)
})

const isFavorite = computed(() => favoritesStore.isFavorite(props.city.id))

const goDetail = () => {
  router.push(`/city/${encodeURIComponent(props.city.name)}`)
}

const toggleFavorite = () => {
  favoritesStore.toggle(props.city.id)
}
</script>

<template>
  <el-card class="weather-card" shadow="hover" @click="goDetail">
    <button class="fav-btn" :class="{ 'fav-btn--active': isFavorite }" type="button" @click.stop="toggleFavorite">
      {{ isFavorite ? '★' : '☆' }}
    </button>

    <div class="avatar-circle">
      <span>{{ weather ? getWeatherEmoji(weather.weather[0].main) : '☁️' }}</span>
    </div>

    <p class="city-name">{{ city.name }}</p>
    <p class="city-region">{{ city.region }}</p>

    <el-skeleton v-if="loading && !weather" :rows="1" animated class="temp-skeleton" />
    <div v-else-if="weather" class="temp-row">
      <span class="temp-value">{{ displayTemp }}{{ configStore.unitSymbol }}</span>
      <span class="temp-desc">{{ weather.weather[0].description }}</span>
    </div>
    <p v-else class="temp-error">날씨 정보 없음</p>
  </el-card>
</template>

<style scoped>
.weather-card {
  position: relative;
  cursor: pointer;
  min-height: 215px;
  background: color-mix(in srgb, var(--card-bg-solid) 52%, transparent) !important;
  backdrop-filter: blur(18px);
}
.fav-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid var(--ink);
  background: var(--card-bg);
  font-size: 15px;
  color: var(--ink-faint);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.fav-btn--active {
  color: var(--accent);
  border-color: var(--accent);
}
.avatar-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  margin-bottom: 12px;
}
.city-name {
  font-weight: 800;
  font-size: 17px;
  margin: 0;
  color: var(--ink);
}
.city-region {
  font-size: 12.5px;
  color: var(--ink-faint);
  margin: 2px 0 12px;
}
.temp-skeleton {
  margin-top: 6px;
}
.temp-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.temp-value {
  font-size: 22px;
  font-weight: 800;
  color: var(--ink);
}
.temp-desc {
  font-size: 12.5px;
  font-weight: 650;
  color: var(--ink-faint);
}
.temp-error {
  font-size: 12px;
  color: var(--ink-faint);
  margin: 0;
}
</style>
