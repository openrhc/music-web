import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'
import Video from '../views/Video.vue'
import Center from '../views/Center.vue'
const routes: Array<RouteRecordRaw> = [
  // 首页
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  // 视频界面
  {
    path: '/video',
    name: 'Video',
    component: Video
  },
  // 我的界面
  {
    path: '/center',
    name: 'Center',
    component: Center
  },
  // 关于界面
  {
    path: '/about',
    name: 'About',
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  // 每日推荐界面
  {
    path: '/recommendsongs',
    name: 'RecommendSongs',
    component: () => import(/* webpackChunkName: "recommendsongs" */ '../views/RecommendSongs.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
