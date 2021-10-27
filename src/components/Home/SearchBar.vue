<template>
  <div class="search">
    <search disabled :placeholder="hot" input-align="center" />
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

export default defineComponent({
  name: "SearchBar",
  components: { Search },
  setup() {
    const store = useStore();
    const hot = ref("请输入搜索内容");
    const hots: Array<string> = reactive([]);
    // 获取搜索热词
    const getHotData = () => {
      axios.get(store.state.api.hot[process.env.NODE_ENV]).then((res) => {
        hots.push(
          ...res.data.result.hots.map((item: { first: string }) => item.first)
        );
      });
    };
    getHotData();
    let timer = 0;
    let index = 0;
    onMounted(() => {
      timer = setInterval(() => {
        hot.value = hots[index];
        index = index < hots.length - 1 ? index + 1 : 0;
        console.log("setInterval", hot.value);
      }, 3000);
    });
    onBeforeUnmount(() => {
      clearInterval(timer);
      console.log("SearchBar clearInterval");
    });
    return {
      hot,
    };
  },
});
</script>