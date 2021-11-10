<template>
  <router-view />
  <app-tabbar v-show="showTabbar" />
  <play v-show="showPlayer" />
</template>

<script>
import { defineComponent, ref, watchEffect } from "vue";
import { useStore } from "vuex";
import AppTabbar from "./components/AppTabbar.vue";
import Play from "./components/Play.vue";

export default defineComponent({
  name: "App",
  components: {
    AppTabbar,
    Play,
  },
  setup() {
    const store = useStore();
    const _showPlayer = store.state.showPlayer;
    const _showTabbar = store.state.showTabbar;
    const showPlayer = ref(_showPlayer);
    const showTabbar = ref(_showTabbar);
    watchEffect(() => {
      showPlayer.value = store.state.showPlayer;
      showTabbar.value = store.state.showTabbar;
      console.log("showPlayer:", store.state.showPlayer);
      console.log("showTabbar:", store.state.showTabbar);
    });
    return {
      showPlayer,
      showTabbar,
    };
  },
});
</script>
