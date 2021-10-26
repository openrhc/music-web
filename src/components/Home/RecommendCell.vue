<template>
  <div class="recommend">
    <cell :title="title">
      <template #icon>
        <icon :name="icon" />
      </template>
      <template #right-icon>
        <icon :name="rightIcon" />
      </template>
    </cell>
    <div class="body">
      <slot name="body"></slot>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { Cell, Icon } from "vant";

export default defineComponent({
  name: "App",
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
  },
  setup() {
    return {};
  },
});
</script>

<style lang="less" scoped>
.recommend {
  .van-cell {
    align-items: center;
  }
  .body {
    padding: 0 16px;
  }
}
</style>