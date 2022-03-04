import { createStore } from 'vuex'

const ip = 'http://hello-world.host:11044/api'

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
        production: `${ip}/banner`
      },
      // 
      personalized: {
        development: '/static/personalized.json',
        production: `${ip}/personalized`
      },
      // 视频
      videos: {
        development: '/static/recommend.json',
        production: `${ip}/video/timeline/recommend`
      },
      // 视频评论
      videocomment: {
        development: '/static/video.json',
        production: `${ip}/comment/video`
      },
      // 用户信息
      account: {
        development: '/static/account.json',
        production: `${ip}/user/account`
      },
      // 每日推荐
      songs: {
        development: '/static/songs.json',
        production: `${ip}/recommend/songs`
      },
      // 搜索词
      hot: {
        development: '/static/hot.json',
        production: `${ip}/search/hot/detail`
      },
      hot2: {
        development: '/static/hot2.json',
        production: `${ip}/search/hot`
      },
      // 歌词
      lyric: {
        development: '/static/lyric.json',
        production: `${ip}/lyric`
      },
      // 搜索歌曲
      search: {
        development: '/static/search.json',
        production: `${ip}/search`
      },
      // 生成二维码的KEY
      qrkey: {
        development: '/static/qrkey.json',
        production: `${ip}/login/qr/key`
      },
      // 生成二维码接口
      qrcreate: {
        development: '/static/qrcreate.json',
        production: `${ip}/login/qr/create`
      },
      // 检测二维码状态接口
      qrcheck: {
        development: '/static/qrcheck.json',
        production: `${ip}/login/qr/check`
      },
      // 手机登录
      cellphone: {
        development: '/static/cellphone.json',
        production: `${ip}/login/cellphone`
      },
      // 歌单详情
      playlistdetails: {
        development: '/static/detail.json',
        production: `${ip}/playlist/detail`
      },
      // 歌曲详情
      songdetails: {
        development: '/static/songdetails.json',
        production: `${ip}/song/detail`
      },
      // 搜索词推荐
      suggest: {
        development: '/static/suggest.json',
        production: `${ip}/search/suggest`
      },
      // 个人歌单
      playlist: {
        development: '/static/playlist.json',
        production: `${ip}/user/playlist`
      },
      // 私人FM
      personalfm: {
        development: '/static/personal_fm.json',
        production: `${ip}/personal_fm`
      },
      // 新碟
      album: {
        development: '/static/album.json',
        production: `${ip}/album`
      }
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
