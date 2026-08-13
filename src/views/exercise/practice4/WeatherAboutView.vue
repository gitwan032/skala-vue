<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="about-view">
    <h3 class="about-title">서비스 소개</h3>
    <p class="about-desc">
      본 화면은 종합실습4(Router)를 뼈대로 종합실습5(Store)·6(Axios)·7(UI
      Library)·8(Refinement)·9(Deployment)가 차례로 진화해 들어간 하나의 라우터 블록입니다.
    </p>
    <ul class="about-list">
      <li>components/exercise/practice4/ 폴더 내부의 특화 부품(Element Plus 기반) 연동</li>
      <li>클라이언트 사이드 라우팅을 통한 새로고침 없는 화면 전환 + 동적 상세 경로</li>
      <li>URL 쿼리 스트링 매핑을 활용한 실시간 검색 상태 동기화</li>
      <li>Pinia configStore를 통한 섭씨/화씨 단위 전역 상태 관리</li>
      <li>axios + OpenWeatherMap/Open-Meteo를 통한 실시간 날씨·예보 데이터 연동</li>
    </ul>
    <RouterLink to="/practice4" class="back-btn">대시보드 홀로 이동</RouterLink>
  </div>
</template>

<style scoped>
.about-view {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.about-title {
  font-size: 16px;
  margin: 0 0 10px;
}
.about-desc {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.6;
  margin: 0 0 14px;
}
.about-list {
  margin: 0 0 20px;
  padding-left: 18px;
  font-size: 13px;
  color: #374151;
  line-height: 1.8;
}
.back-btn {
  display: block;
  text-align: center;
  background: #2563eb;
  color: #fff;
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
}
</style>
