<template>
  <div class="meeting">
    <v-head :time="time" @copy="copy"></v-head>
    <ul class="features clearfix">
      <li class="full-item">
        <i class="icon icon--4" @click="openDocument"></i>
      </li>
      <li class="full-item">
        <i class="icon icon--8" @click="sorry"></i>
      </li>
      <li class="full-item">
        <i class="icon icon--7" @click="sorry"></i>
      </li>
      <li class="full-item">
        <i class="icon icon-6" @click="sorry"></i>
      </li>
    </ul>
    <div class="content">
      <v-videoBox :name="name" :token="token" :dimension="dimension" ref="videoBox"></v-videoBox>
      <div class="features-others">
        <v-board ref="board"></v-board>
        <div class="chat">
          <div class="msg">
            <div :class="item.uid == uid ? 'msg-right' : 'msg-left'" v-for="item in chatData" :key="item.uid">
              <div class="name">{{item.author}}</div>
              <div class="info">{{item.message}}</div>
            </div>
          </div>
          <div class="send">
            <input type="text" name="msg" placeholder="老师，请教您一个问题！" v-model="messageVal" @keyup.enter="sendMessage">
            <input type="button" value="发送" @click="sendMessage">
          </div>
        </div>
      </div>
    </div>
    <v-dialog v-show="showDialog" :dialog-option="dialogOption" ref="dialog"></v-dialog>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import { realSysTime } from "@/utils";

import base from "wilddog-video-base";
import room from "wilddog-video-room";
const wilddogVideo = base.wilddogVideo;
wilddogVideo.regService("room", room);

import meetingHead from "./meetingHead";
import videoBox from "./videoBox";
import board from "./board";
import "./index.scss";

import dialog from "@/components/Dialog";

export default {
  name: "meeting",
  components: {
    "v-head": meetingHead,
    "v-videoBox": videoBox,
    "v-board": board,
    "v-dialog": dialog
  },
  data() {
    return {
      roomId: this.$route.query.roomId,
      time: "00:00:00",
      showDialog: false,
      dialogOption: {
        width: "300px",
        height: "200px",
        title: "温馨提示",
        text: "复制成功!!!",
        cancelButtonText: "取消",
        confirmButtonText: "确定"
      },
      users: null,
      chatData: null,
      messageVal: "",
    };
  },
  created() {
    this.userRef = wilddog.sync().ref(`room/${this.roomId}/users/`);
    this.chatRef = wilddog.sync().ref(`room/${this.roomId}/chat`);

    this.userRef.on("value", snapshot => {
      this.users = snapshot.val();
    });

    this.chatRef.on("value", snapshot => {
      if (snapshot.val()) this.chatData = snapshot.val();
      const msg = document.querySelector(".msg");
      this.$nextTick(() => {
        if (msg) msg.scrollTop = msg.childNodes.length * 56;
      });
    });
  },
  mounted() {
    window.addEventListener("beforeunload", event => this.leaveRoom());

    this.updateTime();
    this.addUid();

  },
  beforeDestroy() {
    this.leaveRoom();
  },
  methods: {
    // 复制
    copy(e) {
      try {
        document.execCommand("copy", "false", null);
        this.dialogOption.text = "地址已复制到剪贴板";
        this.showDialog = true;
        this.$refs.dialog
          .confirm()
          .then(() => {
            this.showDialog = false;
          })
          .catch(() => {
            this.showDialog = false;
          });
      } catch (err) {
        console.log(err);
        alert("please press Ctrl/Cmd+C to copy");
      }
    },
    sorry() {
      this.dialogOption.text = "该功能正在开发中，敬请期待";
      this.showDialog = true;
      this.$refs.dialog
        .confirm()
        .then(() => {
          this.showDialog = false;
        })
        .catch(() => {
          this.showDialog = false;
        });
    },
    //房间时间
    updateTime() {
      this.currentServerTime = wilddog.sync().ref(`room/${this.roomId}/time`);
      this.currentServerTime.once("value", snapshot => {
        if (snapshot.val() == null) {
          this.currentServerTime.set(wilddog.sync().ServerValue.TIMESTAMP);
          this.updateTime();
        } else {
          const date = new Date().getTime();
          setInterval(() => {
            this.time = snapshot.val() > date ? realSysTime(date) : realSysTime(snapshot.val());
          }, 1000);
        }
      });
    },
    addUid() {
      this.userRef.child(this.uid).set({ name: this.name });
    },
    removeUid() {
      this.userRef.child(this.uid).remove();
    },

    leaveRoom() {
      window.onresize = null;
      this.$refs.videoBox.$emit("leaveRoom");
      this.removeUid();
      this.userRef.once("value", snapshot => {
        const data = snapshot.val();
        if (!data) {
          wilddog.sync().ref(`room/${this.roomId}`).remove();
        }
      });
    },
    sendMessage() {
      if (this.messageVal !== "") {
        this.chatRef.push({
          author: this.name,
          uid: this.uid,
          message: this.messageVal
        });
        this.messageVal = "";
      }
    },
    openDocument() {
      this.$refs.board.$emit('openDocument');
    }
  },
  computed: {
    ...mapGetters(["name", "token", "uid", "dimension"])
  }
};

</script>
<style rel="stylesheet/scss" lang="scss">

</style>
