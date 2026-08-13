<script setup>
import { ref, watch } from 'vue'

const city = ref('서울')
const temperature = ref(25)

watch([city, temperature], ([newCity, newTemp], [oldCity, oldTemp]) => {
  console.log(`도시: ${oldCity} → ${newCity}`)
  console.log(`온도: ${oldTemp} → ${newTemp}`)
})
</script>

<template>
  <div class="practice-section">
    <h2>Multi-Source Watch 학습</h2>

    <p>현재 도시: {{ city }}</p>
    <p>현재 온도: {{ temperature }}℃</p>

    <button @click="city = '부산'">부산으로 변경</button>

    <button @click="temperature++">온도 증가</button>
  </div>
</template>
