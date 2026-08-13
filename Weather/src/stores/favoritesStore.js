import { defineStore } from 'pinia'

const STORAGE_KEY = 'favorite-cities'

const loadFavorites = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveFavorites = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // ignore storage failures (private mode 등)
  }
}

// 지역별 날씨 카드에서 별 아이콘으로 즐겨찾기 하는 도시 목록을 관리한다
export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    ids: loadFavorites(),
  }),
  getters: {
    count: (state) => state.ids.length,
    isFavorite: (state) => (cityId) => state.ids.includes(cityId),
  },
  actions: {
    toggle(cityId) {
      if (this.ids.includes(cityId)) {
        this.ids = this.ids.filter((id) => id !== cityId)
      } else {
        this.ids = [...this.ids, cityId]
      }
      saveFavorites(this.ids)
    },
  },
})
