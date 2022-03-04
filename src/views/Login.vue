<template>
  <div class="login">
    <van-image
      class="logo"
      round
      width="100"
      height="100"
      fit="cover"
      src="https://img.yzcdn.cn/vant/cat.jpeg"
    />
    <van-button class="login-btn" round type="danger" @click="show1 = true"
      >手机号登录</van-button
    >
    <van-button class="login-btn" round type="default" @click="handleQrLogin"
      >扫码登录</van-button
    >
    <popup v-model:show="show1" position="bottom" :style="{ height: '100%' }">
      <van-form @submit="handleMobileLogin" validateTrigger="onChange">
        <cell-group inset>
          <field
            v-model="username"
            name="pattern"
            label="手机号"
            type="number"
            placeholder="手机号"
            :rules="[{ pattern, required: true, message: '请正确填写手机号' }]"
          />
          <field
            v-model="password"
            type="password"
            name="密码"
            label="密码"
            placeholder="密码"
            :rules="[{ required: true, message: '请填写密码' }]"
          />
        </cell-group>
        <div style="margin: 16px">
          <van-button
            round
            block
            type="primary"
            color="red"
            native-type="submit"
          >
            登录
          </van-button>
        </div>
        <div style="margin: 16px">
          <van-button round block plain @click="show1 = false">
            其他方式登录
          </van-button>
        </div>
      </van-form>
    </popup>
    <popup v-model:show="show2">
      <van-image width="100" height="100" fit="cover" :src="qrImage" />
      <p>{{ qrStatus }}</p>
    </popup>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, onBeforeMount, onBeforeUnmount } from "vue";
import { Button as VanButton, Image as VanImage, Popup, Toast } from "vant";
import { Form as VanForm, Field, CellGroup } from "vant";
import axios from "axios";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";

export default defineComponent({
  name: "Login",
  components: {
    VanButton,
    VanImage,
    Popup,
    VanForm,
    Field,
    CellGroup,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const show1 = ref(false);
    const show2 = ref(false);
    const qrImage = ref("");
    const qrKey = ref("");
    const qrStatus = ref("");
    let timer = 0;

    // 校验手机号
    const pattern =
      /^1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}$/;

    // 手机号（用户名）
    const username = ref("18196789181");
    const password = ref("qq123456789");

    // 获取登录二维码
    const getQrImage = () => {
      axios
        .get(store.state.api.qrkey[process.env.NODE_ENV])
        .then((res) => {
          qrKey.value = res.data.data.unikey;
          return axios.get(
            store.state.api.qrcreate[process.env.NODE_ENV] +
              "?key=" +
              qrKey.value
          );
        })
        .then((res) => {
          qrImage.value =
            "https://my.tv.sohu.com/user/a/wvideo/getQRCode.do?text=" +
            res.data.data.qrurl;
        });
    };

    // 扫码登录事件
    const handleQrLogin = () => {
      show2.value = true;
      getQrImage();
      timer = setInterval(() => {
        axios
          .get(
            store.state.api.qrcheck[process.env.NODE_ENV] +
              "?key=" +
              qrKey.value
          )
          .then((res) => {
            const { code, message, cookie } = res.data;
            qrStatus.value = message;
            if (code === 803) {
              console.log(cookie);
              console.log("登录成功");
            } else if (code === 800) {
              clearInterval(timer);
              Toast(message);
            }
          });
      }, 3000);
    };

    // 手机号登录
    const handleMobileLogin = () => {
      if (!username.value.trim() || !password.value.trim()) {
        Toast("请正确填写");
        return;
      }
      axios
        // .get(
        //   store.state.api.cellphone[process.env.NODE_ENV] +
        //     `?phone=${username.value}&password=${password.value}`
        // )
        .get(
          store.state.api.cellphone['production'] +
            `?phone=${username.value}&password=${password.value}`
        )
        .then((res) => {
          if (res.data.code !== 200) {
            Toast(res.data.message || "用户名或密码错误");
            return;
          }
          const { cookie, token } = res.data;
          const { userId, avatarUrl, nickname, backgroundUrl } =
            res.data.profile;
          const { id, createTime } = res.data.account;
          const profile = {
            userId,
            nickname,
            avatarUrl,
            backgroundUrl,
            createTime,
          };
          const account = {
            id,
            createTime,
          };
          const user = {
            isLogin: true,
            account,
            profile,
          };
          store.dispatch("setUser", user);
          document.cookie = cookie;
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
          Toast("登录成功");
          router.replace("/");
        });
    };

    onBeforeMount(() => {
      store.dispatch("toggleTabbar", false);
      store.dispatch("togglePlayer", false);
    });

    onBeforeUnmount(() => {
      store.dispatch("toggleTabbar", true);
      store.dispatch("togglePlayer", true);
    });

    // 开发模式 - 自动登录
    if (process.env.NODE_ENV === "development") {
      handleMobileLogin();
    }

    return {
      show1,
      show2,
      qrImage,
      handleQrLogin,
      qrStatus,
      handleMobileLogin,
      username,
      password,
      pattern,
    };
  },
});
</script>

<style lang="less" scoped>
.login {
  padding-top: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  .logo {
    margin-bottom: 60px;
  }
  .login-btn {
    width: 80%;
    margin: 8px 0;
  }
}
</style>