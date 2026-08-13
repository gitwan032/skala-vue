<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="about-view">
    <el-card shadow="never">
      <h1>서비스 소개</h1>
      <p>
        이 서비스는 Vue 3, Vue Router, Pinia, Element Plus로 제작된 실시간 날씨 웹 애플리케이션입니다.
        Open-Meteo Geocoding API로 도시명을 좌표로 변환하고, OpenWeatherMap API로 실시간 날씨와 시간별 예보를 조회합니다.
      </p>
      <ul>
        <li>도시명 검색 + 실시간 필터로 전국 주요 도시 날씨 조회</li>
        <li>지역별 날씨 카드(즐겨찾기 별표, 정렬, 자동 기온 캐러셀)</li>
        <li>섭씨/화씨 단위 전역 전환, 봄/여름/가을/겨울 컬러 테마 전환 (Pinia)</li>
        <li>클라이언트 사이드 라우팅 기반 상세 페이지 (Vue Router, 동적 경로)</li>
        <li>전국 명산 컬렉션 + 월별 인증 도장 모으기</li>
      </ul>
      <RouterLink to="/" class="back-btn dock-pill dock-pill--accent">홈으로 돌아가기</RouterLink>
    </el-card>
  </div>
</template>

<style scoped>
.about-view {
  max-width: 640px;
  margin: 0 auto;
}
h1 {
  font-size: 18px;
  margin: 0 0 12px;
  color: var(--ink);
}
p {
  font-size: 13px;
  color: var(--ink-soft);
  line-height: 1.7;
  margin: 0 0 14px;
}
ul {
  padding-left: 18px;
  font-size: 13px;
  color: var(--ink-soft);
  line-height: 1.8;
  margin: 0 0 20px;
}
.back-btn {
  display: inline-block;
}
</style>
