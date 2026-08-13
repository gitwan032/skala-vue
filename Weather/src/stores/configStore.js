import { defineStore } from 'pinia'

// 전역 날씨 단위(섭씨/화씨) 상태 관리
export const useConfigStore = defineStore('config', {
  state: () => ({
    unit: 'celsius',
    toggleCount: 0
  }),
  getters: {
    unitSymbol: (state) => (state.unit === 'celsius' ? '℃' : '℉'),
    unitLabel: (state) => (state.unit === 'celsius' ? '섭씨' : '화씨')
  },
  actions: {
    setUnit(unit) {
      if (!['celsius', 'fahrenheit'].includes(unit) || this.unit === unit) return
      this.unit = unit
      this.toggleCount += 1
    },
    toggleUnit() {
      this.setUnit(this.unit === 'celsius' ? 'fahrenheit' : 'celsius')
    },
    resetUnit() {
      this.unit = 'celsius'
    },
    // 섭씨 원본 값을 현재 단위 기준으로 변환
    convert(celsiusTemp) {
      if (this.unit === 'fahrenheit') {
        return Math.round((celsiusTemp * 9) / 5 + 32)
      }
      return Math.round(celsiusTemp)
    }
  }
})
