<template>
  <div class="home">
    <!-- 导航栏 -->
    <nav-bar :title="appname" />
    <!-- 搜索框 -->
    <search-bar />
    <pull-refresh v-model="loading" @refresh="onRefresh" class="refresh">
      <!-- banner -->
      <banner />
      <!-- 金刚区 -->
      <hot-fun />
      <!-- 歌曲推荐 -->
      <recommend-cell icon="replay" title="推荐歌单" rightIcon="more-o">
        <template #body>
          <cell-row />
        </template>
      </recommend-cell>
      <!-- 底线 -->
      <divider>到底了</divider>
    </pull-refresh>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import { useStore } from "vuex";
import { Divider, NavBar, PullRefresh, Toast } from "vant";
import RecommendCell from "../components/Home/RecommendCell.vue";
import Banner from "../components/Home/Banner.vue";
import HotFun from "../components/Home/HotFun.vue";
import CellRow from "../components/Home/CellRow.vue";
import SearchBar from "../components/Home/SearchBar.vue";

export default defineComponent({
  name: "Home",
  components: {
    RecommendCell,
    Divider,
    NavBar,
    SearchBar,
    Banner,
    HotFun,
    PullRefresh,
    CellRow,
  },
  setup() {
    const store = useStore();
    const loading = ref(false);

    // 下拉刷新
    const onRefresh = () => {
      setTimeout(() => {
        Toast("刷新成功");
        loading.value = false;
      }, 1000);
    };
    return {
      loading,
      onRefresh,
      appname: store.state.appname,
    };
  },
});
</script>

<style lang="less" scoped>
.refresh {
  // height: calc(100vh - 100px);
}
</style>