<script setup>
import { Search } from '@element-plus/icons-vue'

defineProps({
  modelValue: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'submit'])
</script>

<template>
  <el-input
    :model-value="modelValue"
    size="large"
    placeholder="도시·지역·산 이름 입력 (예: 강릉, 경기, 설악산...)"
    :prefix-icon="Search"
    clearable
    @update:model-value="(v) => emit('update:modelValue', v)"
    @keyup.enter="emit('submit')"
  />
</template>
