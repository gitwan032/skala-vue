<script setup>
import { ref } from 'vue'

const lazyText = ref('')
const age = ref('')
const userEmail = ref('')
const price = ref('')
</script>

<template>
  <div class="practice-section">
    <h2>v-model 수식어 (Modifiers) 활용</h2>

    <!-- 1. lazy -->
    <section>
      <h3>1) .lazy</h3>

      <input type="text" v-model.lazy="lazyText" placeholder="입력 후 Enter 또는 외부 클릭" />

      <p>
        확정된 값: <strong>{{ lazyText }}</strong>
      </p>
    </section>

    <!-- 2. number -->
    <section>
      <h3>2) .number</h3>

      <input type="text" v-model.number="age" placeholder="나이를 입력하세요" />

      <p>입력된 값: {{ age }}</p>
      <p>데이터 타입: {{ typeof age }}</p>
    </section>

    <!-- 3. trim -->
    <section>
      <h3>3) .trim</h3>

      <input type="text" v-model.trim="userEmail" placeholder="앞뒤 공백을 포함해 입력해 보세요" />

      <p>공백 제거된 값: "{{ userEmail }}"</p>
      <p>문자열 길이: {{ userEmail.length }}</p>
    </section>

    <!-- 4. chaining -->
    <section>
      <h3>4) .trim.number</h3>

      <input
        type="text"
        v-model.trim.number="price"
        placeholder="공백과 숫자를 섞어 입력해 보세요"
      />

      <p>처리된 값: "{{ price }}"</p>
      <p>데이터 타입: {{ typeof price }}</p>
    </section>
  </div>
</template>
