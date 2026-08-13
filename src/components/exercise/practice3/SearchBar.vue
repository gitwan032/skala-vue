<script setup>
// 요구사항 3: 부모로부터 검색어(반응형 데이터)를 props로 전달받아 표시.
// 입력이 있을 때 update-query 이벤트로 검색어를 부모에게 전달 (emits)
defineProps({
  searchQuery: { type: String, default: '' },
})

const emit = defineEmits(['update-query'])

const handleInput = (event) => {
  emit('update-query', event.target.value)
}
</script>

<template>
  <div class="search-bar">
    <input
      class="search-input"
      type="text"
      placeholder="검색할 도시 이름 입력"
      :value="searchQuery"
      @input="handleInput"
    />
    <p class="search-echo">검색 중인 도시: {{ searchQuery }}</p>
  </div>
</template>

<style scoped>
.search-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}
.search-echo {
  margin: 10px 0 0;
  font-size: 13px;
  color: #4b5563;
}
</style>
