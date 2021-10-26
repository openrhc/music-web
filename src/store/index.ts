import { createStore } from 'vuex'

export default createStore({
  state: {
    appname: "Music Online",
    // 首页banner
    banners: [],
    // 用户信息
    user: {
      isLogin: false,
    },
    api: {
      banner: {
        development: '/static/banner.json',
        
      },
      personalized: {
        development: '/static/personalized.json'
      },
      videos: {
        development: '/static/recommend.json',
        production: 'http://192.168.0.10:3000/video/timeline/recommend'
      },
      userinfo: {
        development: '/static/userinfo.json'
      }
    }
  },
  mutations: {
    bannerMutation(state, value) {
      state.banners = value
    }
  },
  actions: {
    setBanner(store, value) {
      store.commit('bannerMutation', value)
    }
  },
  modules: {
  }
})
