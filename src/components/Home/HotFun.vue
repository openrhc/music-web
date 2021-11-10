<template>
  <div class="hot-fun">
    <grid :border="false" :clickable="true">
      <grid-item
        v-for="f in funs"
        :key="f.name"
        :icon="f.icon"
        :text="f.text"
        :badge="f.badge"
        @click="f.onclick"
      />
    </grid>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive } from "vue";
import { Grid, GridItem, Toast } from "vant";
import axios from "axios";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

interface ISong {
  // 歌曲名
  name: string;
  id: number;
  // 歌手列表
  artists: any[];
  album: {
    // 歌手后的字段：蓝光 新歌+精选
    name: string;
    picUrl: string;
  };
  originSongSimpleData: { artists: any } | null;
}

export default defineComponent({
  name: "HotFun",
  components: {
    Grid,
    GridItem,
  },
  setup() {
    const store = useStore();
    const router = useRouter()

    const handleRecommend = () => {
      if (!store.state.user.isLogin) {
        Toast("请先登录");
        return;
      }
      router.push('/recommend')
    }
    // 私人FM
    const handlePersonalFm = () => {
      if (!store.state.user.isLogin) {
        Toast("请先登录");
        return;
      }
      axios
        .get(store.state.api.personalfm[process.env.NODE_ENV])
        .then((res) => {
          const songs = reactive<ISong[]>([]);
          const data = res.data.data;
          data.forEach((song: ISong) => {
            const tmp: any = {
              name: song.name,
              id: song.id,
              ar: song.artists.map((val: any) => ({ name: val.name })),
              al: {
                name: song.album.name,
                picUrl: song.album.picUrl,
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
          // 更新播放列表
          store.dispatch("setPlayingList", {
            list: songs,
            playing: songs[0],
          });
          store.dispatch("togglePlayPage", true);
        });
    };
    const funs = [
      {
        text: "每日推荐",
        icon: "good-job",
        to: "/recommend",
        onclick: handleRecommend
      },
      {
        text: "私人FM",
        icon: "music",
        onclick: handlePersonalFm,
      },
      {
        text: "歌单",
        icon: "award",
      },
      {
        text: "排行榜",
        icon: "medal",
      },
    ];
    return {
      funs,
    };
  },
});
</script>

<style lang="less" scoped>
.hot-fun {
  padding: 0 16px;
}
</style>
