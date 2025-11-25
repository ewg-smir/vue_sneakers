import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import AppFavorites from './pages/AppFavorites.vue'
import AppHome from './pages/AppHome.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: AppHome,
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: AppFavorites,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const app = createApp(App)

app.use(router)
app.use(autoAnimatePlugin)
app.mount('#app')
