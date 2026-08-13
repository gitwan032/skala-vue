<script setup>
import { watchEffect } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useConfigStore } from './stores/configStore.js'
import { useSeasonStore, SEASONS } from './stores/seasonStore.js'

const configStore = useConfigStore()
const seasonStore = useSeasonStore()

// 레이아웃은 그대로 두고, 계절 accent 색상만 <html data-season="..">으로 전환한다
watchEffect(() => {
  document.documentElement.setAttribute('data-season', seasonStore.season)
})
</script>

<template>
  <div class="site">
    <header class="site-header dock-card">
      <RouterLink to="/" class="brand">
        <span class="brand-icon">{{ seasonStore.current.emoji }}</span>
        <span class="brand-text">날씨</span>
      </RouterLink>

      <nav class="site-nav">
        <RouterLink to="/" class="nav-link" exact-active-class="nav-link--active">홈</RouterLink>
        <RouterLink to="/mountains" class="nav-link" active-class="nav-link--active">🏔️ 명산 컬렉션</RouterLink>
        <RouterLink to="/about" class="nav-link" active-class="nav-link--active">서비스 소개</RouterLink>
      </nav>

      <div class="header-actions">
        <div class="season-switch" role="group" aria-label="계절 테마 선택">
          <button
            v-for="s in SEASONS"
            :key="s.key"
            type="button"
            class="season-btn"
            :class="{ 'season-btn--active': seasonStore.season === s.key }"
            :title="s.label + ' 테마'"
            @click="seasonStore.setSeason(s.key)"
          >
            {{ s.emoji }}
          </button>
        </div>
        <button class="unit-btn" @click="configStore.toggleUnit()">
          {{ configStore.unitLabel }}({{ configStore.unitSymbol }})
        </button>
      </div>
    </header>

    <main class="site-main">
      <RouterView />
    </main>

    <footer class="site-footer">Weather Web Service · OpenWeatherMap &amp; Open-Meteo 기반</footer>
  </div>
</template>

<style scoped>
.site {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.site-header {
  margin: 16px 16px 0;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}
.brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  font-size: 18px;
  color: var(--ink);
}
.brand-icon {
  font-size: 26px;
}
.site-nav {
  display: flex;
  gap: 6px;
  flex: 1;
  flex-wrap: wrap;
}
.nav-link {
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  font-size: 13px;
  font-weight: 700;
  color: var(--ink-soft);
  border: var(--border-w) solid transparent;
}
.nav-link:hover {
  border-color: var(--ink);
}
.nav-link--active {
  background: var(--accent);
  border-color: var(--ink);
  color: #fff;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.season-switch {
  display: flex;
  gap: 4px;
  border: var(--border-w) solid var(--ink);
  border-radius: var(--radius-pill);
  padding: 4px;
  background: var(--card-bg);
}
.season-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: transparent;
  font-size: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.season-btn--active {
  background: var(--accent);
}
.unit-btn {
  border: var(--border-w) solid var(--ink);
  background: var(--card-bg);
  color: var(--ink);
  border-radius: var(--radius-pill);
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.unit-btn:hover {
  background: var(--accent-light-8);
}
.site-main {
  flex: 1;
  padding: 20px 16px 60px;
}
.site-footer {
  text-align: center;
  padding: 16px;
  font-size: 12px;
  color: var(--ink-faint);
}
@media (max-width: 760px) {
  .site-header { margin: 8px; padding: 10px 12px; gap: 8px; }
  .brand-text { display: none; }
  .site-nav { order: 3; flex-basis: 100%; overflow-x: auto; flex-wrap: nowrap; }
  .nav-link { flex: 0 0 auto; padding: 7px 11px; font-size: 12px; }
  .header-actions { margin-left: auto; gap: 6px; }
  .season-btn { width: 26px; height: 26px; }
  .unit-btn { padding: 7px 10px; }
  .site-main { padding: 10px 8px 36px; }
}
</style>
