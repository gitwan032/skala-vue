<script setup>
// 종합실습4(Router) 요구사항: Navigation Bar(RouterLink) + 메인 콘텐츠 영역(RouterView) 배치.
// 종합실습5(Store) 요구사항: Navigation Bar 옆에 UnitToggler 배치.
import { RouterLink, RouterView } from 'vue-router'
import UnitToggler from '../../../components/exercise/practice4/UnitToggler.vue'
</script>

<template>
  <div class="practice4-layout">
    <h2 class="section-title">
      종합실습4 · Weather Router → Store → Axios → UI Library → Deployment
    </h2>
    <div class="nav-row">
      <nav class="tab-nav">
        <RouterLink to="/practice4" class="tab-link" exact-active-class="tab-link--active"
          >📊 날씨 대시보드</RouterLink
        >
        <RouterLink to="/practice4/about" class="tab-link" active-class="tab-link--active"
          >ℹ️ 서비스 소개</RouterLink
        >
        <RouterLink to="/practice4/stats" class="tab-link" active-class="tab-link--active"
          >📈 날씨 통계</RouterLink
        >
      </nav>
      <UnitToggler />
    </div>
    <RouterView />
  </div>
</template>

<style scoped>
.practice4-layout {
  max-width: 640px;
  margin: 0 auto 40px;
}
.section-title {
  font-size: 18px;
  margin-bottom: 14px;
}
.nav-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}
.tab-nav {
  display: flex;
  gap: 8px;
}
.tab-link {
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  background: #fff;
  border: 1px solid #e5e7eb;
  color: #374151;
  text-decoration: none;
}
.tab-link--active {
  background: #2563eb;
  border-color: #2563eb;
  color: #fff;
}
</style>
