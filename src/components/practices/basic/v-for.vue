<script setup>
import { ref } from 'vue'

const fruits = ref(['사과', '바나나', '레몬'])

const user = ref({
  name: '홍길동',
  age: 23,
  role: '개발자',
})

const items = ref([
  { id: 'prod_101', name: '아이폰' },
  { id: 'prod_102', name: '갤럭시' },
])
</script>

<template>
  <div class="practice-section">
    <h2>v-for 학습</h2>

    <h3>배열 반복</h3>

    <ul>
      <li v-for="(fruit, index) in fruits" :key="index">{{ index + 1 }}번 과일: {{ fruit }}</li>
    </ul>

    <h3>객체 반복</h3>

    <ul>
      <li v-for="(value, key, index) in user" :key="key">[{{ index }}] {{ key }} : {{ value }}</li>
    </ul>

    <h3>객체 배열 반복</h3>

    <ul>
      <li v-for="(item, index) in items" :key="item.id">[{{ index }}] {{ item.name }}</li>
    </ul>
  </div>
</template>
