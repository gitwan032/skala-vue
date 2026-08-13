<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 228쪽: 회원가입 Form
const userForm = ref({
  email: '',
  agree: false,
})

// 229쪽: 상품 수량과 별점
const productQuantity = ref(1)
const productRate = ref(4)

// 230쪽: 다운로드 진행 상태
const downloadProgress = ref(0)
const isDownloading = ref(false)

// 회원가입 검증
const handleRegister = () => {
  if (!userForm.value.email.includes('@')) {
    ElMessage.error('❌ 올바른 이메일 형식이 아닙니다.')
    return
  }

  if (!userForm.value.agree) {
    ElMessage.warning('⚠️ 이용약관에 동의하셔야 합니다.')
    return
  }

  ElMessage.success('🎉 가입 신청이 정상적으로 완료되었습니다!')
}

// 파일 삭제 확인
const confirmDelete = () => {
  ElMessageBox.confirm('서버에서 해당 파일을 영구히 삭제하시겠습니까?', '🔥 최종 경고', {
    confirmButtonText: '네, 삭제합니다',
    cancelButtonText: '취소',
    type: 'warning',
  })
    .then(() => {
      ElMessage.success('🗑️ 파일이 안전하게 파쇄되었습니다.')
    })
    .catch(() => {
      ElMessage.info('❌ 삭제 작업이 취소되었습니다.')
    })
}

// 다운로드 진행률 애니메이션
const startDownload = () => {
  // 실행 중 중복 클릭 방지
  if (isDownloading.value) {
    return
  }

  isDownloading.value = true
  downloadProgress.value = 0

  const interval = setInterval(() => {
    downloadProgress.value += 20

    if (downloadProgress.value >= 100) {
      clearInterval(interval)
      downloadProgress.value = 100
      isDownloading.value = false

      ElMessage.success('💾 대용량 데이터 로드가 완료되었습니다!')
    }
  }, 400)
}
</script>

<template>
  <section class="practice-section">
    <h2>Element Plus Code Challenge</h2>

    <!-- 228쪽: 회원가입 -->
    <el-card shadow="hover">
      <template #header>
        <strong>회원가입</strong>
      </template>

      <el-form label-width="100px">
        <el-form-item label="이메일">
          <el-input v-model="userForm.email" placeholder="example@email.com" clearable />
        </el-form-item>

        <el-form-item label="이용약관">
          <el-switch v-model="userForm.agree" />
        </el-form-item>

        <el-button type="primary" @click="handleRegister"> 회원가입 </el-button>
      </el-form>
    </el-card>

    <!-- 229쪽: 상품 수량과 별점 -->
    <el-card shadow="hover" style="margin-top: 20px">
      <template #header>
        <strong>상품 주문</strong>
      </template>

      <div style="margin-bottom: 20px">
        <p>구매 수량</p>

        <el-input-number v-model="productQuantity" :min="1" :max="10" />
      </div>

      <div>
        <p>상품 별점</p>

        <el-rate v-model="productRate" show-score />
      </div>

      <el-divider />

      <p>
        선택한 수량:
        <strong>{{ productQuantity }}개</strong>
      </p>

      <p>
        선택한 별점:
        <strong>{{ productRate }}점</strong>
      </p>
    </el-card>

    <!-- 230쪽: 삭제 확인과 진행률 -->
    <el-card shadow="hover" style="margin-top: 20px">
      <template #header>
        <strong>파일 관리</strong>
      </template>

      <el-button type="danger" @click="confirmDelete"> 삭제 테스트 </el-button>

      <el-button
        type="success"
        :loading="isDownloading"
        :disabled="isDownloading"
        @click="startDownload"
      >
        동기화 시작
      </el-button>

      <el-progress
        style="margin-top: 20px"
        :percentage="downloadProgress"
        :status="downloadProgress === 100 ? 'success' : undefined"
      />
    </el-card>
  </section>
</template>
