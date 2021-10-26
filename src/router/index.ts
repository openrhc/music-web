import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/video',
    name: 'Video',
    component: () => import(/* webpackChunkName: "center" */ '../views/Video.vue')
  },
  {
    path: '/center',
    name: 'Center',
    component: () => import(/* webpackChunkName: "center" */ '../views/Center.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
