<script setup>
import { ref } from 'vue'

const count = ref(0)

const increment = () => {
  count.value++
}
</script>

<template>
  <div class="practice-section">
    <h2>ref() 학습</h2>

    <p>현재 값: {{ count }}</p>

    <button @click="increment">
      증가
    </button>
  </div>
</template>