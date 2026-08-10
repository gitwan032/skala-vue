<script setup>
import { ref } from 'vue'

const count = ref(0)

function handleClick() {
  alert('버튼이 클릭되었습니다!')
}
</script>

<template>
  <div class="practice-section">
    <h2>v-on 이벤트 학습</h2>

    <button @click="count++">
      클릭 수: {{ count }}
    </button>

    <button @click="handleClick">
      클릭하세요
    </button>
  </div>
</template>
