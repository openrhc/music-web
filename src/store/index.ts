import { createStore } from 'vuex'

export default createStore({
  state: {
    appname: "悦耳音乐",
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
    // 是否显示播放栏
    showPlayer: true,
    // 是否显示导航栏
    showTabbar: true,
    // 是否显示播放页
    showPlayPage: false,
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
        production: 'http://192.168.0.10:3000/personalized'
      },
      // 视频
      videos: {
        development: '/static/recommend.json',
        production: 'http://192.168.0.10:3000/video/timeline/recommend'
      },
      // 用户信息
      account: {
        development: '/static/account.json',
        production: 'http://192.168.0.10:3000/user/account'
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
      hot2: {
        development: '/static/hot2.json',
        production: 'http://192.168.0.10:3000/search/hot'
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
      },
      // 生成二维码的KEY
      qrkey: {
        development: '/static/qrkey.json',
        production: 'http://192.168.0.10:3000/login/qr/key'
      },
      // 生成二维码接口
      qrcreate: {
        development: '/static/qrcreate.json',
        production: 'http://192.168.0.10:3000/login/qr/create'
      },
      // 检测二维码状态接口
      qrcheck: {
        development: '/static/qrcheck.json',
        production: 'http://192.168.0.10:3000/login/qr/check'
      },
      // 手机登录
      cellphone: {
        development: '/static/cellphone.json',
        production: 'http://192.168.0.10:3000/login/cellphone'
      },
      // 歌单详情
      playlistdetails: {
        development: '/static/detail.json',
        production: 'http://192.168.0.10:3000/playlist/detail'
      },
      // 歌曲详情
      songdetails: {
        development: '/static/songdetails.json',
        production: 'http://192.168.0.10:3000/song/detail'
      },
      // 搜索词推荐
      suggest: {
        development: '/static/suggest.json',
        production: 'http://192.168.0.10:3000/search/suggest'
      },
      // 个人歌单
      playlist: {
        development: '/static/playlist.json',
        production: 'http://192.168.0.10:3000/user/playlist'
      },
      // 私人FM
      personalfm: {
        development: '/static/personal_fm.json',
        production: 'http://192.168.0.10:3000/personal_fm'
      },
    }
  },
  mutations: {
    bannerMutation(state, value) {
      state.banners = value
    },
    playingListMutation(state, value) {
      state.playingList = value
    },
    tabbarMutation(state, value) {
      state.showTabbar = value
    },
    playerMutation(state, value) {
      state.showPlayer = value
    },
    userMutation(state, value) {
      state.user = value
    },
    playPageMutation(state, value) {
      state.showPlayPage = value
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
    },
    togglePlayer(store, value) {
      store.commit('playerMutation', value)
    },
    toggleTabbar(store, value) {
      store.commit('tabbarMutation', value)
    },
    togglePlayPage(store, value) {
      store.commit('playPageMutation', value)
    },
    // 更新用户信息
    setUser(store, value) {
      store.commit('userMutation', value)
    }
  },
  modules: {
  }
})
