import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/roadmap/:id',
      name: 'roadmap',
      component: () => import('@/views/RoadmapView.vue'),
    },
    {
      path: '/roadmap/:roadmapId/step/:stepId',
      name: 'step-detail',
      component: () => import('@/views/StepDetailView.vue'),
    },
    {
      path: '/explainer/:itemId',
      name: 'explainer',
      component: () => import('@/views/ExplainerView.vue'),
    },
    {
      path: '/s/:shareCode',
      name: 'shared',
      component: () => import('@/views/SharedRoadmapView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
    },
  ],
})

export default router
