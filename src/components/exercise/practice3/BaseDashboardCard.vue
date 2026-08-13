<script setup>
// 요구사항 2: 검색박스/리스트박스의 디자인을 공통화하는 껍데기 컴포넌트
// <slot>을 통해 부모(WeatherParent)가 내부 콘텐츠(도시 검색 / 날씨 현황)를 주입한다.
defineProps({
  title: { type: String, default: '' },
  icon: { type: String, default: '' },
})
</script>

<template>
  <section class="dashboard-card">
    <h3 class="dashboard-card-title">{{ icon }} {{ title }}</h3>
    <slot />
  </section>
</template>

<style scoped>
.dashboard-card {
  background: #fff;
  border-radius: 14px;
  padding: 18px 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.dashboard-card-title {
  font-size: 15px;
  margin: 0 0 12px;
}
</style>
