<script setup>
import { ref } from 'vue'

const textColor = ref('blue')
const fontSize = ref(20)
const boxWidth = ref(200)
const boxHeight = ref(100)
</script>

<template>
  <div class="practice-section">
    <h2>v-bind 디렉티브 고급 (스타일 바인딩)</h2>

    <h3>텍스트 스타일 변경</h3>

    <p :style="{ color: textColor, fontSize: fontSize + 'px' }">스타일이 적용되는 텍스트입니다.</p>

    <button @click="textColor = textColor === 'blue' ? 'red' : 'blue'">글자 색상 변경</button>

    <button @click="fontSize += 2">글자 크기 증가</button>

    <h3>박스 크기 변경</h3>

    <div
      :style="{
        width: boxWidth + 'px',
        height: boxHeight + 'px',
        backgroundColor: 'lightgray',
      }"
    >
      크기가 변경되는 박스
    </div>

    <button @click="boxWidth += 20">너비 증가</button>

    <button @click="boxHeight += 20">높이 증가</button>
  </div>
</template>
