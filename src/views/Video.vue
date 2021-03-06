<template>
  <div class="center">
    <!-- 导航栏 -->
    <nav-bar :title="appname" />
    <!-- 播放列表 -->
    <swipe
      class="my-swipe"
      vertical
      :loop="false"
      :touchable="!showCommentPage"
      @change="onChange"
    >
      <!-- 没有登录 -->
      <swipe-item v-if="!isLogin">
        <empty class="empty" image="error" description="请先登录" />
      </swipe-item>
      <swipe-item v-else v-for="(v, i) in videos" :key="i">
        <video
          :src="v.urlInfo.url"
          :ref="setRef"
          :data-index="i"
          @click="onVideoClick(i)"
          :class="{ mini: showCommentPage }"
          :autoplay="i === 0"
          loop
        ></video>
        <div class="info">
          <div class="user">
            <img :src="v.creator.avatarUrl" alt="" />
            <div class="nickname">{{ v.creator.nickname }}</div>
          </div>
          <div class="desp">
            <div class="title">{{ v.title }}</div>
            <!-- <div class="description">{{ v.description }}</div> -->
          </div>
        </div>
        <div class="count">
          <div class="item">
            <van-icon name="good-job-o" size="36" color="#eee" />
            {{ v.praisedCount }}
          </div>
          <div
            class="item"
            @click="
              showCommentPage = true;
              getComments();
            "
          >
            <van-icon name="comment-o" size="36" color="#eee" />
            {{ v.commentCount }}
          </div>
          <div class="item">
            <van-icon name="share-o" size="36" color="#eee" />
            {{ v.shareCount }}
          </div>
        </div>
      </swipe-item>
      <template #indicator></template>
    </swipe>
  </div>
  <popup
    class="ok"
    v-model:show="showCommentPage"
    position="bottom"
    :overlay="false"
    :style="{ height: '60%' }"
  >
    <div class="comments">
      <div class="head">
        <div class="count">评论({{ videoComments.count }})</div>
        <div class="filter">
          <div>热评</div>
          <div>全部</div>
        </div>
      </div>
      <div class="hot">
        <div class="item" v-for="(c, i) in videoComments.hotComments" :key="i">
          <img :src="c.user.avatarUrl" alt="" />
          <div class="right">
            <div class="head">
              <div class="left">
                <div class="nick">{{ c.user.nickname }}</div>
                <div class="time">{{ c.timeStr }}</div>
              </div>
              <div class="liked">
                {{ c.likedCount }}
                <van-icon name="good-job-o" size="14" color="#919191" />
              </div>
            </div>
            <div class="content">{{ c.content }}</div>
          </div>
        </div>
      </div>
      <list
        v-model:loading="commentsLoading"
        :finished="!hasMoreComments"
        :immediate-check="false"
        finished-text="没有更多了"
        @load="getComments"
      >
        <div class="item" v-for="(c, i) in videoComments.comments" :key="i">
          <img :src="c.user.avatarUrl" alt="" />
          <div class="right">
            <div class="head">
              <div class="left">
                <div class="nick">{{ c.user.nickname }}</div>
                <div class="time">{{ c.timeStr }}</div>
              </div>
              <div class="liked">
                {{ c.likedCount }}
                <van-icon name="good-job-o" size="14" color="#919191" />
              </div>
            </div>
            <div class="content">{{ c.content }}</div>
          </div>
        </div>
      </list>
    </div>
  </popup>
</template>
<script lang="ts">
import {
  defineComponent,
  reactive,
  onBeforeUnmount,
  onBeforeMount,
  ref,
} from "vue";
import { useStore } from "vuex";
import {
  NavBar,
  Swipe,
  SwipeItem,
  Empty,
  Toast,
  Icon as VanIcon,
  Popup,
  List,
} from "vant";
import axios from "axios";

interface IVideos {
  coverUrl: string; // 封面
  title: string; // 标题
  description: string; // 描述
  commentCount: number; // 评论
  shareCount: number; // 分享
  praisedCount: number; // 点赞
  creator: {
    avatarUrl: string; // 头像
    nickname: string; // 昵称
  };
  urlInfo: {
    id: string; // 视频ID
    url: string; // 视频链接
  };
}

interface IVideoComment {
  hotComments: Array<[]>;
  comments: Array<[]>;
  count: number;
}

export default defineComponent({
  name: "Video",
  components: {
    NavBar,
    Swipe,
    SwipeItem,
    Empty,
    VanIcon,
    Popup,
    List,
  },
  setup() {
    const store = useStore();
    const isLogin = store.state.user.isLogin;
    const videos: Array<IVideos> = reactive([]);
    const el_videos: any = reactive({});
    const showCommentPage = ref(false);
    // 视频评论
    const videoComments: IVideoComment = reactive({
      hotComments: [],
      comments: [],
      count: 0,
    });
    // 当前视频ID
    let currentVideoId = "";
    // 评论分页
    let commentPage = 1;
    // 是否有更多评论
    let hasMoreComments = ref(true);
    // 加载评论中
    const commentsLoading = ref(false);
    // 当前视频索引
    let currentIndex = 0;
    // 视频分页
    let videoOffset = 0;
    // 是否有更多视频
    let hasMoreVideos = ref(true);
    // 获取视频列表
    const getVideos = () => {
      if (!hasMoreVideos.value) {
        Toast("没有更多了");
        return;
      }
      axios
        // .get(
        //   store.state.api.videos[process.env.NODE_ENV] +
        //     "?offset=" +
        //     videoOffset
        // )
        // .get("http://hello-world.host:11044/api/video/timeline/recommend")
        .get(store.state.api.videos["production"] + "?offset=" + videoOffset)
        .then((res) => {
          hasMoreVideos.value = res.data.hasmore;
          Toast(res.data.msg);
          if (hasMoreVideos.value) {
            videoOffset++;
          }
          res.data.datas.forEach((item: any) => {
            const data: IVideos = item.data;
            videos.push({
              coverUrl: data.coverUrl,
              title: data.title,
              description: data.description,
              commentCount: data.commentCount,
              shareCount: data.shareCount,
              praisedCount: data.praisedCount,
              creator: {
                avatarUrl: data.creator.avatarUrl,
                nickname: data.creator.nickname,
              },
              urlInfo: {
                id: data.urlInfo.id,
                url: data.urlInfo.url,
              },
            });
          });
          if (currentVideoId === "") {
            currentVideoId = videos[0].urlInfo.id;
          }
        })
        .catch((e) => {
          Toast.fail(e.message);
        });
    };
    // 获取评论列表
    const getComments = () => {
      console.log("加载评论");
      if (!hasMoreComments.value) {
        Toast("没有更多了");
        return;
      }
      const isNewVideo = commentPage === 1;
      commentsLoading.value = true;
      axios
        // .get(
        //   store.state.api.videocomment[process.env.NODE_ENV] +
        //     "?id=" +
        //     currentVideoId +
        //     "&offset=" +
        //     (commentPage - 1) * 20
        // )
        .get(
          store.state.api.videocomment["production"] +
            "?id=" +
            currentVideoId +
            "&offset=" +
            (commentPage - 1) * 20
        )
        .then((res) => {
          commentsLoading.value = false;
          hasMoreComments.value = res.data.more;
          if (res.data.more) {
            commentPage++;
          }
          if (isNewVideo) {
            // 热评
            let hotComments = res.data.hotComments.map((v: any) => {
              return {
                user: {
                  nickname: v.user.nickname,
                  avatarUrl: v.user.avatarUrl,
                },
                content: v.content,
                timeStr: v.timeStr,
                likedCount: v.likedCount,
              };
            });
            videoComments.hotComments = hotComments;
          }

          // 普通评论
          let comments = res.data.comments.map((v: any) => {
            return {
              user: {
                nickname: v.user.nickname,
                avatarUrl: v.user.avatarUrl,
              },
              content: v.content,
              timeStr: v.timeStr,
              likedCount: v.likedCount,
            };
          });

          console.log(isNewVideo, comments.length);
          if (isNewVideo) {
            videoComments.comments = comments;
          } else {
            videoComments.comments.push(...comments);
          }
          videoComments.count = res.data.total;
        })
        .catch(() => {
          commentsLoading.value = false;
        });
    };

    if (isLogin) {
      getVideos();
    }

    onBeforeMount(() => {
      // 隐藏播放栏
      store.dispatch("togglePlayer", false);
    });

    onBeforeUnmount(() => {
      store.dispatch("togglePlayer", true);
    });

    // 动态ref
    const setRef = (el: HTMLVideoElement) => {
      // swipe滑动时会频繁触setRef函数，因此不采用数组存储video元素
      // 而是采用对象，el_videos结构如下:
      // {
      //    "0": el1,
      //    "1": el2
      // }
      if (el && el.dataset) {
        const index = Number(el.dataset.index);
        el_videos[index] = el;
      }
    };

    // 滑动时
    const onChange = (index: number) => {
      if (index > currentIndex) {
        console.log("下一条");
        el_videos[index - 1].pause();
      } else {
        console.log("上一条");
        el_videos[index + 1].pause();
      }
      el_videos[index].play();
      currentIndex = index;
      currentVideoId = videos[index].urlInfo.id;
      // 将评论清空
      videoComments.hotComments.splice(0);
      videoComments.comments.splice(0);
      videoComments.count = 0;
      hasMoreComments.value = true;
      commentPage = 1;
      // 获取新的数据
      if (currentIndex === videos.length - 1) {
        console.log("获取新的videos数据");
        Toast.loading({
          message: "加载中...",
          forbidClick: true,
        });
        getVideos();
      }
    };

    // 点击视频，切换播放和暂停
    const onVideoClick = (i: number) => {
      // 关闭评论
      if (showCommentPage.value) {
        showCommentPage.value = false;
        return;
      }
      if (el_videos[i].paused) {
        el_videos[i].play();
      } else {
        el_videos[i].pause();
      }
    };

    return {
      isLogin,
      videos,
      videoComments,
      onChange,
      onVideoClick,
      setRef,
      el_videos,
      hasMoreComments,
      hasMoreVideos,
      getComments,
      showCommentPage,
      commentsLoading,
      appname: store.state.appname,
    };
  },
});
</script>

<style lang="less" scoped>
.my-swipe {
  height: calc(100vh - 100px);
  text-align: center;
  .van-swipe-item {
    position: relative;
    position: relative;
    display: flex;
    align-content: center;
    overflow: hidden;
    background: black;
    .empty {
      width: 100%;
    }
    video {
      position: relative;
      z-index: 99;
      width: 100%;
    }
    // 显示评论时，将视频缩小至弹出层剩余高度
    .mini {
      height: 40%;
    }
    .info {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 99;
      // background: red;
      color: white;
      padding: 16px;
      .user {
        display: flex;
        align-items: center;
        img {
          width: 46px;
          height: 46px;
          border-radius: 23px;
        }
        .nickname {
          margin-left: 8px;
        }
      }
      .desp {
        padding: 8px 0;
        text-align: left;
        font-size: 14px;
        line-height: 1.2;
        display: flex;
        flex-direction: column;
      }
    }
    .count {
      position: absolute;
      right: 16px;
      bottom: 100px;
      z-index: 99;
      // background: red;
      color: white;
      .item {
        margin-top: 16px;
        display: flex;
        flex-direction: column;
        font-size: 12px;
        text-shadow: 0px 1px 1px black;
      }
    }
  }
}
.comments {
  position: relative;
  & > .head {
    position: sticky;
    top: 0;
    z-index: 99;
    display: flex;
    padding: 16px;
    justify-content: space-between;
    border-bottom: 1px solid #eee;
    background: white;
    .count {
      font-weight: bold;
    }
    .filter {
      display: flex;
      .active {
        font-weight: bold;
      }
      div {
        margin: 0 8px;
      }
    }
  }
  .item {
    display: flex;
    padding: 8px;
    img {
      width: 46px;
      height: 46px;
      border-radius: 23px;
    }
    .right {
      flex: 1;
      padding: 0 8px;
      .head {
        display: flex;
        margin-top: 4px;
        align-items: center;
        justify-content: space-between;
        .left {
          .nickname {
            color: #5c5c5c;
          }
          .time {
            margin-top: 4px;
            font-size: 12px;
            color: gray;
          }
        }
        .liked {
          font-size: 14px;
          color: #919191;
        }
      }
      .content {
        line-height: 1.6;
        padding: 16px 0;
        border-bottom: 0.5px solid #e4e4e4;
      }
    }
  }
}
</style>