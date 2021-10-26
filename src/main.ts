import { Lazyload } from '@vant/lazyload'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

createApp(App).use(store).use(router).use(Lazyload).mount('#app')
