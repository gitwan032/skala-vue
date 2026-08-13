<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="not-found dock-card">
    <div class="icon">🌤️❓</div>
    <h1>페이지를 찾을 수 없습니다.</h1>
    <p>요청하신 주소가 존재하지 않습니다.</p>
    <RouterLink to="/" class="back-btn dock-pill dock-pill--accent">홈으로 이동</RouterLink>
  </div>
</template>

<style scoped>
.not-found {
  max-width: 480px;
  margin: 60px auto 0;
  text-align: center;
  padding: 40px 20px;
}
.icon {
  font-size: 40px;
  margin-bottom: 12px;
}
h1 {
  font-size: 17px;
  margin: 0 0 8px;
  color: var(--ink);
}
p {
  font-size: 13px;
  color: var(--ink-faint);
  margin: 0 0 20px;
}
.back-btn {
  display: inline-block;
}
</style>
