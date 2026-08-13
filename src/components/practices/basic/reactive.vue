<script setup>
import { reactive } from 'vue'

defineOptions({
  name: 'ReactivePractice',
})

const user = reactive({
  name: '홍준식',
  age: 20,
})

const increaseAge = () => {
  user.age++
}
</script>

<template>
  <div class="practice-section">
    <h2>reactive() 학습</h2>

    <p>이름: {{ user.name }}</p>
    <p>나이: {{ user.age }}</p>

    <button @click="increaseAge">나이 증가</button>
  </div>
</template>
