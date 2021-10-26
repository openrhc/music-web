<template>
  <div class="hot-fun">
    <grid :border="false" :clickable="true">
      <grid-item
        v-for="f in funs"
        :key="f.name"
        :icon="f.icon"
        :text="f.text"
        :to="f.to"
      />
    </grid>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { Grid, GridItem } from "vant";

export default defineComponent({
  name: "HotFun",
  components: {
    Grid,
    GridItem,
  },
  setup() {
    const funs = [
      {
        text: "每日推荐",
        icon: "good-job",
        to: "/about",
      },
      {
        text: "私人FM",
        icon: "music",
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
