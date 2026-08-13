<script setup>
// 종합실습5(Store) 요구사항 1: 단위 설정을 변경하는 UI 버튼과 영역
import { useConfigStore } from '../../../stores/configStore.js'

const configStore = useConfigStore()
</script>

<template>
  <div class="unit-toggler">
    <span class="unit-label"
      >날씨단위: {{ configStore.unitLabel }}({{ configStore.unitSymbol }})</span
    >
    <el-button size="small" @click="configStore.toggleUnit()">단위변경</el-button>
  </div>
</template>

<style scoped>
.unit-toggler {
  display: flex;
  align-items: center;
  gap: 8px;
}
.unit-label {
  font-size: 12px;
  color: #374151;
  font-weight: 600;
}
</style>
