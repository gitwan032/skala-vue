<script setup>
import { ref } from 'vue'

const isVisible = ref(true)
</script>

<template>
  <div class="practice-section">
    <h2>v-show 학습</h2>

    <button @click="isVisible = !isVisible">보이기 / 숨기기</button>

    <p v-show="isVisible">v-show로 제어되는 내용입니다.</p>
  </div>
</template>
