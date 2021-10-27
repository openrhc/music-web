<template>
  <swipe :loop="false" :width="320" class="my-swipe">
    <swipe-item v-for="i in len" :key="i">
      <grid :gutter="0" :column-num="3" :border="false">
        <grid-item
          v-for="l in personalizedList.slice((i - 1) * 3, (i - 1) * 3 + 3)"
          :key="l.id"
        >
          <img class="grid-item_icon" v-lazy="l.picUrl" :alt="l.name" />
          <span class="grid-item_text">{{ l.name }}</span>
        </grid-item>
      </grid>
    </swipe-item>
    <template #indicator></template>
  </swipe>
</template>
<script lang="ts">
import { defineComponent, ref, reactive } from "vue";
import { useStore } from "vuex";
import { Swipe, SwipeItem, Grid, GridItem } from "vant";
import axios from "axios";

interface IPersonalized {
  id: number;
  name: string;
  picUrl: string;
  playCount: number;
}

export default defineComponent({
  name: "CellRow",
  components: {
    Swipe,
    SwipeItem,
    Grid,
    GridItem,
  },
  setup() {
    const store = useStore();
    let len = ref(0);
    const personalizedList = reactive<IPersonalized[]>([]);
    // 获取推荐歌单
    const getPersonalized = () => {
      axios
        .get(store.state.api.personalized[process.env.NODE_ENV])
        .then((res) => {
          personalizedList.splice(0);
          res.data.result.forEach((play: IPersonalized) => {
            personalizedList.push({
              id: play.id,
              name: play.name,
              picUrl: play.picUrl,
              playCount: play.playCount,
            });
          });
          len.value = Math.ceil(res.data.result.length / 3);
        });
    };
    getPersonalized();
    return {
      len,
      personalizedList,
    };
  },
});
</script>

<style lang="less" scoped>
.grid-item_icon {
  width: 90px;
  height: 90px;
}
.grid-item_text {
  font-size: 12px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  width: 90px;
}
</style>