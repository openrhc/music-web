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
        @clear="onClear"
        @focus="onFocus"
      />
    </sticky>
    <div v-if="!keywords">
      <div class="history-wrap" v-if="history.length !== 0">
        <span class="title">历史记录</span>
        <div class="history">
          <div
            class="item"
            v-for="h in history"
            :key="h"
            @click="handleHistorySearch(h)"
          >
            {{ h }}
          </div>
        </div>
        <span class="clear" @click="handleClearHistory">清除</span>
      </div>
      <div class="hot">
        <div
          class="item"
          v-for="(h, i) in hotWords"
          :key="h"
          @click="handleSearchHot(h)"
        >
          <span class="index">{{ i + 1 }}</span>
          <span class="name">{{ h }}</span>
        </div>
      </div>
    </div>
    <list
      :loading="suggestWordsLoading"
      :finished="true"
      finished-text=""
      @load="onSuggestWordsLoad"
      v-if="showSuggest"
    >
      <cell v-for="(s, i) in suggestWords" :key="i">
        <template #value>
          <div @click="handleSearchSuggest(s)">
            {{ s.name }} - {{ s.artists }}
          </div>
        </template>
      </cell>
    </list>
    <list
      :loading="loading"
      :finished="finished"
      finished-text=""
      @load="onLoad"
      v-else
    >
      <cell v-for="s in songs" :key="s.id">
        <template #value>
          <div class="song-item" @click="handlePlaySong(s)">
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
import {
  defineComponent,
  reactive,
  ref,
  onBeforeMount,
  onBeforeUnmount,
  watch,
  customRef,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { List, Cell, Icon, Search as VanSearch, Sticky } from "vant";
import axios from "axios";
import { useStore } from "vuex";
import { ISong, ISongMore, extractSong } from "../common/Song";

// 自定义防抖hook函数
function useDebounceRef<T>(value: T, delay = 200) {
  // 准备一个存储定时器的id的变量
  let timeOutId: number;
  return customRef((track, trigger) => {
    return {
      // 返回数据的
      get() {
        track();
        return value;
      },
      // 设置数据的
      set(newValue: T) {
        // 清理定时器
        clearTimeout(timeOutId);
        // 开启定时器
        timeOutId = setTimeout(() => {
          value = newValue;
          // 告诉Vue更新界面
          trigger();
        }, delay);
      },
    };
  });
}

export default defineComponent({
  name: "Search",
  components: {
    VanSearch,
    List,
    Cell,
    Icon,
    Sticky,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    const songs = reactive<ISong[]>([]);
    // 歌曲建议加载状态
    const loading = ref(false);
    const finished = ref(false);
    const hotWords = reactive<string[]>([]);
    const suggestWords = reactive<any[]>([]);
    const showSuggest = ref(false);
    const keywords = useDebounceRef(route.query.keywords as string, 500);
    let history = reactive<string[]>([]);
    // 搜索建议加载状态
    const suggestWordsLoading = ref(false);
    // 是否需要搜索建议
    const needSuggest = ref(true);
    const search_history = localStorage.getItem("search_history");
    if (search_history) {
      history.splice(0);
      JSON.parse(search_history).forEach((item: string) => {
        history.push(item);
      });
    }
    // 获取搜索热词
    const getHotSearch = () => {
      axios.get(store.state.api.hot2[process.env.NODE_ENV]).then((res) => {
        hotWords.splice(0);
        res.data.result.hots.forEach((item: { first: string }) => {
          hotWords.push(item.first);
        });
      });
    };
    getHotSearch();
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
          songs.splice(0);
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
    // 获取搜索建议
    const onSuggestWordsLoad = () => {
      suggestWordsLoading.value = true;
      axios
        .get(
          store.state.api.suggest[process.env.NODE_ENV] +
            "?keywords=" +
            keywords.value
        )
        .then((res) => {
          suggestWordsLoading.value = false;
          const songs = res.data.result.songs;
          suggestWords.splice(0);
          songs.forEach((s: any) => {
            suggestWords.push({
              name: s.name,
              artists: s.artists.map((item: any) => item.name).join("/"),
            });
          });
        });
    };
    // 点击搜索建议的某一条
    const handleSearchSuggest = (s: any) => {
      keywords.value = s.name + " " + s.artists;
      needSuggest.value = false;
      showSuggest.value = false;
      suggestWords.splice(0);
      getSearchData(s.name + " " + s.artists);
    };
    // 点击热搜的某一条
    const handleSearchHot = (s: string) => {
      keywords.value = s;
      needSuggest.value = false;
      showSuggest.value = false;
      suggestWords.splice(0);
      getSearchData(s);
    };
    // 监听搜索变化，获取推荐搜索
    watch(keywords, () => {
      if (keywords.value.trim() && needSuggest.value) {
        onSuggestWordsLoad();
        showSuggest.value = true;
      }
      if (keywords.value.length === 0) {
        songs.splice(0);
        showSuggest.value = false;
      }
    });
    const onLoad = () => {
      // getSearchData();
    };
    const onSearch = () => {
      if (!keywords.value.trim()) {
        console.log("空");
        return;
      }
      suggestWords.splice(0);
      showSuggest.value = false;
      getSearchData(keywords.value);
      history.splice(0, 0, keywords.value);
      localStorage.setItem("search_history", JSON.stringify(history));
    };
    const handleClearHistory = () => {
      history.splice(0);
      localStorage.setItem("search_history", "[]");
    };
    const handleHistorySearch = (v: string) => {
      keywords.value = v;
      needSuggest.value = false;
      showSuggest.value = false;
      getSearchData(v);
    };
    const onCancel = () => {
      router.back();
    };
    const onClear = () => {
      console.log(1);
    };
    const onFocus = () => {
      needSuggest.value = true;
    };
    const highlitKeywords = (source: string, keywords: string) => {
      return source.replace(
        keywords,
        `<span style="color: skyblue">${keywords}</span>`
      );
    };
    // 点击搜索结果：播放
    const handlePlaySong = (s: ISong) => {
      axios
        .get(store.state.api.songdetails[process.env.NODE_ENV] + "?ids=" + s.id)
        .then((res) => {
          const song = extractSong(res.data.songs[0]);
          // 更新播放列表: 搜索的是单曲，不能全部替换，采用添加到原歌单列表的方式
          const list = store.state.playingList.list;
          store.dispatch("togglePlayer", true);
          list.push(song);
          store.dispatch("setPlayingList", {
            list,
            playing: song,
          });
        });
    };

    onBeforeMount(() => {
      store.dispatch("toggleTabbar", false);
      store.dispatch("togglePlayer", false);
    });

    onBeforeUnmount(() => {
      store.dispatch("toggleTabbar", true);
      store.dispatch("togglePlayer", true);
    });

    // 默认执行搜索
    if (keywords.value) {
      getSearchData(keywords.value);
    }
    return {
      keywords,
      onSearch,
      onCancel,
      onClear,
      onFocus,
      loading,
      finished,
      onLoad,
      songs,
      highlitKeywords,
      history,
      handleHistorySearch,
      handlePlaySong,
      hotWords,
      suggestWords,
      showSuggest,
      onSuggestWordsLoad,
      suggestWordsLoading,
      handleSearchSuggest,
      handleClearHistory,
      handleSearchHot,
    };
  },
});
</script>

<style lang="less" scoped>
.history-wrap {
  display: flex;
  padding: 0 8px;
  align-items: center;
  .title {
    color: black;
    font-weight: bold;
    margin-right: 4px;
    font-size: 12px;
  }
  .clear {
    margin-left: 4px;
    font-size: 12px;
    color: #bcbcbc;
  }
}
.history {
  flex: 1;
  padding: 8px;
  display: flex;
  overflow-x: auto;
  .item {
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 16px;
    flex-shrink: 0;
    background: rgba(0, 0, 0, 0.04);
    margin: 4px;
  }
}
.hot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  span {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .item {
    display: flex;
    width: 50%;
    padding: 8px 0;
    align-items: center;
    .index {
      text-align: center;
      width: 20%;
    }
    .name {
      width: 80%;
    }
  }
}
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