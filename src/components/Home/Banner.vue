<template>
  <div class="banner">
    <swipe class="my-swipe" :autoplay="3000" indicator-color="white">
      <swipe-item
        v-for="b in banners"
        :key="b"
        v-lazy:background-image="b.imageUrl"
      >
        <!-- {{ b.typeTitle }} -->
      </swipe-item>
    </swipe>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive } from "vue";
import { Swipe, SwipeItem } from "vant";
import axios from "axios";
import { useStore } from "vuex";

interface IBanner {
  imageUrl: string;
  targetId: number;
  typeTitle: string;
}

export default defineComponent({
  name: "App",
  components: {
    Swipe,
    SwipeItem,
  },
  setup() {
    const store = useStore();
    const banners = reactive<IBanner[]>([]);
    // 获取banner
    const getBannerData = () => {
      axios
        .get(store.state.api.banner[process.env.NODE_ENV])
        .then((res) => {
          console.log(res.data.banners);
          banners.splice(0);
          res.data.banners.forEach((banner: IBanner) => {
            banners.push({
              imageUrl: banner.imageUrl,
              targetId: banner.targetId,
              typeTitle: banner.typeTitle,
            });
          });
          store.dispatch("setBanner", banners);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    // 从store获取banners
    const bannerStore = store.state.banners;
    if (bannerStore.length) {
      banners.push(...bannerStore);
    } else {
      getBannerData();
    }
    return {
      banners,
    };
  },
});
</script>

<style lang="less" scoped>
.banner {
  padding: 4px 16px;
}
.my-swipe {
  border-radius: 8px;
  .van-swipe-item {
    color: #fff;
    box-sizing: border-box;
    font-size: 20px;
    line-height: 150px;
    height: 140px;
    text-align: center;
    background-color: #39a9ed;
    background-size: 100% 100%;
    border-radius: 8px;
  }
}
</style>
