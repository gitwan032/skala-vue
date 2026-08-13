// 종합실습4 전용 하위 라우트 (Lazy Loading + Catch-all Route)
export const practice4Children = [
  {
    path: '',
    name: 'Practice4Home',
    component: () => import('../views/exercise/practice4/WeatherHomeView.vue'),
  },
  {
    path: 'about',
    name: 'Practice4About',
    component: () => import('../views/exercise/practice4/WeatherAboutView.vue'),
  },
  {
    path: 'weather/:cityId',
    name: 'Practice4Detail',
    component: () => import('../views/exercise/practice4/WeatherDetailView.vue'),
  },
  {
    path: 'stats',
    name: 'Practice4Stats',
    component: () => import('../views/exercise/practice4/WeatherStatsView.vue'),
  },
  // Catch-all Route: 위 라우트와 매칭되지 않는 모든 경로 -> NotFoundView
  {
    path: ':pathMatch(.*)*',
    name: 'Practice4NotFound',
    component: () => import('../views/exercise/practice4/NotFoundView.vue'),
  },
]
