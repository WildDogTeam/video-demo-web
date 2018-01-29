<template>
  <div class="room">
    <div class="head">
      <div class="roomId">房间号：{{ roomId }}</div>
      <div class="time"><i class="icon-2"></i> {{ time }}</div>
      <ul class="right clearfix">
        <li class="item" ref="copy" style="opacity: 0;">{{ windowUrl }}</li>
        <li class="item copy" @click="copy"><i class="icon icon-16"></i><span>邀请他人</span></li>
        <router-link to="/call" tag="li" class="item">离开房间</router-link>
      </ul>
    </div>
    <div class="content">
      <ul class="features clearfix">
        <li class="full-item"><i class="icon icon--8" @click="sorry"></i>屏幕共享</li>
        <li class="full-item"><i class="icon icon--7" @click="sorry"></i>云端录制</li>
        <!-- <li class="full-item"><i class="icon icon-6" @click="sorry"></i>插 播</li> -->
      </ul>
      <div class="video-box">
        <ul class="inner clearfix">
          <li class="item">
            <video muted autoplay ref="localStream" :controls="isMobile && (isFF || isSafari)"></video>
            <div class="controls">
              <span class="name">{{ name }}</span>
              <div class="wrap">
                <!-- <span class="translate" @click="switchCamera"><i class="icon-"></i></span> -->
                <span class="media" @click="enableAudio"><i class="icon-"></i></span>
                <span class="video" @click="enableVideo"><i class="icon-"></i></span>
              </div>
            </div>
          </li>
          <li class="item" v-for='(item, index) in participants' :key="item.streamId">
            <video autoplay ref="remoteStream" :controls="isMobile && (isFF || isSafari)"></video>
            <div class="controls">
              <span class="name" ref="name"> {{ item.attributes.name || 'May' }}</span>
              <div class="wrap clearfix">
                <span class="media" @click="enableAudio"><i class="icon-" :data-stream="index"></i></span>
                <span class="video" @click="enableVideo"><i class="icon-" :data-stream="index"></i></span>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <v-dialog v-show="showDialog" :dialog-option="dialogOption" ref="dialog"></v-dialog>
  </div>
</template>
<script>
import base from "wilddog-video-base";
import room from "wilddog-video-room";
import dialog from "@/components/Dialog";
import { realSysTime } from "@/utils";
import { mapGetters } from "vuex";
import config from 'config';

const wilddogVideo = base.wilddogVideo;
wilddogVideo.regService("room", room);

export default {
  name: "room",
  components: {
    "v-dialog": dialog
  },
  data() {
    return {
      roomId: "",
      time: "00:00:00",
      windowUrl: null,
      localStream: null,
      participants: [],
      showDialog: false,
      users: null,
      roomInstance: null,
      isMobile: /Mobile/i.test(navigator.userAgent),
      isFF: navigator.userAgent.indexOf("Firefox") > -1,
      isSafari: navigator.userAgent.indexOf("Safari") > -1 && navigator.userAgent.indexOf("Chrome") < 1,
      dialogOption: {
        width: "300px",
        height: "200px",
        title: "温馨提示",
        text: "复制成功!!!",
        confirmButtonText: "确定"
      }
    };
  },
  created() {
    let roomName = location.hash.split("?")[1];
    roomName = roomName.replace("roomId=", "").split("&")[0];
    this.roomId = decodeURI(roomName);

    this.windowUrl = `https://www.wilddog.com/demo/wilddogvideo/#/login`;
    this.userRef = wilddog.sync().ref(`room/${this.roomId}/users/`);

    if (!wilddogVideo.appId) {
      wilddogVideo.initialize({
        appId: config.wd.videoAppid,
        token: this.token
      });
    }

    this.roomInstance = wilddogVideo.room(this.roomId);
    this.userRef.on("value", snapshot => (this.users = snapshot.val()));

    wilddogVideo.createLocalStream({
      captureAudio: true,
      captureVideo: true,
      dimension: this.dimension,
      maxFPS: 15
    }).then(localStream => {
      this.localStream = localStream;
      this.localStream.setAttributes({ 'name': this.name });
      this.localStream.attach(this.$refs.localStream);
    });
  },
  mounted() {
    window.addEventListener("beforeunload", () => this.leaveRoom());
    this.updateTime();
    this.addUid();
  },
  beforeDestroy() {
    this.leaveRoom();
  },
  methods: {
    // 复制
    copy(e) {
      if (window.getSelection) {
        var sel = window.getSelection();
        sel.removeAllRanges();
        var range = document.createRange();
        range.selectNodeContents(this.$refs.copy);
        sel.addRange(range);
      } else if (document.selection) {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(this.$refs.copy);
        textRange.select();
      }
      try {
        document.execCommand("copy", "false", null);
        this.dialogOption.text = "地址已复制到剪贴板";
        this.showDialog = true;
        this.$refs.dialog
          .confirm()
          .then(() => (this.showDialog = false))
          .catch(() => (this.showDialog = false));
      } catch (err) {
        console.log(err);
      }
    },
    switchCamera(e) {
      this.roomInstance.switchCamera(this.localStream, this.$refs.localStream);
    },
    enableAudio(e) {
      var dataStream = e.target.attributes["data-stream"];
      var index = dataStream ? dataStream.value : null;
      if (this.toggleIcon(e)) {
        if (index) {
          this.participants[index].enableAudio(true);
        } else {
          this.localStream.enableAudio(true);
        }
      } else {
        if (index) {
          this.participants[index].enableAudio(false);
        } else {
          this.localStream.enableAudio(false);
        }
      }
    },
    enableVideo(e) {
      var dataStream = e.target.attributes["data-stream"];
      var index = dataStream ? dataStream.value : null;
      if (this.toggleIcon(e)) {
        if (index) {
          this.participants[index].enableVideo(true);
        } else {
          this.localStream.enableVideo(true);
        }
      } else {
        if (index) {
          this.participants[index].enableVideo(false);
        } else {
          this.localStream.enableVideo(false);
        }
      }
    },
    sorry() {
      this.dialogOption.text = "该功能正在开发中，敬请期待";
      this.showDialog = true;
      this.$refs.dialog
        .confirm()
        .then(() => (this.showDialog = false))
        .catch(() => (this.showDialog = false));
    },
    toggleIcon(e) {
      if (e.target.parentElement.className.indexOf("current") == -1) {
        e.target.parentElement.className += " current";
        return false;
      } else {
        e.target.parentElement.className = e.target.parentElement.className.replace("current", "");
        return true;
      }
    },
    _addStream(stream) {
      this.participants.push(stream);
      this._displayStreams(this.participants);
    },
    _removeStream(stream) {
      this.participants.map((element, index) => {
        if (element.streamId == stream.streamId) {
          this.participants.splice(index, 1);
          this._displayStreams(this.participants);
        }
      });
    },

    _displayStreams(participant) {
      for (let i = 0; i < participant.length; i++) {
        this.$nextTick(() => {
          participant[i].attach(this.$refs.remoteStream[i]);
        });
      }
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
            this.time =
              snapshot.val() > date ? realSysTime(date) : realSysTime(snapshot.val());
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
      if (this.localStream) this.localStream.close();
      try {
        this.roomInstance.disconnect();
      } catch (e) {
        console.log(e)
      }
      this.removeUid();
      this.userRef.once('value', (snapshot) => {
        const data = snapshot.val()
        if (!data) wilddog.sync().ref(`room/${this.roomId}`).remove();
      })
    }
  },
  watch: {
    localStream: function(argument) {
      this.roomInstance.connect();
      this.roomInstance.on("connected", () => {
        console.log("connected success");
        this.roomInstance.publish(this.localStream, () => {
          console.log("publish success");
        });

        this.roomInstance.on("stream_added", stream => {
          console.log("stream_added");
          this.roomInstance.subscribe(stream, err => {
            if (err == null) {
              console.log("subscribe success");
            }
          });
        });

        this.roomInstance.on("stream_received", stream => {
          console.log("stream_received");
          this._addStream(stream);
        });

        this.roomInstance.on("stream_removed", stream => {
          console.log("stream_removed");
          this._removeStream(stream);
        });
      });
    }
  },
  computed: {
    ...mapGetters(["name", "token", "uid", "dimension"])
  }
};

</script>
<style rel="stylesheet/scss" lang="scss">
.room {
  width: 100%;
  min-height: 100%;
  background-color: #1f2229;
  background-image: url("../../assets/images/room-bg.png");
  .head {
    position: relative;
    width: 100%;
    height: 52px;
    padding: 0 23px;
    line-height: 52px;
    color: #ffffff;
    background-color: #2b2f38;
    white-space: nowrap;
    .roomId {
      font-size: 18px;
      float: left;
      max-width: 300px;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .time {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 16px;
      i {
        color: #b20e0e;
      }
    }
    .right {
      color: #ffffff;
      float: right;
      .item {
        float: left;
        cursor: pointer;
        margin-left: 23px;
        font-size: 16px;
        position: relative;
        .icon {
          font-size: 20px;
          position: absolute;
          left: -25px;
          top: 2px;
        }
      }
    }
  }
  .content {
    color: #ffffff;
    width: 1214px;
    min-height: calc(100% - 52px);
    margin: 0 auto;
    .features {
      width: 160px;
      margin: 0px auto;
      padding: 16px 0 36px;
      .full-item {
        width: calc(100%/3);
        text-align: center;
        font-size: 12px;
        &:nth-child(1) {
          float: left;
        }
        &:nth-child(2) {
          float: right;
        }
        .icon {
          display: block;
          margin: 0 auto 5px;
          width: 46px;
          height: 46px;
          line-height: 54px;
          font-size: 28px;
          border-radius: 8px;
          cursor: pointer;
          &:hover {
            background-color: #162f47;
          }
        }
        .icon--7 {
          font-size: 35px;
        }
        .icon-6 {
          margin-left: 4px;
          font-size: 32px;
        }
        .icon-current {
          background-color: #162f47;
        }
      }
    }
    .video-box {
      .inner {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        width: 1214px;
        .item {
          position: relative;
          float: left;
          margin-right: 44px;
          margin-bottom: 44px;
          background-color: #000;
          video {
            width: 375px;
            height: 280px; // background-color: #000;
          }
          &:nth-child(3n) {
            margin-right: 0;
          }
          &:last-child {
            margin-right: 0;
          }
        }
      }
      .controls {
        position: absolute;
        bottom: 0;
        width: 375px;
        height: 48px;
        line-height: 48px;
        background-color: rgba(33, 43, 50, 0.5);
        padding: 0 10px;
        .wrap {
          float: right;
          font-size: 30px;
          height: 48px;
          user-select: none;
          span {
            position: relative;
            float: left;
            height: 100%;
            width: 30px;
            cursor: pointer;
            text-align: center;
          }
          .icon- {
            width: 100%;
            position: absolute;
            top: 0;
            left: 0;
          }
          .translate {
            .icon- {
              font-size: 21px;
              margin-top: 2px;
              &::before {
                content: "q";
              }
            }
          }
          .translate.current {
            .icon- {
              &::before {
                content: "q";
              }
            }
          }
          .media {
            font-size: 36px;
            margin-top: 4px;
            .icon- {
              &::before {
                content: "c";
              }
            }
          }
          .media.current {
            .icon- {
              &::before {
                content: "b";
              }
            }
          }
          .video {
            .icon- {
              font-size: 24px;
              margin-top: 2px;
              &::before {
                content: "o";
              }
            }
          }
          .video.current {
            .icon- {
              &::before {
                content: "p";
              }
            }
          }
        }
      }
    }
  }
}

</style>
