<script setup>
import { ref } from 'vue'

const message = ref('안녕하세요!')
const htmlMessage = ref('<strong>굵은 글씨</strong>')
</script>

<template>
  <div class="practice-section">
    <h2>v-text 디렉티브 학습</h2>

    <h3>일반 보간법</h3>
    <p>{{ message }}</p>

    <h3>v-text 사용</h3>
    <p v-text="message"></p>

    <h3>HTML 문자열을 v-text로 출력</h3>
    <p v-text="htmlMessage"></p>
  </div>
</template>