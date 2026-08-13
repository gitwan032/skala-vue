<script setup>
const props = defineProps({
  message: String,
})

const emit = defineEmits(['change-message'])

const sendMessage = () => {
  emit('change-message', '자식이 보낸 메시지')
}
</script>

<template>
  <section>
    <h3>자식 컴포넌트</h3>

    <p>
      부모에게 받은 데이터:
      {{ props.message }}
    </p>

    <button @click="sendMessage">부모에게 메시지 보내기</button>
  </section>
</template>
