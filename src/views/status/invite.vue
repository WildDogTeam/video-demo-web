<template>
  <div class="invite">
    <img :src="invitedInfo.url" alt="" class="self-url">
    <div class="self-name">{{invitedInfo.name}}</div>
    <div class="wait">等待对方接受邀请</div>
    <div class="tips" v-show='errShow'>{{errMsg}} <span class="icon-25 close" @click='close'></span></div>
    <div class="func" @click='hangUp'>
      <img src="../../assets/images/refuse.png" alt="" width="40">
      <div>挂断</div>
    </div>
  </div>
</template>
<script>
export default {
  name: "invite",
  props: {
    invitedInfo: {
      type: Object,
      default: function() {
        return {};
      }
    },
    err: {
      type: String
    },
    outgoingConversation: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
      errMsg: ''
    };
  },

  methods: {
    hangUp: function() {
      this.$emit("cancleConversation");
    },
    update: function() {
      this.outgoingConversation.on("stream_received", stream => {
        this.$emit("streamReceived", stream);
      });

      this.outgoingConversation.on("response", callstatus => {
        switch (callstatus) {
          case "REJECTED":
            this.errMsg = "您邀请的用户已拒绝邀请，请重新邀请！";
            this.$emit("errOutgoingConversation");
            break;
          case "BUSY":
            this.errMsg = "您邀请的用户正忙，请稍后再邀请！";
            this.$emit("errOutgoingConversation");
            break;
          case "TIMEOUT":
            this.errMsg = "您邀请的用户未处理请求，请重新邀请！";
            this.$emit("errOutgoingConversation");
            break;
        }
      });

      this.outgoingConversation.on("error", error => {
        switch (error.code) {
          case 41004:
            this.errMsg = "建立视频通话过程中，由于peerConnection建立失败导致的错误";
            this.$emit("errOutgoingConversation");
            break;
        }
      });
    },
    close: function() {
      this.errShow = false;
      this.errMsg == "";
    }
  },
  computed: {
    errShow: function() {
      return this.errMsg == "" ? false : true;
    }
  },
  watch: {
    outgoingConversation: function() {
      this.update();
    },
    errMsg: function() {
      return this.err;
    }
  }
};
</script>
<style rel="stylesheet/scss" lang="scss">
.invite {
  background: url("../../assets/images/status/status-2.png") no-repeat;
  background-size: 100% 100%;
  width: 1000px; // height: 100%;
  height: 800px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  border-radius: 8px;
  .self-url {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin-top: 60px;
    margin-bottom: 20px;
  }
  .self-name {
    color: #fff;
    font-size: 18px;
    margin-bottom: 15px;
  }
  .wait {
    font-size: 13px;
    color: #fff;
    letter-spacing: 1px;
  }
  .tips {
    font-size: 12px;
    color: #fff;
    letter-spacing: 1px;
    background: rgba(0, 0, 0, 0.3);
    position: absolute;
    left: 50%;
    padding: 4px 30px 5px 10px;
    border-radius: 3px;
    transform: translateX(-50%);
    margin-top: 20px;
    .close {
      font-size: 10px;
      position: absolute;
      right: 6px;
      top: 6px;
      cursor: pointer;
    }
  }
  .func {
    position: absolute;
    color: #fff;
    font-size: 12px;
    margin-top: 100px;
    bottom: 30px;
    left: 50%;
    margin-left: -40px;
    cursor: pointer;
    padding: 20px;
    img {
      margin-bottom: 10px;
    }
  }
}

@media screen and (max-height: 800px) {
  .invite {
    margin: 0 auto;
    position: static;
    transform: translate(0, 0);
  }
}
</style>
