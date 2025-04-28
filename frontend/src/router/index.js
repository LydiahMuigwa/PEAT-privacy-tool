import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Footprint from '../views/Footprint.vue'
import Education from '../views/Education.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/footprint', component: Footprint },
  { path: '/education', name: 'Education', component: Education }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
