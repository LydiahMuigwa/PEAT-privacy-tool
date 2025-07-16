import { createRouter, createWebHistory } from 'vue-router'
import Footprint from '../views/Footprint.vue'
import LandingPage from '../views/LandingPage.vue' 

const routes = [
  { path: '/', name: 'Landing', component: LandingPage },
  { path: '/footprint', name: 'Footprint', component: Footprint }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
