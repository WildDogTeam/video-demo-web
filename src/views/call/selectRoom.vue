<template>
  <div class="select-room text-center">
    <div class="room-id">
      <div class="title">房间号</div>
      <input type="text" v-model="roomId" placeholder="请输入房间号">
    </div>
    <div class="select-mode">
      <div class="title">选择模式</div>
      <div class="normal mode" @click="selectMode('normal')" :class="{'current' : mode=='normal'}">
        <div class="left">
          <div class="item">多人视频模式</div>
          <ul>
            <li><span class="cir"></span><span class="info">多窗格视频聊天</span></li>
            <li><span class="cir"></span><span class="info">常用于社交场景</span></li>
          </ul>
        </div>
        <div class="right">
          <img src="../../assets/images/mode1.png" alt="" height="66">
        </div>
      </div>
      <div class="interact mode" @click="selectMode('interact')" :class="{'current' : mode=='interact'}">
        <div class="left">
          <div class="item">多人互动模式</div>
          <ul>
            <li><span class="cir"></span><span class="info">多人视频</span></li>
            <li><span class="cir"></span><span class="info">白板涂鸦</span></li>
            <li><span class="cir"></span><span class="info">文字聊天</span></li>
          </ul>
        </div>
        <div class="right">
          <img src="../../assets/images/mode2.png" alt="" height="66">
        </div>
      </div>
    </div>
    <button class="btn org-btn" @click="joinRoom">加入多人房间</button>
    <v-dialog v-show="showDialog" :dialog-option="dialogOption" ref="dialog"></v-dialog>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import dialog from "@/components/Dialog";

export default {
  name: "selectRoom",
  props: ['userRef'],
  data() {
    return {
      roomId: "",
      mode: "normal",
      dialogOption: {
        text: "房间号不能为空！",
        confirmButtonText: "确定"
      },
      showDialog: false,
      pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/
    };
  },
  mounted() {
    // console.log(this.myMessage)
  },
  methods: {
    selectMode(mode) {
      this.mode = mode;
    },
    dialogOpen(){
      this.showDialog = true;
        this.$refs.dialog.confirm().then(() => {
          this.showDialog = false;
        })
        .catch(() => {
          this.showDialog = false;
        });
    },
    joinRoom() {
      if (this.roomId) {
        if(!this.pattern.test(this.roomId)){
          this.dialogOption.text = '房间号不能含有特殊字符！'
          this.dialogOpen()
          return false
        }else if(this.roomId.length > 255){
          this.dialogOption.text = '房间号不能大于256个字符'
          this.dialogOpen()
          return false
        }
        let path = `${this.mode == "normal" ? "/room" : "/meeting"}?roomId=${this.roomId}`;
        this.userRef.child(this.uid).remove();
        this.$router.push({
          path: path
        });
      } else {
        this.dialogOption.text = '房间号不能为空！'
        this.dialogOpen()
      }
    }
  },
  computed: {
    ...mapGetters(['dimension', 'uid'])
  },
  components: {
    "v-dialog": dialog
  }
};

</script>
<style rel="stylesheet/scss" lang="scss">
.select-room {
  width: 300px;
  margin: 0 auto;
  .room-id {
    margin-top: 140px;
    input {
      width: 300px;
      padding-left: 0;
      text-align: center;
      outline: none;
      height: 40px;
      font-size: 14px;
    }
    input::-webkit-input-placeholder {
      text-align: center;
    }
  }
  .select-mode {
    margin-top: 30px;
    .mode {
      width: 300px;
      margin: 0 auto;
      box-shadow: 0px 6px 10px rgba(230, 80, 30, 0.2);
      border: 1px solid transparent;
      transition: all 0.2s;
      cursor: pointer;
      border-radius: 3px;
      height: 110px;
      text-align: left;
      padding-top: 20px;
      margin-bottom: 20px;
      &:hover {
        // box-shadow: none;
        border: 1px solid rgb(230, 80, 30);
      }
      > .left {
        float: left;
        width: 50%;
        padding-left: 20px;
        .item {
          color: rgb(102, 102, 102);
          font-size: 14px;
          letter-spacing: 1px;
          margin-bottom: 10px;
        }
        ul {
          text-align: left;
          .info {
            font-size: 11px;
            color: rgb(230, 80, 30);
          }
        }
      }
      > .right {
        float: left;
        width: 50%;
      }
    }
    .current {
      // box-shadow: none;
      border: 1px solid rgb(230, 80, 30);
    }
    .interact {
      margin-bottom: 30px;
    }
  }
  .title {
    color: rgb(102, 102, 102);
    letter-spacing: 1px;
    margin-bottom: 10px;
  }
  .btn {
    top: auto;
  }
  .dialog-content {
    .btn-group {
      .btn {
        position: static;
        transform: none;
        width: 60px;
        box-shadow: none;
        height: 20px;
      }
    }
  }
}
</style>
