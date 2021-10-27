<template>
  <div class="recommendsongs">
    <!-- 导航栏 -->
    <nav-bar
      title="每日推荐"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
    />
  </div>
  <!-- 歌曲列表 -->
  <list
    v-model:loading="loading"
    :finished="finished"
    finished-text="没有更多了"
    @load="onLoad"
  >
    <cell v-for="(s, index) in songs.dailySongs" :key="s.id">
      <template #value>
        <div class="song-item" @click="playSong(s, index)">
          <div
            class="cover"
            @click.stop="
              ImagePreview({
                images: [s.al.picUrl],
                showIndex: false,
              })
            "
          >
            <img v-lazy="s.al.picUrl" alt="" />
          </div>
          <div class="body">
            <div class="title">
              {{ s.name }}
            </div>
            <div class="info">
              <div
                class="reasons"
                v-if="
                  songs.recommendReasons.find((item) => item.songId === s.id)
                "
              >
                {{
                  songs.recommendReasons.find((item) => item.songId === s.id)
                    .reason
                }}
              </div>
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
</template>
<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import { useStore } from "vuex";
import { NavBar, List, Cell, Icon, ImagePreview } from "vant";
import axios from "axios";
import { useRouter } from "vue-router";

interface ISongs {
  dailySongs: Array<IDailySongs>;
  recommendReasons: [];
}

interface IDailySongs {
  // 歌曲名
  name: string;
  id: number;
  // 歌手列表
  ar: any[];
  // 歌曲名说明
  alia: [];
  al: {
    // 歌手后的字段：蓝光 新歌+精选
    name: string;
    picUrl: string;
  };
  originSongSimpleData: { artists: any } | null;
}

export default defineComponent({
  name: "RecommendSons",
  components: {
    NavBar,
    List,
    Cell,
    Icon,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const songs = reactive<ISongs>({ dailySongs: [], recommendReasons: [] });
    const loading = ref(false);
    const finished = ref(false);
    // 获取日推歌曲列表
    const getSongsData = () => {
      axios.get(store.state.api.songs[process.env.NODE_ENV]).then((res) => {
        const { recommendReasons, dailySongs } = res.data.data;
        loading.value = false;
        finished.value = true;
        songs.dailySongs.splice(0);
        songs.recommendReasons = recommendReasons;
        dailySongs.forEach((song: IDailySongs) => {
          const tmp: IDailySongs = {
            name: song.name,
            id: song.id,
            ar: song.ar.map((val: any) => ({ name: val.name })),
            alia: song.alia,
            al: {
              name: song.al.name,
              picUrl: song.al.picUrl,
            },
            originSongSimpleData: null,
          };
          // 原唱歌手
          if (song.originSongSimpleData) {
            tmp.originSongSimpleData = {
              artists: song.originSongSimpleData.artists,
            };
          }
          songs.dailySongs.push(tmp);
        });
      });
    };
    const onLoad = () => {
      getSongsData();
    };
    // 返回
    const onClickLeft = () => {
      router.back();
    };
    // 播放音乐
    const playSong = (song: IDailySongs, index: number) => {
      console.log('playSong');
      // 更新播放列表
      store.dispatch("setPlayingList", {
        list: songs,
        playing: song,
      });
    };
    return {
      songs,
      onLoad,
      loading,
      finished,
      playSong,
      onClickLeft,
      ImagePreview,
    };
  },
});
</script>

<style lang="less" scoped>
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
</style>
