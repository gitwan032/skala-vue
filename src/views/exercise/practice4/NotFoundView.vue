<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="not-found">
    <div class="not-found-icon">🌤️❓</div>
    <h3>페이지를 찾을 수 없습니다.</h3>
    <p>요청하신 주소가 존재하지 않거나, 아직 개발되지 않았습니다.</p>
    <RouterLink to="/practice4" class="back-btn">날씨 메인으로 이동</RouterLink>
  </div>
</template>

<style scoped>
.not-found {
  background: #fff;
  border-radius: 14px;
  padding: 40px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  text-align: center;
}
.not-found-icon {
  font-size: 36px;
  margin-bottom: 10px;
}
.not-found h3 {
  font-size: 16px;
  margin: 0 0 8px;
}
.not-found p {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 20px;
}
.back-btn {
  display: inline-block;
  background: #2563eb;
  color: #fff;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
}
</style>
