<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const BASE_URL = 'https://jsonplaceholder.typicode.com/posts'

const items = ref([])
const textInput = ref('')
const message = ref('')

// GET: 게시물 3개 조회
const handleRead = async () => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        _limit: 3,
      },
    })

    items.value = response.data
    message.value = 'GET 성공'
  } catch (error) {
    console.error('GET 실패:', error)
    message.value = 'GET 실패'
  }
}

// POST: 게시물 생성
const handleCreate = async () => {
  if (!textInput.value.trim()) {
    message.value = '내용을 입력하세요.'
    return
  }

  try {
    const response = await axios.post(BASE_URL, {
      title: textInput.value,
      body: 'Axios로 생성한 게시물',
      userId: 1,
    })

    items.value.unshift(response.data)
    textInput.value = ''
    message.value = 'POST 성공'
  } catch (error) {
    console.error('POST 실패:', error)
    message.value = 'POST 실패'
  }
}

// PUT: 게시물 수정
const handleUpdate = async (item) => {
  const updatedTitle = window.prompt('수정할 제목을 입력하세요.', item.title)

  if (!updatedTitle || !updatedTitle.trim()) {
    return
  }

  try {
    const response = await axios.put(`${BASE_URL}/${item.id}`, {
      ...item,
      title: updatedTitle,
    })

    const index = items.value.findIndex((currentItem) => currentItem.id === item.id)

    if (index !== -1) {
      items.value[index] = response.data
    }

    message.value = 'PUT 성공'
  } catch (error) {
    console.error('PUT 실패:', error)
    message.value = 'PUT 실패'
  }
}

// DELETE: 화면과 서버에서 게시물 삭제 요청
const handleDelete = async (id) => {
  try {
    await axios.delete(`${BASE_URL}/${id}`)

    items.value = items.value.filter((item) => item.id !== id)
    message.value = 'DELETE 성공'
  } catch (error) {
    console.error('DELETE 실패:', error)
    message.value = 'DELETE 실패'
  }
}

onMounted(() => {
  handleRead()
})
</script>

<template>
  <section class="practice-section">
    <h2>Axios JSON Example</h2>

    <input v-model="textInput" type="text" placeholder="새 게시물 제목" />

    <button @click="handleCreate">POST 생성</button>

    <button @click="handleRead">GET 다시 조회</button>

    <p>{{ message }}</p>

    <ul>
      <li v-for="item in items" :key="item.id">
        <strong>{{ item.id }}. {{ item.title }}</strong>

        <button @click="handleDelete(item.id)">DELETE</button>
        <button @click="handleUpdate(item)">PUT</button>
      </li>
    </ul>
  </section>
</template>
