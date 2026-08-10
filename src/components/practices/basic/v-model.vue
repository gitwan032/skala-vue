<script setup>
import { ref } from 'vue'

const text1 = ref('')
const text2 = ref('')

const comment = ref('')
const isAgreed = ref(false)
const favoriteFruits = ref([])
const gender = ref('')
const selectedCar = ref('')
</script>

<template>
  <div class="practice-section">
    <h2>v-model 양방향 데이터 바인딩</h2>

    <h3>1) v-model 축약 문법</h3>

    <input
      type="text"
      v-model="text1"
      placeholder="여기에 입력하세요"
    />

    <p>
      입력된 값: <strong>{{ text1 }}</strong>
    </p>


    <h3>2) v-model의 내부 작동 원리</h3>

    <input
      type="text"
      :value="text2"
      @input="(e) => (text2 = e.target.value)"
      placeholder="원리 파악용 입력창"
    />

    <p>
      입력된 값: <strong>{{ text2 }}</strong>
    </p>


    <h3>3) Textarea</h3>

    <textarea
      v-model="comment"
      placeholder="의견을 남겨주세요"
    ></textarea>

    <p>데이터 상태: {{ comment }}</p>


    <h3>4) 단일 Checkbox</h3>

    <label>
      <input type="checkbox" v-model="isAgreed" />
      약관에 동의합니다.
    </label>

    <p>데이터 상태: {{ isAgreed }}</p>


    <h3>5) 다중 Checkbox</h3>

    <label>
      <input type="checkbox" value="사과" v-model="favoriteFruits" />
      사과
    </label>

    <label>
      <input type="checkbox" value="바나나" v-model="favoriteFruits" />
      바나나
    </label>

    <label>
      <input type="checkbox" value="레몬" v-model="favoriteFruits" />
      레몬
    </label>

    <p>데이터 상태: {{ favoriteFruits }}</p>


    <h3>6) Radio</h3>

    <label>
      <input type="radio" value="남성" v-model="gender" />
      남성
    </label>

    <label>
      <input type="radio" value="여성" v-model="gender" />
      여성
    </label>

    <p>데이터 상태: {{ gender }}</p>


    <h3>7) Select</h3>

    <select v-model="selectedCar">
      <option value="">-- 선택하세요 --</option>
      <option value="tesla">테슬라</option>
      <option value="hyundai">현대자동차</option>
      <option value="bmw">BMW</option>
    </select>

    <p>데이터 상태: {{ selectedCar }}</p>
  </div>
</template>