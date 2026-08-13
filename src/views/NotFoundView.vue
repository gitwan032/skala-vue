<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleGoHome = () => {
  router.push('/')
}
</script>

<template>
  <main class="not-found">
    <h1>404</h1>
    <h2>페이지를 찾을 수 없습니다.</h2>

    <p>요청한 주소가 존재하지 않거나 변경되었습니다.</p>

    <button @click="handleGoHome">홈으로 돌아가기</button>
  </main>
</template>

<style scoped>
.not-found {
  padding: 40px 20px;
  text-align: center;
}

.not-found h1 {
  font-size: 64px;
  margin-bottom: 10px;
}

.not-found button {
  margin-top: 20px;
  padding: 10px 16px;
  cursor: pointer;
}
</style>
