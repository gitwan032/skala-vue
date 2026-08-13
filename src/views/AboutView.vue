<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleGoHome = () => {
  router.push('/')
}

const handleReplaceHome = () => {
  router.replace('/')
}

const handleGoBack = () => {
  router.go(-1)
}
</script>

<template>
  <div class="about">
    <h1>This is an about page</h1>

    <div class="button-group">
      <button @click="handleGoHome">홈으로 이동 (push)</button>

      <button @click="handleReplaceHome">홈으로 이동 (replace)</button>

      <button @click="handleGoBack">이전 화면으로</button>
    </div>
  </div>
</template>

<style>
.about {
  padding: 20px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
</style>
