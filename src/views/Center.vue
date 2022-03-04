<template>
  <div class="center">
    <!-- 导航栏 -->
    <nav-bar :title="appname" />
    <empty description="您还没有登录" v-if="!isLogin">
      <van-button round type="danger" class="bottom-button" to="/login"
        >点 击 登 录</van-button
      >
    </empty>
    <div v-else>
      <div
        class="bg"
        :style="{ backgroundImage: `url(${user.profile.backgroundUrl})` }"
      ></div>
      <div class="profile">
        <img class="avatar" :src="user.profile.avatarUrl" alt="" />
        <div class="nick">
          <div class="nickname">{{ user.profile.nickname }}</div>
          <div class="createtime">
            {{ formatTime(user.account.createTime) }}
          </div>
        </div>
      </div>
      <!-- 个人歌单列表 -->
      <div class="playlist-wrap">
        <div
          class="playlist-item"
          v-for="p in userPlaylist"
          :key="p.id"
          @click="handleDetail(p)"
        >
          <div class="cover">
            <img v-lazy="p.coverImgUrl" alt="" />
          </div>
          <div class="body">
            <div class="title">
              {{ p.name }}
            </div>
            <div class="info">
              {{ p.name }}
            </div>
          </div>
          <div class="active">
            <icon name="ellipsis" />
          </div>
        </div>
      </div>
      <van-button class="logout" type="danger" @click="handleLogout"
        >退出登录</van-button
      >
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import { useStore } from "vuex";
import { NavBar, Empty, Button as VanButton, Icon, Toast } from "vant";
import axios from "axios";
import { useRouter } from "vue-router";

/* interface IUser {
  isLogin: boolean;
  account: {
    id: number;
    createTime: number;
  };
  profile: {
    userId: number;
    nickname: number;
    avatarUrl: string;
    backgroundUrl: string;
    createTime: number;
  };
} */

interface IPlay {
  // 歌单ID
  id: number;
  // 歌单名
  name: string;
  // 封面
  coverImgUrl: string;
  // 是否是订阅别人的歌单
  subscribed: boolean;
}

export default defineComponent({
  name: "Center",
  components: {
    NavBar,
    Empty,
    VanButton,
    Icon,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const user = store.state.user;
    const isLogin = ref(user.isLogin);
    const userPlaylist = reactive<IPlay[]>([]);
    // 获取用户信息
    const getAccountInfo = () => {
      axios.get(store.state.api.account[process.env.NODE_ENV]).then((res) => {
        const u = res.data.data;
        if (res.data.data.code === 200) {
          user.isLogin = true;
          isLogin.value = true;
          user.account = {
            id: u.account.id,
            createTime: u.account.createTime,
          };
          user.profile = {
            userId: u.profile.userId,
            nickname: u.profile.nickname,
            avatarUrl: u.profile.avatarUrl,
            backgroundUrl: u.profile.backgroundUrl,
            createTime: u.profile.createTime,
          };
        }
      });
    };
    // 获取用户歌单
    const getUserPlayList = () => {
      axios
        .get(
          store.state.api.playlist[process.env.NODE_ENV] +
            "?uid=" +
            user.profile.userId
        )
        .then((res) => {
          const { playlist } = res.data;
          userPlaylist.splice(0);
          playlist.forEach((play: IPlay) => {
            userPlaylist.push({
              id: play.id,
              name: play.name,
              coverImgUrl: play.coverImgUrl,
              subscribed: play.subscribed,
            });
          });
        });
    };
    // 粗略计算时间
    const formatTime = (time: number) => {
      const now = new Date();
      const s = (now.getTime() - time) / 1000;
      let res;
      if (s > 31536000) {
        res = (s / 3600 / 24 / 365).toFixed(2) + " 年";
      } else if (s > 2592000) {
        res = (s / 3600 / 24 / 30).toFixed(2) + " 个月";
      } else {
        res = (s / 3600 / 24).toFixed(2) + " 天";
      }
      return res;
    };
    const handleDetail = (p: IPlay) => {
      router.push("/detail?id=" + p.id);
    };

    if (isLogin.value) {
      // getAccountInfo();
      getUserPlayList();
    }

    const handleLogout = () => {
      const user = {
        isLogin: false,
        account: {
          id: 0,
          createTime: Date.now(),
        },
        profile: {
          userId: 0,
          nickname: "Music Online",
          avatarUrl: "logo.png",
          backgroundUrl: "bg.jpg",
          createTime: Date.now(),
        },
      };
      store.dispatch("setUser", user);
      document.cookie = "";
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("search_history");
      Toast("已退出");
      router.replace("/");
    };

    return {
      user,
      isLogin,
      formatTime,
      userPlaylist,
      handleDetail,
      handleLogout,
      appname: store.state.appname,
    };
  },
});
</script>

<style lang="less" scoped>
.center {
  background: rgb(248, 248, 248);
  padding-bottom: 100px;
}
.bg {
  height: 120px;
  background-position: center;
  background-size: cover;
  -webkit-mask: linear-gradient(#000 calc(100% - 5em), transparent);
  mask: linear-gradient(#000 calc(100% - 5em), transparent);
}
.bottom-button {
  height: 40px;
}
.profile {
  display: flex;
  align-items: center;
  padding: 0 16px;
  .avatar {
    width: 80px;
    height: 80px;
    border-radius: 40px;
  }
  .nick {
    margin-left: 16px;
    .nickname {
      font-weight: bold;
    }
  }
}

.playlist-wrap {
  margin: 16px;
  padding: 8px 0;
  background: white;
  border-radius: 8px;
}
.playlist-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  .cover {
    width: 46px;
    height: 46px;
    img {
      width: 100%;
      border-radius: 4px;
    }
  }
  .body {
    flex: 1;
    margin-left: 8px;
    width: 0;
    .title {
      font-size: 16px;
      color: black;
    }
    .info {
      font-size: 12px;
      color: gray;
      display: flex;
      div {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .reasons {
        color: #eec134;
        margin-right: 4px;
        background: rgba(220, 220, 3, 0.04);
      }
      .ar {
        margin-right: 4px;
      }
    }
  }
  .active {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.logout {
  margin: 8px 16px;
  width: calc(100% - 32px);
}
</style>