<script setup>
import { ref } from 'vue'

const rawHtmlData = ref(
  '<span style="color: red; font-weight: bold;">빨간색 굵은 글자</span>'
)
</script>

<template>
  <div class="practice-section">
    <h2>v-html 디렉티브 학습</h2>

    <h3>일반 보간법 사용</h3>
    <p>{{ rawHtmlData }}</p>

    <h3>v-html 사용</h3>
    <div v-html="rawHtmlData"></div>
  </div>
</template>
