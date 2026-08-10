<script setup>
import { ref } from 'vue'

const imageUrl = ref('https://vuejs.org/images/logo.png')
const linkUrl = ref('https://vuejs.org/')
const isDisabled = ref(true)
</script>

<template>
  <div class="practice-section">
    <h2>v-bind 디렉티브 학습</h2>

    <img v-bind:src="imageUrl" alt="Vue Logo" width="100" />

    <br />

    <a v-bind:href="linkUrl">Vue 공식 사이트</a>

    <br />

    <button v-bind:disabled="isDisabled">
      클릭할 수 없는 버튼
    </button>
  </div>
</template>