<template>
  <div class="head">
    <div class="roomId">房间号：{{ roomId }}</div>
    <div class="time">
      <i class="icon-2"></i> {{ time }}</div>
    <ul class="right clearfix">
      <li class="item" ref="copy" style="opacity: 0;">{{ windowUrl }}</li>
      <li class="item copy" @click="copy">
        <i class="icon icon-16"></i>
        <span>邀请他人</span>
      </li>
      <router-link to="/call" tag="li" class="item">离开房间</router-link>
    </ul>
  </div>
</template>
<script>
export default {
  name: "meetingHead",
  props: {
    time: ""
  },
  data() {
    return {
      roomId: this.$route.query.roomId,
      windowUrl: `https://www.wilddog.com/demo/wilddogvideo/#/login`,
    };
  },
  methods: {
    copy() {
      if (window.getSelection) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        const range = document.createRange();
        range.selectNodeContents(this.$refs.copy);
        sel.addRange(range);
      } else if (document.selection) {
        const textRange = document.body.createTextRange();
        textRange.moveToElementText(this.$refs.copy);
        textRange.select();
      }
      this.$emit("copy");
    }
  }
};

</script>
