<script setup>
defineOptions({ name: 'ComputedPractice' })
import { ref, computed } from 'vue'

const price = ref(10000)
const quantity = ref(1)

const totalPrice = computed(() => {
  return price.value * quantity.value
})
</script>

<template>
  <div class="practice-section">
    <h2>computed() 학습</h2>

    <p>가격: {{ price }}원</p>
    <p>수량: {{ quantity }}개</p>
    <p>총 가격: {{ totalPrice }}원</p>

    <button @click="quantity++">수량 증가</button>
  </div>
</template>
