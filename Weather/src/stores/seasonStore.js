import { defineStore } from 'pinia'

export const SEASONS = [
  { key: 'spring', label: '봄', emoji: '🌸' },
  { key: 'summer', label: '여름', emoji: '☀️' },
  { key: 'fall', label: '가을', emoji: '🍂' },
  { key: 'winter', label: '겨울', emoji: '❄️' },
]

// 한국 기상청 기준 계절 구분: 봄(3~5월)/여름(6~8월)/가을(9~11월)/겨울(12~2월)
const detectSeasonByMonth = (month) => {
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'fall'
  return 'winter'
}

const STORAGE_KEY = 'season-override'

const loadOverride = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || null
  } catch {
    return null
  }
}

// 디자인의 모양(레이아웃)은 사계절 내내 동일하고, 색상 테마만 계절에 맞게 바뀐다.
// 기본값은 오늘 날짜 기준 자동 감지된 계절이며, 사용자가 헤더에서 직접 계절을 눌러 미리볼 수 있다.
export const useSeasonStore = defineStore('season', {
  state: () => ({
    season: loadOverride() || detectSeasonByMonth(new Date().getMonth() + 1),
    isAuto: !loadOverride(),
  }),
  getters: {
    current: (state) => SEASONS.find((s) => s.key === state.season) || SEASONS[1],
  },
  actions: {
    setSeason(key) {
      if (!SEASONS.some((s) => s.key === key)) return
      this.season = key
      this.isAuto = false
      try {
        localStorage.setItem(STORAGE_KEY, key)
      } catch {
        // ignore storage failures
      }
    },
    resetToAuto() {
      this.season = detectSeasonByMonth(new Date().getMonth() + 1)
      this.isAuto = true
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        // ignore storage failures
      }
    },
  },
})
