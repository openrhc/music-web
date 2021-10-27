<template>
  <div class="play">
    <!-- 播放栏 -->
    <div class="play-bar" @click="handleShowPlayPage">
      <div
        class="cover rotate"
        :class="{ running: isPlaying }"
        @click.stop="ImagePreview({ images: [song.cover], showIndex: false })"
      >
        <img :src="song.cover" alt="" />
      </div>
      <div class="body">
        <div class="name">
          {{ song.name }}
        </div>
        <div class="divider">-</div>
        <div class="ar">
          {{ song.singer }}
        </div>
      </div>
      <div class="action">
        <div class="play-process" @click.stop="handlePlay">
          <icon class="icon" :name="playIcon" size="20" />
          <van-circle
            class="process"
            :current-rate="rate"
            :rate="100"
            :speed="100"
            :stroke-width="50"
            layer-color="#eee"
            size="30px"
            color="black"
          />
        </div>
        <div class="play-list">
          <icon name="bars" size="30" />
        </div>
      </div>
      <div class="audio">
        <audio
          ref="audio"
          :src="song.src"
          preload="metadata"
          @play="onPlay"
          @pause="onPause"
          @timeupdate="onTimeUpdate"
          @error="onError"
        ></audio>
      </div>
    </div>
    <!-- 播放页 -->
    <popup
      class="play-page"
      v-model:show="showPlayPage"
      position="bottom"
      :style="{
        height: '100%',
        overflow: 'hidden !important',
      }"
    >
      <div
        class="bg"
        :style="{
          backgroundImage: `url(http://p4.music.126.net/yeuifWf2JvmPD3rOZaH0hw==/18515775811750799.jpg)`,
        }"
      ></div>
      <div class="song-info">
        <div class="name">{{ song.name }}</div>
        <div class="singer">{{ song.singer }}</div>
      </div>
      <div class="close" @click="showPlayPage = false">
        <icon name="arrow-down" color="white" size="22" />
      </div>
      <div class="share">
        <icon name="share-o" color="white" size="22" />
      </div>
      <!-- 封面 -->
      <div class="cover" v-if="showCover" @click="toggleCover()">
        <img :src="song.cover" alt="" />
      </div>
      <!-- 歌词 -->
      <div class="lyric" @click="toggleCover()" v-else>lyric</div>
    </popup>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  watch,
  ref,
  onMounted,
  nextTick,
} from "vue";
import { useStore } from "vuex";
import { Circle as VanCircle, Icon, Toast, ImagePreview, Popup } from "vant";
import { useToggle } from "@vant/use";

export default defineComponent({
  name: "Play",
  components: { VanCircle, Icon, Popup },
  setup() {
    const store = useStore();
    const song = reactive({
      cover: "favicon.ico",
      name: store.state.appname,
      singer: store.state.appdesp,
      src: "#",
    });
    const audio = ref<HTMLAudioElement | null>(null);
    const isPlaying = ref(false);
    const icons = ["play", "pause"];
    // 播放按钮的图标
    const playIcon = ref(icons[2]);
    // 进度条进度
    const rate = ref(0);
    // 当前音频是否出错
    const error = ref(false);
    // 是否显示播放页
    const showPlayPage = ref(!true);
    // 展示封面还是歌词
    const [showCover, toggleCover] = useToggle(true);

    onMounted(() => {
      // 监听正在播放的曲目变化
      watch(
        () => store.state.playingList.playing,
        (val) => {
          song.cover = val.al.picUrl;
          song.name = val.name;
          song.src = `https://music.163.com/song/media/outer/url?id=${val.id}.mp3`;
          song.singer = val.ar.map((item: any) => item.name).join("/");
          // 播放
          nextTick(() => {
            if (audio.value) {
              audio.value.play();
              rate.value = 0;
              error.value = false;
            }
          });
        }
      );
    });

    const onPlay = () => {
      console.log("onPlay");
      isPlaying.value = true;
      playIcon.value = icons[1];
    };
    const onPause = () => {
      console.log("onPause");
      if (error.value) {
        return;
      }
      isPlaying.value = false;
      playIcon.value = icons[0];
    };
    const onError = () => {
      console.log("onError");
      rate.value = 0;
      error.value = true;
      Toast("当前歌曲播放失败");
      isPlaying.value = false;
      playIcon.value = icons[0];
    };
    // 当audio时间更新
    const onTimeUpdate = () => {
      if (audio.value && audio.value.currentTime && audio.value.duration) {
        rate.value = (audio.value.currentTime / audio.value.duration) * 100;
      }
    };
    // 点击播放栏，打开播放页
    const handleShowPlayPage = () => {
      showPlayPage.value = true;
    };
    const handlePlay = () => {
      if (audio.value) {
        if (isPlaying.value) {
          audio.value.pause();
          console.log("click to pause");
        } else {
          audio.value.play();
          console.log("click to play");
        }
      }
    };
    return {
      rate,
      song,
      isPlaying,
      playIcon,
      onPlay,
      onPause,
      onTimeUpdate,
      onError,
      audio,
      handlePlay,
      ImagePreview,
      showPlayPage,
      handleShowPlayPage,
      showCover,
      toggleCover,
    };
  },
});
</script>

<style lang="less" scoped>
.play-bar {
  position: fixed;
  bottom: 50px;
  height: 46px;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  border-top: 0.5px solid rgb(240, 240, 240);
  .cover {
    position: relative;
    top: -8px;
    margin-left: 16px;
    width: 46px;
    height: 46px;
    background-image: url(../assets/disc.png);
    background-size: 100% 100%;
    img {
      width: 100%;
      transform: scale(0.6);
      border-radius: 23px;
    }
  }
  @keyframes Rotate {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
  .rotate {
    animation: Rotate 8s linear infinite;
    animation-play-state: paused;
  }
  .running {
    animation-play-state: running;
  }
  .body {
    margin-left: 8px;
    display: flex;
    flex: 1;
    align-items: center;
    width: 0;
    div {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .name {
      font-size: 14px;
    }
    .divider {
      margin: 0 4px;
    }
    .ar {
      font-size: 12px;
    }
  }
  .action {
    display: flex;
    align-items: center;
    padding-right: 16px;
    .play-process {
      position: relative;
      display: flex;
      align-items: center;
      .icon {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }
    }
    .play-list {
      margin-left: 16px;
    }
  }
}
.play-page {
  overflow: hidden;
  .bg {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    background-position: center;
    background-size: cover;
    filter: blur(25px);
    transform: scale(1.5);
  }
  .song-info {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    .name {
      margin-top: 8px;
      font-size: 16px;
      color: white;
    }
    .singer {
      font-size: 12px;
      color: gray;
    }
  }
  .close {
    position: absolute;
    left: 0;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .share {
    position: absolute;
    right: 0;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
