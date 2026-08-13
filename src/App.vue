<script setup>
import { RouterLink, RouterView } from 'vue-router'

import PracticeApp from './PracticeApp.vue'
import ExerciseApp from './ExerciseApp.vue'

// 종합실습(Weather 1~9)을 보려면 'exercise'로 둡니다. 다른 코드챌린지 작업 중이면 'practice'/'router'로 바꿔서 확인하세요.
const MODE = 'exercise' // 'practice' | 'exercise' | 'router'
</script>

<template>
  <PracticeApp v-if="MODE === 'practice'" />

  <ExerciseApp v-else-if="MODE === 'exercise'" />

  <div v-else-if="MODE === 'router'">
    <nav>
      <RouterLink to="/">Home</RouterLink>
      |
      <RouterLink to="/about">About</RouterLink>
    </nav>

    <RouterView />
  </div>
</template>
