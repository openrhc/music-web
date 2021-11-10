<template>
  <div class="recommend">
    <!-- 头部 -->
    <cell title="">
      <template #icon>
        <div @click="handleReFresh" class="recommend-refresh">
          <icon :name="icon" :class="{ refresh: loading }" />
          <span>{{ title }}</span>
        </div>
      </template>
      <template #right-icon>
        <icon :name="rightIcon" />
      </template>
    </cell>
    <!-- 具体的内容 -->
    <div class="body">
      <swipe :loop="false" :width="320" class="my-swipe">
        <swipe-item
          v-for="i in Math.ceil(personalizedList.length / 3)"
          :key="i"
        >
          <grid :gutter="0" :column-num="3" :border="false">
            <grid-item
              v-for="l in personalizedList.slice((i - 1) * 3, (i - 1) * 3 + 3)"
              :key="l.id"
              :to="'/detail?id=' + l.id"
            >
              <img class="grid-item_icon" v-lazy="l.picUrl" :alt="l.name" />
              <span class="grid-item_text">{{ l.name }}</span>
            </grid-item>
          </grid>
        </swipe-item>
        <template #indicator></template>
      </swipe>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, reactive } from "vue";
import { useStore } from "vuex";
import { Swipe, SwipeItem, Grid, GridItem, Cell, Icon } from "vant";
import axios from "axios";

interface IPersonalized {
  id: number;
  name: string;
  picUrl: string;
  playCount: number;
}

export default defineComponent({
  name: "RecommandCell",
  props: {
    title: {
      type: String,
    },
    icon: {
      type: String,
    },
    rightIcon: {
      type: String,
    },
  },
  components: {
    Cell,
    Icon,
    Swipe,
    SwipeItem,
    Grid,
    GridItem,
  },
  setup() {
    const store = useStore();
    // 总的数据长度
    const len = ref(0);
    // 组数
    const groupLen = ref(0);
    // 显示第几组
    const index = ref(-1);
    // 加载中
    const loading = ref(true);
    // 所有歌单
    const allList = reactive<IPersonalized[]>([]);
    // 当前显示的歌单
    const personalizedList = reactive<IPersonalized[]>([]);
    // 获取推荐歌单
    const getAllList = () => {
      axios
        .get(store.state.api.personalized[process.env.NODE_ENV] + "?limit=15")
        .then((res) => {
          allList.splice(0);
          res.data.result.forEach((play: IPersonalized) => {
            allList.push({
              id: play.id,
              name: play.name,
              picUrl: play.picUrl,
              playCount: play.playCount,
            });
          });
          len.value = res.data.result.length;
          groupLen.value = Math.ceil(res.data.result.length / 6);
          handleReFresh();
        });
    };
    // 刷新推荐歌单列表
    const handleReFresh = () => {
      loading.value = true;
      index.value = index.value + 1 > groupLen.value - 1 ? 0 : index.value + 1;
      // 1s后再更新数据
      setTimeout(
        () => {
          loading.value = false;
          personalizedList.splice(0);
          allList
            .slice(index.value * 6, index.value * 6 + 6)
            .forEach((play: IPersonalized) => {
              personalizedList.push(play);
            });
        },
        index.value === 0 ? 0 : 1000
      );
    };
    getAllList();
    return {
      len,
      index,
      groupLen,
      personalizedList,
      handleReFresh,
      allList,
      loading,
    };
  },
});
</script>

<style lang="less" scoped>
.recommend {
  .van-cell {
    align-items: center;
  }
  .recommend-refresh {
    span {
      margin-left: 4px;
    }
  }
  .body {
    padding: 0 8px;
  }
}
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
@keyframes anim {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.refresh {
  animation: anim 1s linear;
}
</style>