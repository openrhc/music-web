<template>
  <div class="search">
    <search
      disabled
      :placeholder="hot.content"
      input-align="center"
      @click="handleGoSearch"
    />
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
} from "vue";
import { Search } from "vant";
import axios from "axios";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

interface IHot {
  searchWord: string;
  content: string;
}

export default defineComponent({
  name: "SearchBar",
  components: { Search },
  setup() {
    const store = useStore();
    const router = useRouter();
    const hot = reactive<IHot>({
      searchWord: "",
      content: "搜索音乐、视频、歌手",
    });
    const hots = reactive<IHot[]>([]);
    // 获取搜索热词
    const getHotData = () => {
      axios.get(store.state.api.hot[process.env.NODE_ENV]).then((res) => {
        hots.push(
          ...res.data.data.map((item: IHot) => {
            return {
              searchWord: item.searchWord,
              content: item.content,
            };
          })
        );
      });
    };
    getHotData();
    let timer = 0;
    let index = 0;
    onMounted(() => {
      timer = setInterval(() => {
        Object.assign(hot, hots[index]);
        index = index < hots.length - 1 ? index + 1 : 0;
      }, 3000);
    });
    onBeforeUnmount(() => {
      clearInterval(timer);
      console.log("SearchBar clearInterval");
    });
    const handleGoSearch = () => {
      router.push("/search?keywords=" + hot.searchWord);
    };
    return {
      hot,
      handleGoSearch,
    };
  },
});
</script>