import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { practice4Children } from './practice4-routes.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },

    {
      path: '/about',
      name: 'about',

      // AboutView는 /about에 접근할 때 불러옵니다.
      component: () => import('../views/AboutView.vue'),

      // 로그인이 필요한 Route임을 표시합니다.
      meta: {
        requiresAuth: true,
      },
    },

    {
      // 종합실습4 — Router(④)를 뼈대로 Store(⑤)·Axios(⑥)·UI Library(⑦)·Refinement(⑧)·Deployment(⑨)가
      // 계속 진화해 들어간 하나의 라우터 블록입니다.
      path: '/practice4',
      component: () => import('../views/exercise/practice4/Practice4Layout.vue'),
      children: practice4Children,
    },

    {
      // 위의 어떤 Route와도 일치하지 않을 때 실행합니다.
      // Catch-all Route는 반드시 routes 배열의 마지막에 작성합니다.
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

// 모든 Route 이동 직전에 실행되는 전역 Navigation Guard
router.beforeEach((to) => {
  // 현재는 로그인하지 않은 상태로 가정합니다.
  const isAuthenticated = false

  // 이동할 페이지가 로그인을 요구하고,
  // 현재 로그인하지 않았다면 Home으로 이동시킵니다.
  if (to.meta.requiresAuth && !isAuthenticated) {
    window.alert('로그인이 필요한 서비스입니다.')
    return '/'
  }

  // 인증이 필요 없거나 로그인한 경우 이동을 허용합니다.
  return true
})

export default router
