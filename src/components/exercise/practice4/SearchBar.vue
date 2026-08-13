<script setup>
// 종합실습3(Component)의 props/emits 계약(update-query)을 유지하면서,
// 종합실습6(Axios)에서 실시간 외부 API 검색(submit-search)이 추가되고,
// 종합실습7(UI Library)에서 Element Plus el-input으로 재단장되었다.
defineProps({
  searchQuery: { type: String, default: '' },
})

const emit = defineEmits(['update-query', 'submit-search'])

const handleInput = (value) => emit('update-query', value)
const handleSubmit = () => emit('submit-search')
</script>

<template>
  <div class="search-bar">
    <el-input
      :model-value="searchQuery"
      placeholder="도시 이름 입력 후 Enter (즐겨찾기 필터 + 실시간 검색)"
      clearable
      @update:model-value="handleInput"
      @keyup.enter="handleSubmit"
    />
    <p class="search-echo">검색 중인 도시: {{ searchQuery }}</p>
  </div>
</template>

<style scoped>
.search-echo {
  margin: 10px 0 0;
  font-size: 13px;
  color: #4b5563;
}
</style>
