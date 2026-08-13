<script setup>
// 종합실습3(Component)의 slot 패턴을 유지하면서, 종합실습7(UI Library)에서 Element Plus로 재단장.
defineProps({
  title: { type: String, default: '' },
  icon: { type: String, default: '' },
})
</script>

<template>
  <el-card class="dashboard-card" shadow="never">
    <template #header>{{ icon }} {{ title }}</template>
    <slot />
  </el-card>
</template>

<style scoped>
.dashboard-card {
  margin-bottom: 16px;
}
</style>
