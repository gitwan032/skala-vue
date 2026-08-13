import { defineStore } from 'pinia'

// 날씨 단위를 세팅하는 스토어 (종합실습5)
export const useConfigStore = defineStore('config', {
  state: () => ({
    unit: 'celsius', // 초기값: celsius
    toggleCount: 0, // 본인 추가(state): 단위를 전환한 누적 횟수
  }),
  getters: {
    // 현재 단위 상태에 맞는 기호 (℃ / ℉)
    unitSymbol: (state) => (state.unit === 'celsius' ? '℃' : '℉'),
    // 본인 추가(getter): 단위의 한글 라벨
    unitLabel: (state) => (state.unit === 'celsius' ? '섭씨' : '화씨'),
  },
  actions: {
    // 'celsius'와 'fahrenheit'를 토글(스위칭)
    toggleUnit() {
      this.unit = this.unit === 'celsius' ? 'fahrenheit' : 'celsius'
      this.toggleCount += 1
    },
    // 본인 추가(action): 단위를 초기값(celsius)으로 되돌림
    resetUnit() {
      this.unit = 'celsius'
    },
    // 본인 추가(action): 섭씨 원본 값을 현재 단위 기준으로 변환 (Axios 실데이터 화면에서 재사용)
    convert(celsiusTemp) {
      if (this.unit === 'fahrenheit') {
        return Math.round((celsiusTemp * 9) / 5 + 32)
      }
      return Math.round(celsiusTemp)
    },
  },
})
