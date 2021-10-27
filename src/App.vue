<template>
  <router-view />
  <app-tabbar />
  <play />
</template>

<script>
import { defineComponent } from "@vue/composition-api";
import AppTabbar from "./components/AppTabbar.vue";
import Play from "./components/Play.vue";

export default defineComponent({
  name: "App",
  components: {
    AppTabbar,
    Play,
  },
  setup() {
    console.log(process.env.NODE_ENV);
    return {};
  },
});
</script>
