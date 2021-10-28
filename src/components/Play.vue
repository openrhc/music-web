<template>
  <div class="play">
    <!-- 播放栏 -->
    <div class="play-bar" @click="handleShowPlayPage">
      <div class="cover rotate" :class="{ running: isPlaying }">
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
            :current-rate="(currentTime / duration) * 100"
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
          @canplay="onCanplay"
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
      :overlay="false"
      :round="true"
      :style="{
        height: '100%',
        overflow: 'hidden !important',
        background: 'black',
        display: 'flex',
        flexDirection: 'column',
      }"
    >
      <div
        class="bg"
        :style="{
          backgroundImage: `url(http://p4.music.126.net/yeuifWf2JvmPD3rOZaH0hw==/18515775811750799.jpg)`,
        }"
      ></div>
      <div class="head">
        <div class="close" @click="showPlayPage = false">
          <icon name="arrow-down" color="white" size="22" />
        </div>
        <div class="song-info">
          <div class="name">{{ song.name }}</div>
          <div class="singer">{{ song.singer }}</div>
        </div>
        <div class="share">
          <icon name="share-o" color="white" size="22" />
        </div>
      </div>
      <div class="body" @click="toggleCover()">
        <!-- 封面 -->
        <div
          class="cover"
          v-if="showCover"
          @click.stop="ImagePreview({ images: [song.cover], showIndex: false })"
        >
          <div class="anim" :class="{ running: isPlaying }">
            <div class="a1 a"></div>
            <div class="a2 a"></div>
            <div class="a3 a"></div>
          </div>
          <img
            class="rotate"
            :class="{ running: isPlaying }"
            :src="song.cover"
            alt=""
          />
        </div>
        <!-- 歌词 -->
        <div class="lyric" v-else>
          <div
            class="lyric-item"
            v-for="(l, i) in lyric.lrc"
            :key="l"
            :class="{
              highlight:
                currentTime > l.time && currentTime < lyric.lrc[i + 1].time,
            }"
          >
            {{ l.line }}
          </div>
        </div>
      </div>
      <!-- 操作区域 -->
      <div class="action">
        <div class="process">
          <div class="rate">{{ formatPlayTime(currentTime) }}</div>
          <van-progress
            class="process-bar"
            :show-pivot="false"
            stroke-width="2px"
            color="#ee0a24"
            :percentage="(currentTime / duration) * 100 || 0"
          />
          <div class="duration">{{ formatPlayTime(duration) }}</div>
        </div>
        <div class="btns">
          <div class="btn">
            <icon name="play" size="20" color="white" />
          </div>
          <div class="btn" style="transform: rotate(180deg)">
            <icon name="play" size="22" color="white" />
          </div>
          <div
            @click.stop="handlePlay"
            class="btn"
            style="border: 1px solid white; border-radius: 23px"
          >
            <icon class="icon" :name="playIcon" color="white" size="26" />
          </div>
          <div class="btn">
            <icon name="play" size="22" color="white" />
          </div>
          <div class="btn">
            <icon name="wap-nav" size="22" color="white" />
          </div>
        </div>
      </div>
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
import {
  Circle as VanCircle,
  Icon,
  Toast,
  ImagePreview,
  Popup,
  Progress as VanProgress,
} from "vant";
import { useToggle } from "@vant/use";
import axios from "axios";

interface ILyric {
  lrc: [];
  tlyric: [];
}

export default defineComponent({
  name: "Play",
  components: { VanCircle, Icon, Popup, VanProgress },
  setup() {
    const store = useStore();
    // const song = reactive({
    //   cover: "favicon.ico",
    //   name: store.state.appname,
    //   singer: store.state.appdesp,
    //   src: "#",
    // });
    // debug data
    const song = reactive({
      cover:
        "https://p1.music.126.net/diGAyEmpymX8G7JcnElncQ==/109951163699673355.jpg",
      name: "起风了",
      singer: "买辣椒也用券",
      src: "https://music.163.com/song/media/outer/url?id=1330348068.mp3",
    });
    const audio = ref<HTMLAudioElement | null>(null);
    const isPlaying = ref(false);
    const icons = ["play", "pause"];
    // 播放按钮的图标
    const playIcon = ref(icons[0]);
    // 音频长度
    const duration = ref(0);
    // 当前音频播放时间
    const currentTime = ref(0);
    // 歌词
    const lyric = reactive<ILyric>({ lrc: [], tlyric: [] });
    // 当前音频是否出错
    const error = ref(false);
    // 是否显示播放页
    const showPlayPage = ref(!false);
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
              error.value = false;
              showCover.value = true;
            }
          });
          // 获取歌词
          getLyricData(val.id);
        }
      );
    });
    // 获取歌词
    const getLyricData = (id: number) => {
      // process.env.NODE_ENV
      axios
        .get(store.state.api.lyric[process.env.NODE_ENV] + "?id=" + id)
        .then((res) => {
          console.log(res.data);
          lyric.lrc = res.data.lrc.lyric
            .split("\n")
            // 处理歌词格式
            .map((line: string) => {
              const arr = line.split("]");
              // [00, 15.02]
              const arr2 = arr[0].replace("[", "").split(":");
              const time = Number(arr2[0]) * 60 + Number(arr2[1]);
              return {
                time: time,
                line: arr[1],
              };
            })
            // 过滤歌词中最后一个\n
            .filter((item: { time: number; line: string }) => {
              return !Number.isNaN(item.time);
            });
          lyric.tlyric = res.data.tlyric.lyric.split("\n");
        });
    };
    getLyricData(0);
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
      currentTime.value = 0;
      duration.value = 0;
      error.value = true;
      Toast("当前歌曲播放失败");
      isPlaying.value = false;
      playIcon.value = icons[0];
    };
    const onCanplay = () => {
      if (audio.value && audio.value.duration) {
        duration.value = audio.value.duration;
      }
    };
    // 当audio时间更新
    const onTimeUpdate = () => {
      if (audio.value && audio.value.currentTime) {
        currentTime.value = audio.value.currentTime;
      }
    };
    const formatPlayTime = (s: any) => {
      let M: any = Math.floor(s / 60);
      s = Math.floor(s - M * 60);
      M = M < 10 ? `0${M}` : M;
      s = s < 10 ? `0${s}` : s;
      return `${M}:${s}`;
    };
    // 点击播放栏，打开播放页
    const handleShowPlayPage = () => {
      showPlayPage.value = true;
    };
    // 播放/暂停
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
      lyric,
      duration,
      currentTime,
      song,
      isPlaying,
      playIcon,
      onPlay,
      onPause,
      onCanplay,
      onTimeUpdate,
      onError,
      audio,
      handlePlay,
      ImagePreview,
      showPlayPage,
      handleShowPlayPage,
      showCover,
      toggleCover,
      formatPlayTime,
    };
  },
});
</script>

<style lang="less" scoped>
@keyframes Rotate {
  from {
    transform: rotate(0deg) scale(1);
  }
  to {
    transform: rotate(360deg) scale(1.2);
  }
}
.rotate {
  animation: Rotate 10s linear infinite;
  animation-play-state: paused;
}
.running {
  animation-play-state: running;
}
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
    opacity: 0.6;
    z-index: -9;
  }
  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .song-info {
      text-align: center;
      .name {
        margin-top: 12px;
        font-size: 16px;
        color: white;
      }
      .singer {
        font-size: 12px;
        color: #b0b0b0;
      }
    }
    .close {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .share {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .body {
    flex: 1;
    margin: 16px 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    .cover {
      position: relative;
      width: 200px;
      height: 200px;
      transform: translateY(-30%);
      .anim {
        @keyframes wave {
          from {
            transform: scale(1);
            opacity: 1;
          }
          to {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        .a {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 100px;
          background: rgba(255, 255, 255, 0.5);
          animation: wave 3s linear infinite;
          animation-play-state: paused;
        }
        .a1 {
          animation-delay: 1s;
        }
        .a2 {
          animation-delay: 1.5s;
        }
      }
      .running {
        .a {
          animation-play-state: running;
        }
      }
      img {
        width: 100%;
        border-radius: 110px;
        box-sizing: border-box;
        border: 4px solid rgba(255, 255, 255, 0.2);
      }
    }
    .lyric {
      flex: 1;
      line-height: 1.2;
      text-align: center;
      overflow: auto;
      .lyric-item {
        margin: 16px 0;
        color: #b0b0b0;
      }
      .highlight {
        color: white;
      }
    }
  }
  .action {
    padding: 16px 0;
    .process {
      margin: 0 26px;
      display: flex;
      color: white;
      font-size: 12px;
      align-items: center;
      .process-bar {
        flex: 1;
        margin: 0 8px;
      }
    }
    .btns {
      margin-top: 16px;
      display: flex;
      justify-content: space-around;
      align-items: center;
      .btn {
        box-sizing: border-box;
        width: 46px;
        height: 46px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}
</style>
