<template>
  <tabbar active-color="red" route placeholder>
    <tabbar-item v-for="t in tabbar" :key="t.id" :icon="t.icon" :to="t.url">
      {{ t.name }}
    </tabbar-item>
  </tabbar>
</template>
<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import { Tabbar, TabbarItem } from "vant";

export default defineComponent({
  name: "AppTabbar",
  components: {
    Tabbar,
    TabbarItem,
  },
  setup() {
    const tabbar = reactive([
      {
        id: "Home",
        name: "发现",
        url: "/",
        icon: "fire",
      },
      {
        id: "Video",
        name: "视频",
        url: "/video",
        icon: "video",
      },
      {
        id: "Center",
        name: "我的",
        url: "/center",
        icon: "manager",
      },
    ]);
    return {
      tabbar,
    };
  },
});
</script>
