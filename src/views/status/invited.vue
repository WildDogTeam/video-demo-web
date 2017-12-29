<template>
  <div class="invited">
    <img :src="inviteInfo.faceurl" alt="" class="self-url">
    <div class="self-name">{{inviteInfo.nickname}}</div>
    <div class="wait">邀请你进行视频通话</div>
    <div class="tips" v-show='errShow'>{{errMsg}} <span class="icon-25 close" @click='close'></span></div>
    <div class="func">
      <div class="refuse" @click='hangUp'>
        <img src="../../assets/images/refuse.png" alt="" width="40">
        <div>挂断</div>
      </div>
      <div class="receive" @click='accept'>
        <img src="../../assets/images/receive.png" alt="" width="40">
        <div>接听</div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'invited',
  props: {
    incomingConversation: {
      type: Object,
      default: function() {
        return {}
      }
    },
    inviteInfo: {
      type: Object,
      default: function() {
        return {}
      }
    },
  },
  data() {
    return {
      errMsg: '',
      conversation: this.incomingConversation
    }
  },
  created() {
    //通话未建立前，对端取消了通话
    this.conversation.on('closed', () => {
      this.errMsg = '邀请方取消邀请，通话将即将被关闭！'
      this.$emit('errIncomingConversation')
    })

    //自己长时间未接受
    this.conversation.on('error', (error) => {
      switch (error.code) {
        case 41004:
          this.errMsg = '建立视频通话过程中，peerConnection建立失败！'
          this.$emit('errIncomingConversation')
          break;
        default:
          this.errMsg = '您未接受邀请，通话即将被关闭！'
          this.$emit('errIncomingConversation')
      }
    })
  },
  methods: {
    hangUp: function() {
      this.conversation.reject().then(() => {
        this.$emit('rejectConversation')
      })
    },
    accept: function() {
      this.$emit('acceptConversation', this.conversation)
    },
    close: function() {
      this.errShow = false
      this.errMsg == ''
    }
  },
  computed: {
    errShow: function() {
      return this.errMsg == '' ? false : true
    }
  },
  watch: {
    incomingConversation: function(conversation) {
      this.conversation = conversation
    }
  }
};

</script>
<style rel="stylesheet/scss" lang="scss">
.invited {
  background: url('../../assets/images/status/status-1.png') no-repeat;
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
    background: rgba(0, 0, 0, .3);
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
    bottom: 50px;
    left: 50%;
    transform: translatex(-50%);
    cursor: pointer;
    .refuse,
    .receive {
      display: inline-block;
      img {
        margin-bottom: 10px;
      }
    }
    .refuse {
      margin-right: 40px;
    }
    .receive {
      margin-left: 40px;
    }
  }
}

@media screen and (max-height: 800px) {
  .invited {
    margin: 0 auto;
    position: static;
    transform: translate(0, 0);
  }
}
</style>
