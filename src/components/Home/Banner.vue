<template>
  <div class="banner">
    <swipe class="my-swipe" :autoplay="3000" indicator-color="white">
      <swipe-item
        v-for="b in banners"
        :key="b"
        v-lazy:background-image="b.imageUrl"
        @click="handleBannerSong(b)"
      >
        <!-- {{ b.typeTitle }} -->
        {{ b.targetType }} / {{ b.typeTitle }}
      </swipe-item>
    </swipe>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive } from "vue";
import { Swipe, SwipeItem } from "vant";
import axios from "axios";
import { useStore } from "vuex";
import { extractSong, ISong } from "@/common/Song";

interface IBanner {
  imageUrl: string;
  targetId: number;
  typeTitle: string;
  targetType: number;
}

// interface IAlbumSong {

// }

export default defineComponent({
  name: "Banner",
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
              targetType: banner.targetType,
            });
          });
          store.dispatch("setBanner", banners);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    // 点击banner中的歌曲
    const handleBannerSong = (b: IBanner) => {
      // 新歌首发
      if (b.targetType === 1) {
        axios
          // .get(
          //   store.state.api.songdetails[process.env.NODE_ENV] +
          //     "?ids=" +
          //     b.targetId
          // )
          .get(store.state.api.songdetails["production"] + "?ids=" + b.targetId)
          .then((res) => {
            const song = extractSong(res.data.songs[0]);
            const list = store.state.playingList.list;
            store.dispatch("togglePlayer", true);
            list.push(song);
            store.dispatch("setPlayingList", {
              list,
              playing: song,
            });
            store.dispatch("togglePlayPage", true);
          });
        return;
      }
      // 新碟首发
      if (b.targetType === 10) {
        // 
      }
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
      handleBannerSong,
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
