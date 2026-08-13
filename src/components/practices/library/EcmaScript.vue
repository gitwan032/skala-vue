<script setup>
import { ref } from 'vue'

const result1 = ref('')
const result2 = ref('')
const result3 = ref('')

// 275쪽: Prettier 포맷팅 확인
const myRegion = 'Suwon'
const regionGreeting = `웰컴 투 ${myRegion}`

// 276쪽: Vite 빌드 모드에 따라 주입되는 환경변수 확인
const currentApiUrl = import.meta.env.VITE_API_URL
console.log('현재 주입된 API 서버 주소:', currentApiUrl)

// 250쪽: 회원 명단 가공 및 VIP 추출
const runTask1 = () => {
  const members = ['홍준식', '홍두깨', '안정현', '박부산']

  const rawData = {
    id: 101,
    grade: 'VIP',
    details: {
      score: 95,
    },
  }

  const memberContainsPark = members.includes('박부산')

  const {
    grade,
    details: { score },
  } = rawData

  result1.value =
    `부산 포함 여부: ${memberContainsPark}` + ` / 등급: ${grade}` + ` / 점수: ${score}점`
}

// 251쪽: 장바구니 추가 및 기본값 방어
const runTask2 = () => {
  const currentCart = ['Apple', 'Banana']

  const newProduct = {
    name: 'Orange',
    stock: 0,
    preview: null,
  }

  const updatedCart = [...currentCart, newProduct.name]

  const imgStatus = newProduct.preview?.url ?? '이미지 준비중'

  const finalStock = newProduct.stock ?? 0

  result2.value =
    `카트: ${updatedCart.join(', ')}` + ` / 이미지: ${imgStatus}` + ` / 수량: ${finalStock}개`
}

// 252쪽: 가상의 Backend API
const fetchUserId = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        uid: 777,
      })
    }, 400)
  })

const fetchUserProfile = (uid) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        uid,
        nick: 'Graves',
      })
    }, 400)
  })

// Async/Await 비동기 연쇄 처리
const runTask3 = async () => {
  result3.value = '⏳ 데이터 동기화 중...'

  try {
    // 첫 번째 요청 완료를 기다림
    const { uid } = await fetchUserId()

    // 첫 번째 결과를 두 번째 요청에 전달
    const { nick } = await fetchUserProfile(uid)

    result3.value = `동기화 성공: ${nick}님 환영합니다.`
  } catch (error) {
    console.error('사용자 정보 동기화 실패:', error)

    result3.value = '통신 실패'
  }
}
</script>

<template>
  <section class="practice-section">
    <h2>Modern JavaScript Code Challenge</h2>

    <!-- 250쪽 과제 1 -->
    <div class="quiz-card">
      <h3>과제 1. 데이터 추출 및 포맷팅</h3>

      <button @click="runTask1">과제 1 가동</button>

      <div class="console">결과창 1: {{ result1 }}</div>
    </div>

    <!-- 251쪽 과제 2 -->
    <div class="quiz-card">
      <h3>과제 2. 불변성 복사 및 데이터 방어</h3>

      <button @click="runTask2">과제 2 가동</button>

      <div class="console">결과창 2: {{ result2 }}</div>
    </div>

    <!-- 252쪽 과제 3 -->
    <div class="quiz-card">
      <h3>과제 3. 비동기 연쇄 파이프라인 (Async/Await)</h3>

      <button @click="runTask3">과제 3 가동</button>

      <div class="console">결과창 3: {{ result3 }}</div>
    </div>

    <!-- 275~276쪽: Prettier 및 환경변수 확인 -->
    <div class="quiz-card">
      <h3>Vite Build & Deployment 확인</h3>

      <p>{{ regionGreeting }}</p>
      <p>현재 API URL: {{ currentApiUrl }}</p>
    </div>
  </section>
</template>

<style scoped>
.quiz-card {
  padding: 16px;
  margin-top: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
}

.console {
  padding: 12px;
  margin-top: 12px;
  color: #67c23a;
  background: #1f2937;
  border-radius: 6px;
}
</style>
