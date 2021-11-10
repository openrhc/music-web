<template>
  <div class="recommendsongs">
    <!-- 导航栏 -->
    <nav-bar
      title="歌单详情"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
    />
  </div>
  <div class="head">
    <div
      class="bg"
      :style="{
        backgroundImage: `url(${headInfo.img})`,
      }"
    ></div>
    <p class="desp">{{ headInfo.name }}</p>
    <div class="tag">
      <tag type="primary" v-for="t in headInfo.tag" :key="t">
        {{ t }}
      </tag>
    </div>
  </div>
  <!-- 歌曲列表 -->
  <list
    v-model:loading="loading"
    :finished="finished"
    finished-text="没有更多了"
    @load="onLoad"
  >
    <cell v-for="(s, index) in songs" :key="s.id">
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
import { NavBar, List, Cell, Icon, ImagePreview, Tag } from "vant";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";

interface ISong {
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
    Tag,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const songs = reactive<ISong[]>([]);
    const loading = ref(false);
    const finished = ref(false);
    const id = route.query.id;
    const headInfo = reactive({
      img: "",
      name: "",
      tag: [],
    });
    // 获取歌单列表
    const getSongsData = () => {
      axios
        .get(
          store.state.api.playlistdetails[process.env.NODE_ENV] + "?id=" + id
        )
        .then((res) => {
          const { tracks } = res.data.playlist;
          const { coverImgUrl, name, tags } = res.data.playlist;
          headInfo.img = coverImgUrl;
          headInfo.name = name;
          headInfo.tag = tags;
          loading.value = false;
          finished.value = true;
          songs.splice(0);
          tracks.forEach((song: ISong) => {
            const tmp: ISong = {
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
            songs.push(tmp);
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
    const playSong = (song: ISong, index: number) => {
      console.log("playSong");
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
      headInfo,
    };
  },
});
</script>

<style lang="less" scoped>
.head {
  position: relative;
  overflow: hidden;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .bg {
    position: absolute;
    height: 100%;
    width: 100%;
    background-position: center;
    background-size: cover;
  }
  .desp {
    font-size: 22px;
    position: relative;
    z-index: 99;
    color: white;
    text-shadow: 2px 2px 2px rgba(46, 46, 46, 0.829);
  }
  .tag {
    span {
      margin: 4px;
    }
  }
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
