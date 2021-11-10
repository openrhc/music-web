<template>
  <div class="center">
    <!-- 导航栏 -->
    <nav-bar :title="appname" />
    <!-- 播放列表 -->
    <swipe class="my-swipe" vertical :loop="false" @change="onChange">
      <!-- 没有登录 -->
      <swipe-item v-if="isLogin">
        <empty image="error" description="请先登录" />
      </swipe-item>
      <swipe-item v-else v-for="(v, i) in videos" :key="i">
        <!-- 虚化背景图 -->
        <div class="bg" v-lazy:background-image="v.coverUrl"></div>
        <video :src="v.urlInfo.url" controls :ref="setRef"></video>
      </swipe-item>
      <template #indicator></template>
    </swipe>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  reactive,
  onBeforeUnmount,
  onBeforeMount,
} from "vue";
import { useStore } from "vuex";
import { NavBar, Swipe, SwipeItem, Empty } from "vant";
import axios from "axios";

interface IVideos {
  coverUrl: string;
  title: string;
  creator: {
    avatarUrl: string;
    nickname: string;
  };
  urlInfo: {
    url: string;
  };
}

export default defineComponent({
  name: "Video",
  components: {
    NavBar,
    Swipe,
    SwipeItem,
    Empty,
  },
  setup() {
    const store = useStore();
    const isLogin = store.state.user.isLogin;
    const videos: Array<IVideos> = reactive([]);
    const el_videos = reactive<HTMLVideoElement[]>([]);
    // 获取视频列表
    const getVideos = () => {
      axios.get(store.state.api.videos[process.env.NODE_ENV]).then((res) => {
        res.data.datas.forEach((item: any) => {
          const data: IVideos = item.data;
          videos.push({
            coverUrl: data.coverUrl,
            title: data.title,
            creator: {
              avatarUrl: data.creator.avatarUrl,
              nickname: data.creator.nickname,
            },
            urlInfo: {
              url: data.urlInfo.url,
            },
          });
        });
      });
    };
    getVideos();

    onBeforeMount(() => {
      store.dispatch("togglePlayer", false);
    });

    onBeforeUnmount(() => {
      store.dispatch("togglePlayer", true);
    });

    // 动态ref
    const setRef = (el: HTMLVideoElement) => {
      el_videos.push(el);
    };

    // 滑动时
    const onChange = (index: number) => {
      console.log("index: ", index);
    };

    return {
      isLogin,
      videos,
      onChange,
      setRef,
      appname: store.state.appname,
    };
  },
});
</script>

<style lang="less" scoped>
.my-swipe {
  height: calc(100vh - 100px);
  text-align: center;
  .van-swipe-item {
    position: relative;
    display: flex;
    align-content: center;
    overflow: hidden;
    .bg {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      top: 0;
      // filter: blur(4px);
      background-position: center center;
      transform: scale(1.1);
    }
    video {
      position: relative;
      z-index: 99;
      width: 100%;
    }
  }
}
</style>