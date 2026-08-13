<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div class="practice-section">
    <h2>v-once 디렉티브 학습</h2>

    <p>일반 출력: {{ count }}</p>
    <p v-once>v-once 출력: {{ count }}</p>

    <button @click="count++">숫자 증가</button>
  </div>
</template>
