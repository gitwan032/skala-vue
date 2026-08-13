<script setup>
import { storeToRefs } from 'pinia'
import { useCounterStore } from '@/stores/counter.js'

const counterStore = useCounterStore()

// State와 Getter는 storeToRefs()로 반응성을 보존합니다.
const { count, doubleCount } = storeToRefs(counterStore)

// Action은 일반 함수이므로 바로 구조 분해해도 됩니다.
const { increment } = counterStore
</script>

<template>
  <div class="practice-section">
    <h2>Counter Store 활용 실습</h2>

    <p>
      원본 카운트 데이터(state):
      <strong>{{ count }}</strong>
    </p>

    <p>
      2배 연산 데이터(getters):
      <strong>{{ doubleCount }}</strong>
    </p>

    <button @click="increment">숫자 1 증가 (actions)</button>
  </div>
</template>
