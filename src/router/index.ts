import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('../views/login/index.vue'),
    },
    {
      path: '/task',
      name: 'task',
      component: () => import('../views/task/index.vue'),
    },
    {
      path: '/task/label',
      name: 'task-label',
      component: () => import('../views/task/label.vue'),
    },
    {
      path: '/task/preview',
      name: 'task-preview',
      component: () => import('../views/task/preview.vue'),
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('../views/user/index.vue'),
    },
    {
      path: '/self',
      name: 'self',
      component: () => import('../views/self/index.vue'),
    },
  ],
})

export default router
