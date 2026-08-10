<script setup>
import { ref } from 'vue'

const score = ref(85)
</script>

<template>
  <div class="practice-section">
    <h2>v-if 조건부 렌더링 학습</h2>

    <p>현재 점수: {{ score }}</p>

    <p v-if="score >= 95">A등급입니다.</p>
    <p v-else-if="score >= 85">B등급입니다.</p>
    <p v-else-if="score >= 75">C등급입니다.</p>
    <p v-else>재시험이 필요합니다.</p>

    <button @click="score += 5">점수 +5</button>
    <button @click="score -= 5">점수 -5</button>
  </div>
</template>