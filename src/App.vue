<template>
  <router-view />
  <app-tabbar />
</template>

<script>
import { defineComponent } from "@vue/composition-api";
import AppTabbar from "./components/AppTabbar.vue";

export default defineComponent({
  name: "App",
  components: {
    AppTabbar,
  },
  setup() {
    console.log(process.env.NODE_ENV);
    return{}
  }
});
</script>
