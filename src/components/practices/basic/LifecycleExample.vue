<script setup>
import { ref, onMounted, onUpdated, onUnmounted } from 'vue'

const count = ref(0)

console.log('setup 실행')

onMounted(() => {
  console.log('onMounted 실행 - 화면 표시 완료')
})

onUpdated(() => {
  console.log(`onUpdated 실행 - count: ${count.value}`)
})

onUnmounted(() => {
  console.log('onUnmounted 실행 - 컴포넌트 제거')
})
</script>

<template>
  <section>
    <h2>Lifecycle Hook Example</h2>

    <p>현재 값: {{ count }}</p>

    <button @click="count++">증가</button>
  </section>
</template>
