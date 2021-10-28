<template>
  <div class="search">
    <sticky>
      <van-search
        v-model="keywords"
        show-action
        autofocus
        placeholder="请输入搜索关键词"
        @search="onSearch"
        @cancel="onCancel"
      />
    </sticky>
    <!-- 歌曲列表 -->
    <list
      :loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <cell v-for="s in songs" :key="s.id">
        <template #value>
          <div class="song-item">
            <div class="body">
              <div class="title">
                <div
                  class="maintitle"
                  v-html="highlitKeywords(s.name, keywords)"
                ></div>
                <div class="subtitle">
                  {{ s.transNames ? `(${s.transNames})` : "" }}
                </div>
              </div>
              <div class="info">
                <div class="singer">
                  {{ s.artists }}
                </div>
                <div class="album">
                  {{ s.album }}
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
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { List, Cell, Icon, Search as VanSearch, Sticky } from "vant";
import axios from "axios";
import { useStore } from "vuex";

interface ISong {
  id: number;
  // 名称
  name: string;
  // 名称后面的字段
  transNames: string;
  // 歌手列表
  artists: string;
  // 歌手后面的字段
  album: string;
  mvid: number;
}

export default defineComponent({
  name: "Search",
  components: { VanSearch, List, Cell, Icon, Sticky },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    const songs = reactive<ISong[]>([]);
    const loading = ref(false);
    const finished = ref(false);
    const keywords = ref(route.query.keywords as string);
    // 搜索
    const getSearchData = (keywords: string) => {
      loading.value = true;
      axios
        .get(
          store.state.api.search[process.env.NODE_ENV] + "?keywords=" + keywords
        )
        .then((res) => {
          loading.value = false;
          finished.value = true;
          const _songs = res.data.result.songs;
          console.log("length:" + _songs.length);

          _songs.forEach((song: any) => {
            songs.push({
              id: song.id,
              name: song.name,
              transNames: song.transNames?.join("/"),
              artists: song.artists.map((item: any) => item.name).join("/"),
              album: song.album.name,
              mvid: song.mvid,
            });
          });
          console.log("keng:" + songs.length);
        });
    };
    const onLoad = () => {
      // getSearchData();
    };
    const onSearch = () => {
      getSearchData(keywords.value);
    };
    const onCancel = () => {
      router.back();
    };
    const highlitKeywords = (source: string, keywords: string) => {
      return source.replace(
        keywords,
        `<span style="color: skyblue">${keywords}</span>`
      );
    };
    return {
      keywords,
      onSearch,
      onCancel,
      loading,
      finished,
      onLoad,
      songs,
      highlitKeywords,
    };
  },
});
</script>

<style lang="less" scoped>
.song-item {
  display: flex;
  align-items: center;
  .body {
    flex: 1;
    margin-left: 8px;
    width: 0;
    .title {
      display: flex;
      align-items: center;
      font-size: 16px;
      color: black;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      .maintitle {
      }
      .subtitle {
        color: gray;
      }
    }
    .info {
      font-size: 12px;
      color: gray;
      display: flex;
      div {
        color: gray;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .singer {
        margin-right: 4px;
      }
      .album {
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