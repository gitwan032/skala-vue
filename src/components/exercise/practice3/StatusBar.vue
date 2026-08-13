<script setup>
// 요구사항 7(본인 추가 컴포넌트): 상태바 표시를 별도 컴포넌트로 추가 분리
defineProps({
  message: { type: String, default: '' },
})
</script>

<template>
  <p class="status-bar">{{ message }}</p>
</template>

<style scoped>
.status-bar {
  text-align: center;
  background: #dcfce7;
  color: #166534;
  padding: 10px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
}
</style>
