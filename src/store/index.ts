import { createStore } from 'vuex'

export default createStore({
  state: {
    appname: "网易云音乐",
    appdesp: "发现好音乐",
    // 首页banner
    banners: [],
    // 用户信息
    user: {
      isLogin: false,
      account: {
        id: 0,
        createTime: Date.now(),
      },
      profile: {
        userId: 0,
        nickname: 'Music Online',
        avatarUrl: 'logo.png',
        backgroundUrl: 'bg.jpg',
        createTime: Date.now(),
      }
    },
    // 播放列表
    playingList: {
      list: [],
      playing: {
        id: 0,
        // 歌曲名
        name: '',
        // 歌手列表
        ar: [],
        al: {
          picUrl: ''
        }
      }
    },
    api: {
      // 首页banner
      banner: {
        development: '/static/banner.json',
        production: 'http://192.168.0.10:3000/banner'
      },
      // 
      personalized: {
        development: '/static/personalized.json',
        production: 'http://192.168.0.10:3000/personalized?limit=10'
      },
      // 视频
      videos: {
        development: '/static/recommend.json',
        production: 'http://192.168.0.10:3000/video/timeline/recommend'
      },
      // 用户信息
      userinfo: {
        development: '/static/userinfo.json',
        production: 'http://192.168.0.10:3000/login/status'
      },
      // 每日推荐
      songs: {
        development: '/static/songs.json',
        production: 'http://192.168.0.10:3000/recommend/songs'
      },
      // 搜索词
      hot: {
        development: '/static/hot.json',
        production: 'http://192.168.0.10:3000/search/hot/detail'
      },
      // 歌词
      lyric: {
        development: '/static/lyric.json',
        production: 'http://192.168.0.10:3000/lyric'
      },
      // 搜索歌曲
      search: {
        development: '/static/search.json',
        production: 'http://192.168.0.10:3000/search'
      }
    }
  },
  mutations: {
    bannerMutation(state, value) {
      state.banners = value
    },
    playingListMutation(state, value) {
      state.playingList = value
    }
  },
  actions: {
    // 更新首页banner
    setBanner(store, value) {
      store.commit('bannerMutation', value)
    },
    // 更新播放列表
    setPlayingList(store, value) {
      store.commit('playingListMutation', value)
    }
  },
  modules: {
  }
})
