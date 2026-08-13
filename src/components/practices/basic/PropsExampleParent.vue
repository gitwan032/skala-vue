<script setup>
import { ref } from 'vue'
import PropsExampleChild from './PropsExampleChild.vue'

const message = ref('부모가 보낸 데이터')

const changeMessage = (value) => {
  message.value = value
}
</script>

<template>
  <section>
    <h2>부모 컴포넌트</h2>

    <p>
      현재 메시지:
      {{ message }}
    </p>

    <PropsExampleChild :message="message" @change-message="changeMessage" />
  </section>
</template>
