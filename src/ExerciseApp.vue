<script setup>
// 종합실습 허브: 가이드(우재남 Day4-3, 1.3절) 기준 4개 블록으로 구성한다.
// ①②③은 독립 블록, ④는 Router를 뼈대로 Store(⑤)·Axios(⑥)·UI Library(⑦)·Refinement(⑧)·
// Deployment(⑨)가 계속 진화해 들어간 하나의 라우터 블록이다. (화면을 9개 만들지 않는다)
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import WeatherMockup from './components/exercise/WeatherMockup.vue'
import WeatherComposition from './components/exercise/WeatherComposition.vue'
import WeatherParent from './components/exercise/practice3/WeatherParent.vue'

const route = useRoute()
const router = useRouter()

const tabs = [
  { key: 'practice1', label: '① Mockup' },
  { key: 'practice2', label: '② Composition' },
  { key: 'practice3', label: '③ Component' },
  { key: 'practice4', label: '④ Router → Store → Axios → UI Library → Deployment' },
]

const currentTab = ref('practice1')

const selectTab = (key) => {
  currentTab.value = key
  // ④ 블록은 실제 Vue Router 라우트를 사용하므로 탭 전환 시 해당 경로로 이동시킨다.
  if (key === 'practice4' && !route.path.startsWith('/practice4')) {
    router.push('/practice4')
  }
}

// 주소창에 /practice4 딥링크로 바로 접속한 경우 해당 탭을 활성화
onMounted(() => {
  if (route.path.startsWith('/practice4')) currentTab.value = 'practice4'
})
</script>

<template>
  <div class="exercise-app">
    <h1 class="app-title">Vue.js 종합실습</h1>
    <nav class="tab-nav">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="tab-btn"
        :class="{ 'tab-btn--active': currentTab === tab.key }"
        @click="selectTab(tab.key)"
      >
        {{ tab.label }}
      </button>
    </nav>

    <div class="tab-content">
      <WeatherMockup v-if="currentTab === 'practice1'" />
      <WeatherComposition v-else-if="currentTab === 'practice2'" />
      <WeatherParent v-else-if="currentTab === 'practice3'" />
      <RouterView v-else-if="currentTab === 'practice4'" />
    </div>
  </div>
</template>

<style scoped>
.exercise-app {
  max-width: 720px;
  margin: 0 auto;
  padding: 20px;
}
.app-title {
  font-size: 20px;
  margin-bottom: 16px;
}
.tab-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}
.tab-btn {
  padding: 9px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  color: #374151;
}
.tab-btn--active {
  background: #1f2937;
  border-color: #1f2937;
  color: #fff;
}
.tab-content {
  min-height: 200px;
}
</style>
