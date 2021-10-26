<template>
  <div class="center">
    <!-- 导航栏 -->
    <nav-bar :title="appname" />
    <!-- 用户信息 -->
    <div
      class="bg"
      :style="{ backgroundImage: `url(${user.profile.backgroundUrl})` }"
    ></div>
    <div class="profile">
      <img class="avatar" :src="user.profile.avatarUrl" alt="" />
      <div class="nick">
        <div class="nickname">{{ user.profile.nickname }}</div>
        <div class="createtime">{{ formatTime(user.account.createTime) }}</div>
      </div>
    </div>
    {{ env }}
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { NavBar } from "vant";
import axios from "axios";

interface IUser {
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
}

export default defineComponent({
  name: "Center",
  components: {
    NavBar,
  },
  setup() {
    const store = useStore();
    const user: any = store.state.user;
    const isLogin = user.isLogin;
    // 获取用户信息
    const getUserInfo = () => {
      axios.get(store.state.api.userinfo[process.env.NODE_ENV]).then((res) => {
        const u = res.data.data;
        if (res.data.data.code === 200) {
          user.isLogin = true;
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
    /* if (isLogin) {
      getUserInfo();
    } */
    getUserInfo();
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
    return {
      user,
      isLogin,
      formatTime,
      env: process.env.NODE_ENV,
      appname: store.state.appname,
    };
  },
});
</script>

<style lang="less" scoped>
.bg {
  height: 120px;
  background-position: center;
  background-size: cover;
}
.profile {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  box-shadow: 0 -4px 16px rgba(255, 255, 255, 1);
  .avatar {
    width: 80px;
    height: 80px;
    border-radius: 40px;
  }
}
</style>