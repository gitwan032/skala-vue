import { defineStore } from 'pinia'
import { MOUNTAINS } from '../data/mountains.js'

const STORAGE_KEY = 'mountain-stamps'

// 로컬 저장소에서 인증 도장 기록을 불러온다. 형태: { [mountainId]: ['2026-06', '2026-08', ...] }
const loadStamps = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const saveStamps = (stamps) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stamps))
  } catch {
    // 저장 실패(프라이빗 모드 등)는 조용히 무시하고 메모리 상태만 유지한다
  }
}

const currentYearMonth = () => {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  return `${yyyy}-${mm}`
}

// 산 인증 도장 컬렉션 스토어: 산마다 "이번 달에 이미 인증했는지"를 관리하고,
// 인증 기록은 매달 하나씩 누적된다 (한 달에 한 번만 도장을 찍을 수 있음)
export const useMountainStore = defineStore('mountain', {
  state: () => ({
    // { [mountainId]: string[] } 형태의 인증 이력 (YYYY-MM 목록)
    stamps: loadStamps(),
  }),
  getters: {
    // 이번 달 기준으로 이미 인증한 산인지 확인
    isStampedThisMonth: (state) => (mountainId) => {
      const history = state.stamps[mountainId] || []
      return history.includes(currentYearMonth())
    },
    // 특정 산의 전체 인증 이력 (최신순)
    stampHistory: (state) => (mountainId) => {
      const history = state.stamps[mountainId] || []
      return [...history].sort().reverse()
    },
    // 특정 산의 누적 인증 횟수
    stampCount: (state) => (mountainId) => (state.stamps[mountainId] || []).length,
    // 한 번이라도 인증한 산의 개수 (컬렉션 진행률용)
    collectedCount: (state) => Object.keys(state.stamps).filter((id) => state.stamps[id]?.length > 0).length,
    // 전체 산 개수
    totalMountainCount: () => MOUNTAINS.length,
    // 컬렉션 진행률(%)
    collectionProgress() {
      if (this.totalMountainCount === 0) return 0
      return Math.round((this.collectedCount / this.totalMountainCount) * 100)
    },
    // 지금까지 찍은 전체 도장 개수(누적, 중복 월 포함)
    totalStampCount: (state) =>
      Object.values(state.stamps).reduce((sum, history) => sum + history.length, 0),
  },
  actions: {
    // 이번 달 인증 도장을 찍는다. 이미 이번 달에 인증했다면 아무 동작도 하지 않고 false를 반환한다.
    stampMountain(mountainId) {
      const ym = currentYearMonth()
      const history = this.stamps[mountainId] || []
      if (history.includes(ym)) {
        return false
      }
      this.stamps = {
        ...this.stamps,
        [mountainId]: [...history, ym],
      }
      saveStamps(this.stamps)
      return true
    },
  },
})
