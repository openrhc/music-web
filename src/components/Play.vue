<template>
  <div class="play">
    <!-- 播放栏 -->
    <div
      class="play-bar"
      @click="handleShowPlayPage"
      :style="{ bottom: bottomPx + 'px' }"
    >
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
          <icon class="icon" :name="playIcon" size="16" />
          <van-circle
            class="process"
            :current-rate="(currentTime / duration) * 100"
            :stroke-width="50"
            layer-color="#eee"
            size="20px"
            color="black"
          />
        </div>
        <div class="play-list">
          <icon name="bars" size="20" />
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
          @ended="onEnded"
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
        <div class="lyric" v-else ref="el_lyric">
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
          <div class="btn" style="transform: rotate(180deg)" @click="prevSong">
            <icon name="play" size="22" color="white" />
          </div>
          <div
            @click.stop="handlePlay"
            class="btn"
            style="border: 1px solid white; border-radius: 23px"
          >
            <icon class="icon" :name="playIcon" color="white" size="26" />
          </div>
          <div class="btn" @click="nextSong">
            <icon name="play" size="22" color="white" />
          </div>
          <div class="btn" @click="showPlayList = true">
            <icon name="wap-nav" size="22" color="white" />
          </div>
        </div>
      </div>
    </popup>
    <!-- 播放列表页 -->
    <popup
      v-model:show="showPlayList"
      position="right"
      :style="{ height: '100%', width: '70%' }"
    >
      <list :loading="false" :finished="true" finished-text="">
        <cell v-for="(s, index) in playlist" :key="s.id">
          <template #value>
            <div
              class="song-item"
              @click="playSong(s, index)"
              :class="{ playing: s.id === song.id }"
            >
              <div class="cover">
                <img v-lazy="s.al.picUrl" alt="" />
              </div>
              <div class="body">
                <div class="title">
                  {{ s.name }}
                </div>
                <div class="info">
                  <div class="ar">
                    {{ s.ar.map((item) => item.name).join("/") }}
                  </div>
                  <div class="al">
                    {{ s.al.name }}
                  </div>
                </div>
              </div>
              <div class="active">
                <icon name="ellipsis" />
              </div>
            </div>
          </template>
        </cell>
      </list>
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
  watchEffect,
} from "vue";
import { useStore } from "vuex";
import {
  Circle as VanCircle,
  Icon,
  Toast,
  ImagePreview,
  Popup,
  Progress as VanProgress,
  List,
  Cell,
} from "vant";
import { useToggle } from "@vant/use";
import axios from "axios";

interface ILyric {
  lrc: any;
  tlyric: [];
}

export default defineComponent({
  name: "Play",
  components: { VanCircle, Icon, Popup, VanProgress, List, Cell },
  setup() {
    const store = useStore();
    const song = reactive({
      id: 0,
      cover: "favicon.ico",
      name: store.state.appname,
      singer: store.state.appdesp,
      src: "#",
    });
    // debug data
    // const song = reactive({
    //   id: 0,
    //   cover:
    //     "https://p1.music.126.net/diGAyEmpymX8G7JcnElncQ==/109951163699673355.jpg",
    //   name: "起风了",
    //   singer: "买辣椒也用券",
    //   src: "https://music.163.com/song/media/outer/url?id=1330348068.mp3",
    // });
    const audio = ref<HTMLAudioElement | null>(null);
    const el_lyric = ref<HTMLDivElement | null>(null);
    const isPlaying = ref(false);
    const icons = ["play", "pause"];
    // 播放列表
    const playlist = store.state.playingList.list;
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
    const showPlayPage = ref(store.state.showPlayPage);
    // 展示封面还是歌词
    const [showCover, toggleCover] = useToggle(true);
    // 是否显示播放列表
    const showPlayList = ref(false);
    // 播放栏距离底部的距离，当tabbar隐藏时，需要将它设为0
    const bottomPx = ref(50);

    // 当tabbar隐藏时，将播放栏放到最下面
    watchEffect(() => {
      bottomPx.value = store.state.showTabbar ? 50 : 0;
    });
    // 当播放页被打开，更新showPlayPage（主页点击私人FM时）
    watch(
      () => store.state.showPlayPage,
      (val) => {
        showPlayPage.value = val;
      }
    );
    // 更新播放列表
    watch(
      () => store.state.playingList.list,
      (val) => {
        console.log(val);
        playlist.splice(0);
        val.forEach((song: any) => {
          playlist.push(song);
        });
      }
    );
    onMounted(() => {
      // 监听正在播放的曲目变化
      watch(
        () => store.state.playingList.playing,
        (val) => {
          song.id = val.id;
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
          //防止数组下标溢出，多添加一组数据
          lyric.lrc.push({
            time: 99999999999,
            line: "",
          });
          lyric.tlyric = res.data.tlyric.lyric.split("\n");
        });
    };
    // getLyricData(0);
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
      if (song.id !== 0) {
        Toast("当前歌曲播放失败");
      }
      isPlaying.value = false;
      playIcon.value = icons[0];
    };
    const onCanplay = () => {
      if (audio.value && audio.value.duration) {
        duration.value = audio.value.duration;
      }
    };
    const onEnded = () => {
      console.log("onEnded");

      nextSong();
    };
    // 当audio时间更新
    const onTimeUpdate = () => {
      if (audio.value && audio.value.currentTime) {
        // 更新进度条
        currentTime.value = audio.value.currentTime;
        // 滚动歌词
        for (let i = 0; i < lyric.lrc.length; i++) {
          // 播放页打开时 且 显示歌词时： 才进行计算
          if (el_lyric.value && !showCover.value && showPlayPage.value) {
            if (
              currentTime.value > lyric.lrc[i].time &&
              currentTime.value < lyric.lrc[i + 1].time
            ) {
              // 可见高度 / 每句歌词高度 / 2 = 中间那句歌词
              // 只有当歌词到中间那句时才滚动
              el_lyric.value.scrollTop =
                36 * (i - el_lyric.value.offsetHeight / 36 / 2);
              console.log("计算滚动距离");
            }
          }
        }
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
    // 上一首
    const prevSong = () => {
      if (playlist.length === 0) {
        return;
      }
      const tmp = playlist.find((item: any) => {
        return item.id === song.id;
      });
      let index = playlist.indexOf(tmp) - 1;
      index = index < 0 ? 0 : index;
      store.dispatch("setPlayingList", {
        list: playlist,
        playing: playlist[index],
      });
    };
    // 下一首
    const nextSong = () => {
      if (playlist.length === 0) {
        return;
      }
      const tmp = playlist.find((item: any) => {
        return item.id === song.id;
      });
      let index = playlist.indexOf(tmp) + 1;
      index = index > playlist.length - 1 ? playlist.length - 1 : index;
      store.dispatch("setPlayingList", {
        list: playlist,
        playing: playlist[index],
      });
    };
    // 播放音乐
    const playSong = (song: any, index: number) => {
      console.log("playSong");
      // 更新播放列表
      store.dispatch("setPlayingList", {
        list: store.state.playingList.list,
        playing: song,
      });
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
      onEnded,
      audio,
      handlePlay,
      ImagePreview,
      showPlayPage,
      handleShowPlayPage,
      showCover,
      toggleCover,
      formatPlayTime,
      prevSong,
      nextSong,
      bottomPx,
      el_lyric,
      showPlayList,
      playlist,
      playSong,
    };
  },
});
</script>

<style lang="less" scoped>
@keyframes Rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
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
      line-height: 36px;
      height: 36px;
      text-align: center;
      overflow: auto;
      .lyric-item {
        color: #b0b0b0;
        transition: all 0.2s;
      }
      .highlight {
        font-size: 18px;
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

.playing {
  background: #f2f2f2;
}
.song-item {
  display: flex;
  align-items: center;
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
</style>
