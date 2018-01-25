<template>
  <div class="call">
    <div class="list clearfix" v-if='status.list'>
      <div class="left">
        <div class="heading">
          <img :src="url" alt="" class="url">
          <span class="nickname">{{name}}</span>
          <span class="icon icon--9" @click='showSelf'></span>
          <div class="select-dimension-mobile">
            <div class="dimension-show" @click.stop='showSelectDimension'>
              <span class="text">分辨率：</span><span class="dimension-value">{{dimension}}<span class="icon icon--11"></span></span>
            </div>
            <ul v-show='selectDimensionShow' class="selectDimensionShow">
              <li v-for='value in dropParams' @click.stop='selectDimension(value)' :key="value">{{value}}</li>
            </ul>
          </div>
          <select-room v-show='module.roomSelected' :user-ref='userRef' class="join-room-mobile"></select-room>
        </div>
        <div :class="[{'selected': module.roomSelected},'join-room']" @click='joinRoom'>
          <span class="icon icon-5"></span>
          <span class="text">加入多人房间</span>
        </div>
        <ul class="user-list">
          <li v-for="(item,index) in userItem" :key='item.uid' @click='showInvited(item,index)' :class="{'current':currentIndex==index}">
            <img :src="item.faceurl ? item.faceurl.replace('http://','https://') : item.faceurl" alt="" class="url"><span class="nickname">{{item.nickname}}</span>
            <span class="invited-mobile" @click="invite"></span>
          </li>
        </ul>
      </div>
      <div class="right">
        <div class="self text-center" v-show='module.self'>
          <img :src="url" alt="" class="self-url">
          <span class="self-name">{{name}}</span>
          <span class="self-uid">UID:{{uid}}</span>
          <div class="select-dimension">
            <div class="dimension-show" @click.stop='showSelectDimension'>
              <span class="text">分辨率：</span><span class="dimension-value">{{dimension}}<span class="icon icon--11"></span></span>
            </div>
            <ul v-show='selectDimensionShow' class="selectDimensionShow">
              <li v-for='value in dropParams' @click.stop='selectDimension(value)' :key="value">{{value}}</li>
            </ul>
          </div>
          <button class="btn org-btn" @click='logout'>退出登录</button>
        </div>
        <select-room v-show='module.roomSelected' :user-ref='userRef'></select-room>
        <div class="others text-center" v-show='module.others'>
          <img :src="invitedInfo.url" alt="" class="self-url">
          <span class="self-name">{{invitedInfo.name}}</span>
          <span class="self-uid">UID:{{invitedInfo.uid}}</span>
          <button class="btn org-btn" @click='invite'>发起视频通话</button>
        </div>
        <div class="version">V <span>{{appVersion}}</span> </div>
      </div>
    </div>
    <!--邀请别人-->
    <Invite v-if='status.invite' :invited-info='invitedInfo' :err='err' :outgoing-conversation='outgoingConversation' @cancleConversation='cancleConversation' @streamReceived='streamReceived' @errOutgoingConversation='errOutgoingConversation'></Invite>
    <!--别人邀请你-->
    <Invited v-if='status.invited' :incoming-conversation='incomingConversation' :invite-info='inviteInfo' @rejectConversation='rejectConversation' @acceptConversation='acceptConversation' @errIncomingConversation='errIncomingConversation'></Invited>
    <!--真正的通话-->
    <!-- <Conversation v-if='status.conversation' :local-stream='localStream' :remote-stream='remoteStream'></Conversation> -->
    <div class="conversation" v-if='status.conversation' :class="{'fullscreen':!fullscreenStyle}" ref="conversation">
      <div class="switchStream" @click='switchStream'></div>
      <video autoplay='autoplay' ref='localStream' muted="" id="localStream" :class="[videoshow ? 'small' : 'big']" :controls="isMobile && (isFF || isSafari)"></video>
      <video autoplay ref='remoteStream' id="remoteStream" :class="[videoshow ? 'big' : 'small']" :controls="isMobile && (isFF || isSafari)"></video>
      <div class="show">
        <div class="name">{{isCaller ? invitedInfo.name || name : inviteInfo.nickname || name}}</div>
        <div class="time">{{conversationTime}}</div>
      </div>
      <div class="funcs">
        <div class="func">
          <div class="item" @click="enableAudio">
            <span class="icon icon--2 icon1"></span>
            <div class="text">音频开关</div>
          </div>
          <!-- <div class="item" @click="enableMuted">
            <span class="icon icon-11 icon2"></span>
            <div class="text">扬声器</div>
          </div> -->
          <div class="item" @click="enableVideo">
            <span class="icon icon-3 icon3"></span>
            <div class="text">视频开关</div>
          </div>
          <!-- <div class="item" @click="switchCamera">
            <span class="icon icon--10 icon4"></span>
            <div class="text">切换摄像头</div>
          </div> -->
          <div class="item" @click="fullscreen">
            <span class="icon icon-24 icon5"></span>
            <div class="text">全屏显示</div>
          </div>
        </div>
        <div class="hangUp" @click='hangUpCurConversation'>
          <img src="../../assets/images/refuse.png" alt="" width="40">
          <div>挂断</div>
        </div>
      </div>
    </div>
    <v-dialog v-show="showDialog" :dialog-option="dialogOption" ref="dialog"></v-dialog>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import { realSysTime } from "utils/index";
import selectRoom from "./selectRoom";
import { Invite, Invited } from "views/status";
import dialog from "@/components/Dialog";
import config from 'config';
import appInfo from '../../../package';

export default {
  name: "call",
  data() {
    return {
      appVersion: appInfo.version,
      userList: {},
      selectDimensionShow: false,
      currentIndex: null,
      callInstance: null,
      localStream: null,
      remoteStream: null,
      incomingConversation: null,
      outgoingConversation: null,
      currentConversation: null,
      conversationTime: "",
      timer: null,
      showDialog: false,
      videoshow: true,
      isCaller: true,
      err: "",
      fullscreenStyle: true,
      inviteInfo: {},
      userRef: wilddog.sync().ref("/users"),
      isMobile: /Mobile/i.test(navigator.userAgent),
      isFF: navigator.userAgent.indexOf("Firefox") > -1,
      isSafari: navigator.userAgent.indexOf("Safari") > -1 && navigator.userAgent.indexOf("Chrome") < 1,
      dropParams: ["120p", "240p", "360p", "480p", "720p", "1080p"],
      invitedInfo: {
        url: "",
        name: "",
        uid: ""
      },
      status: {
        list: true,
        invite: false,
        invited: false,
        conversation: false
      },
      module: {
        self: true,
        roomSelected: false,
        others: false
      },
      dialogOption: {
        text: "确定要退出登录吗？",
        cancelButtonText: "取消",
        confirmButtonText: "确定"
      }
    };
  },
  created() {
    wilddogVideo.initialize({ appId: config.wd.videoAppid, token: this.token });
    this.callInstance = wilddogVideo.call();
  },
  mounted() {
    this.userRef.child(this.uid).set({
      faceurl: this.url,
      nickname: this.name
    });
    //离线就移除
    this.userRef.child(this.uid).onDisconnect().remove();
    this.userRef.on("value", snap => {
      var data = snap.val();
      if (data) {
        delete data[this.uid];
      }
      this.userList = data ? data : {};
    });

    this.$nextTick(() => {
      let right = document.querySelector(".right");
      right.addEventListener("click",e => this.selectDimensionShow = false, false);
    });
  },
  beforeDestroy() {
    if(this.localStream) {
      this.localStream.close();
    }
  },
  methods: {
    //显示列表的具体信息
    showInvited: function(user, index) {
      this.module = {
        self: false,
        others: true,
        roomSelected: false
      };
      this.invitedInfo.url = user.faceurl ? user.faceurl : "https://img.wdstatic.cn/imdemo/1.png";
      this.invitedInfo.name = user.nickname ? user.nickname : "";
      this.invitedInfo.uid = user.uid ? user.uid : "";
      this.currentIndex = index;
    },
    //显示自己
    showSelf: function() {
      this.module = {
        self: true,
        others: false,
        roomSelected: false
      };
    },
    //room
    joinRoom: function() {
      this.module = {
        self: false,
        others: false,
        roomSelected: true
      };
      this.currentIndex = null;
    },
    showSelectDimension: function() {
      this.selectDimensionShow = true;
    },
    selectDimension: function(value) {
      this.$store.commit("SET_DIMENSION", value);
      // this.dimension = value;
      this.selectDimensionShow = false;
    },
    invite: function() {
      const _self = this;
      this.status = {
        list: false,
        invite: true,
        invited: false,
        conversation: false
      };
      //调用摄像头
      wilddogVideo.createLocalStream({
          captureVideo: true,
          captureAudio: true,
          dimension: this.dimension,
          maxFPs: 15
        })
        .then(function(stream) {
          // console.log(stream)
          _self.localStream = stream;
          //创建本地会话
          _self.outgoingConversation = _self.callInstance.call(
            _self.invitedInfo.uid,
            _self.localStream
          );
        })
        .catch(function(err) {
          _self.err = "没有找到本地设备！";
          setTimeout(() => {
            _self.status = {
              list: true,
              invite: false,
              invited: false,
              conversation: false
            };
            _self.outgoingConversation = null;
          }, 1000);
        });
    },
    logout: function() {
      this.showDialog = true;
      this.$refs.dialog
        .confirm()
        .then(() => {
          this.showDialog = false;
          this.userRef.child(this.uid).remove();
          this.$store.dispatch("LogOut").then(() => {
            location.reload();
          });
        })
        .catch(() => {
          this.showDialog = false;
        });
    },
    //通话未完成，直接挂断了
    cancleConversation: function() {
      this.localStream.close();
      this.outgoingConversation.close();
      this.outgoingConversation = null;
      this.status = {
        list: true,
        invite: false,
        invited: false,
        conversation: false
      };
    },
    rejectConversation: function() {
      this.incomingConversation = null;
      this.status = {
        list: true,
        invite: false,
        invited: false,
        conversation: false
      };
    },
    //自己是被邀请者，收到请求
    acceptConversation: function(conversation) {
      //调用摄像头
      wilddogVideo
        .createLocalStream({
          captureVideo: true,
          captureAudio: true,
          dimension: this.dimension,
          maxFPs: 15
        })
        .then(stream => {
          // console.log(stream)
          this.localStream = stream;
          conversation.accept(this.localStream).then(() => {
            this.status = {
              list: false,
              invite: false,
              invited: false,
              conversation: true
            };
            this.currentConversation = conversation;
            const currTime = Date.now();
            this.timer = setInterval(() => {
              this.conversationTime = realSysTime(currTime);
            }, 1000);

            // this.invitedInfo.name = this.userList[conversation.remoteUid].nickname;
            this.invitedInfo.name = this.name;
            this.$nextTick(() => {
              this.localStream.attach(this.$refs.localStream);
              this.currentConversation.on("stream_received", stream => {
                // console.log(stream)
                this.remoteStream = stream;
                this.remoteStream.attach(this.$refs.remoteStream);
                this.incomingConversation = null;
              });
            });
          });
        })
        .catch(function(err) {
          console.error(err);
        });
      //接受后回调
    },
    //自己是发起者，对端接受方接受
    streamReceived: function(stream) {
      this.remoteStream = stream;
      this.status = {
        list: false,
        invite: false,
        invited: false,
        conversation: true
      };
      this.currentConversation = this.outgoingConversation;
      const currTime = Date.now();

      this.timer = setInterval(() => {
        this.conversationTime = realSysTime(currTime);
      }, 1000);

      this.$nextTick(() => {
        this.localStream.attach(this.$refs.localStream);
        this.remoteStream.attach(this.$refs.remoteStream);
      });
    },
    hangUpCurConversation: function() {
      //挂断
      clearInterval(this.timer);
      if (this.fullscreenStyle == false) {
        this.exitFullscreen();
      }
      this.conversationTime = "";
      this.currentConversation.close();
      this.currentConversation = null;
      this.localStream.close();
      this.remoteStream.close();
      this.localStream.detach(this.$refs.localStream);
      this.remoteStream.detach(this.$refs.remoteStream);
      this.status = {
        list: true,
        invite: false,
        invited: false,
        conversation: false
      };
    },
    errOutgoingConversation: function() {
      setTimeout(() => {
        this.status = {
          list: true,
          invite: false,
          invited: false,
          conversation: false
        };
        this.outgoingConversation = null;
      }, 3000);
    },
    errIncomingConversation: function() {
      setTimeout(() => {
        this.status = {
          list: true,
          invite: false,
          invited: false,
          conversation: false
        };
        this.incomingConversation = null;
      }, 3000);
    },
    //按钮控制部分
    // switchCamera(e) {
    //   this.toggleIcon(e);
    //   // this.roomInstance.switchCamera(this.localStream, this.$refs.localStream);
    // },
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
    // enableMuted(e) {
    //   this.toggleIcon(e);
    // },
    fullscreen(e) {
      var fullscreenElement =
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement;
      this.fullscreenStyle = this.toggleIcon(e);
      if (fullscreenElement) {
        this.exitFullscreen();
      } else {
        this.launchFullscreen(this.$refs.conversation);
      }
    },
    toggleIcon(e) {
      if (e.target.parentElement.className.indexOf("current") == -1) {
        e.target.parentElement.className += " current";
        return false;
      } else {
        e.target.parentElement.className = e.target.parentElement.className.replace(
          "current",
          ""
        );
        return true;
      }
    },
    launchFullscreen(e) {
      if (e.requestFullscreen) {
        e.requestFullscreen();
      } else if (e.mozRequestFullScreen) {
        e.mozRequestFullScreen();
      } else if (e.msRequestFullscreen) {
        e.msRequestFullscreen();
      } else if (e.webkitRequestFullscreen) {
        e.webkitRequestFullScreen();
      }
    },
    exitFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    },
    switchStream() {
      this.videoshow = !this.videoshow;
      this.isCaller = !this.isCaller;


    }
  },
  watch: {
    currentConversation: function(conversation) {
      var _self = this;
      if (conversation !== null) {
        //通话过程中，对端挂掉通话
        _self.isCaller = _self.currentConversation.isCaller
        conversation.on("closed", () => {
          _self.hangUpCurConversation();
        });

        //通话过程中，peer断掉导致的错误
        conversation.on("error", error => {
          switch (error.code) {
            case 41007:
              console.log("建立完视频通话后，由于网络或其他原因导致的异常中断");
              _self.hangUpCurConversation();
              break;
          }
        });
      }
    },
    callInstance: function(curCallInstance, beforeCallInstance) {
      var _self = this;
      curCallInstance.on("called", conversation => {
        _self.incomingConversation = conversation;
        _self.inviteInfo = _self.userList[conversation.remoteUid];
        _self.status = {
          list: false,
          invite: false,
          invited: true,
          conversation: false
        };
      });
    }
  },
  components: {
    selectRoom,
    Invite,
    Invited,
    "v-dialog": dialog
    // Conversation
  },
  computed: {
    ...mapGetters(["name", "url", "uid", "token", "dimension"]),
    userItem: function() {
      return Object.keys(this.userList)
        .map(e => {
          if(this.userList[e].faceurl) {
            this.userList[e].uid = e;
            return this.userList[e];
          } else {
            return {
              nickname: '测试数据',
              faceurl: 'https://img.wdstatic.cn/imdemo/1.png',
              uid: e
            }
          }
        })
        .sort((a, b) => a.nickname.toUpperCase() < b.nickname.toUpperCase() ? -1 : 1 );
    }
  }
};

</script>
<style rel="stylesheet/scss" lang="scss">
.call {
  width: 100%;
  height: 100vh;
  position: relative;
  background-color: rgb(233, 237, 243);
  .list {
    width: 1000px; // height: 100%;
    height: 800px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: row;
    border-radius: 10px;
    >.left {
      max-width: 320px;
      background: #3d424e;
      flex: 3;
      overflow: hidden;
      border-radius: 8px 0 0 8px;
      user-select: none;
      img.url {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        float: left;
      }
      .nickname {
        color: #fff;
        float: left;
        line-height: 1;
        margin-top: 10px;
        font-size: 14px;
        margin-left: 8px;
      }
      .heading {
        height: 60px;
        line-height: 60px;
        padding-left: 10px;
        padding-top: 15px;
        .url {
          width: 44px;
          height: 44px;
          margin-top: -8px;
        }
        .icon {
          float: right;
          position: relative;
          top: -13px;
          font-size: 22px;
          color: #fff;
          cursor: pointer;
          margin-right: 20px;
        }
        .nickname {
          font-size: 18px;
          margin-top: 7px;
        }
        .icon--9 {
          &:hover {
            color: #d5d5d5;
          }
        }
        .select-dimension-mobile,.join-room-mobile{
          display: none;
        }
      }
      .join-room {
        height: 60px;
        line-height: 60px;
        padding-left: 14px;
        color: #fff;
        font-size: 13px;
        cursor: pointer;
        border-top: 1px solid #4a4f63;
        border-bottom: 1px solid #4a4f63;
        transition: all 0.2s;
        &:hover {
          background: #4c5166;
        }
        &.selected {
          background: #4c5166;
        }
        .icon {
          font-size: 18px;
        }
        .text {
          margin-left: 10px;
          font-size: 14px;
          position: relative;
          top: -2px;
        }
      }
      .user-list {
        overflow-y: auto;
        height: calc(100% - 120px);
        &::-webkit-scrollbar {
          width: 5px;
          height: 100%;
          border-radius: 5px;
          background-color: transparent;
        }
        &::-webkit-scrollbar-thumb {
          min-height: 5px;
          min-width: 5px;
          border: 1px solid rgba(247, 250, 255, 0.3);
          border-radius: 5px;
          background-color: rgba(247, 250, 255, 0.3);
        }
        li {
          height: 60px;
          line-height: 60px;
          padding-left: 10px;
          padding-top: 15px;
          cursor: pointer;
          transition: all 0.2s;
          &:hover {
            background: #4c5166;
          }
          .nickname {
            margin-top: 7px;
          }
        }
        .current {
          background: #4c5166;
        }
      }
    }
    >.right {
      flex: 7;
      background: url("../../assets/images/bgCall.png") no-repeat;
      background-size: cover;
      background-position-x: right; // max-height: 500px; // padding-top: 80px;
      position: relative;
      .self-url {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: block;
        margin: 0 auto;
        margin-top: 180px;
      }
      .self-name {
        font-size: 18px;
        color: #333;
        display: block;
        margin-top: 15px;
      }
      .self-uid {
        font-size: 14px;
        color: #666;
        display: block;
        margin-top: 10px;
      }
      .btn {
        position: absolute;
        font-size: 16px;
        line-height: 1;
        width: 220px;
        height: 36px;
        border-radius: 20px;
        left: 50%;
        transform: translateX(-50%);
        box-shadow: 0px 3px 10px 0px #eb734b;
      }
      .self,
      .others {
        .btn {
          top: 420px;
        }
      }
      .self {
        .select-dimension {
          width: 240px;
          margin: 0 auto;
          font-size: 14px;
          margin-top: 40px;
          position: relative;
          z-index: 100;
          .dimension-show {
            cursor: pointer;
            .text {
              color: #333;
            }
            .dimension-value {
              width: 60%;
              display: inline-block;
              text-align: left;
              height: 34px;
              line-height: 34px;
              padding-left: 18px;
              background: #eaf2ff;
              border-radius: 4px;
              position: relative;
              .icon {
                float: right;
                color: #666;
                margin-top: 2px;
                margin-right: 10px;
                font-size: 10px;
              }
            }
          }
          ul {
            width: 60%;
            float: right;
            background: #fafcff;
            box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.1);
            border-radius: 3px;
            margin-right: 20px;
            text-align: left;
            li {
              height: 34px;
              line-height: 34px;
              padding-left: 18px;
              color: #666;
              cursor: pointer;
              &:hover {
                background: #eaf2ff;
              }
            }
          }
        }
      }
      .version {
        position: absolute;
        left: 50%;
        bottom: 30px;
        transform: translateX(-50%);
        color: rgb(189, 189, 189);
      }
    }
  }
  .conversation {
    width: 1000px; // height: 100%;
    height: 800px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    border-radius: 8px;
    overflow: hidden;
    background-color: #000;
    .switchStream {
      position: absolute;
      width: 220px;
      left: 10px;
      top: 10px;
      border-radius: 6px;
      z-index: 200;
      cursor: pointer;
      height: 165px;
    }
    .small {
      position: absolute;
      width: 220px;
      left: 10px;
      top: 10px;
      border-radius: 6px;
      z-index: 100;
    }
    .big {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: cover;
      left: 0;
      top: 0;
    }
    .show {
      text-align: center;
      color: #fff;
      margin-top: 20px;
      font-size: 14px;
      position: relative;
      z-index: 100;
      .time {
        margin-top: 10px;
        font-size: 11px;
      }
    }
    .funcs {
      position: absolute;
      bottom: 20px;
      text-align: center;
      left: 50%;
      transform: translateX(-50%);
      color: #fff;
      font-size: 13px;
      z-index: 100;
      user-select: none;
      .func {
        margin-bottom: 40px;
        .item {
          display: inline-block;
          margin-left: 10px;
          margin-right: 10px;
          font-size: 10px;
          letter-spacing: 1px;
          cursor: pointer;
          .icon1 {
            font-size: 40px;
          }
          .icon3,
          .icon2 {
            font-size: 26px;
            position: relative;
            top: -8px;
          }
          .icon4 {
            font-size: 24px;
            position: relative;
            top: -8px;
          }
          .icon5 {
            font-size: 20px;
            position: relative;
            top: -10px;
          }
        }
        .item.current {
          .icon1 {
            &::before {
              content: "b";
            }
          }
          .icon2 {
            &::before {
              content: "z";
            }
          }
          .icon3 {
            &::before {
              content: "p";
            }
          } // .icon4 {
          //   &::before {
          //     content: "b";
          //   }
          // }
          .icon5 {
            &::before {
              content: "s";
            }
          }
        }
      }
      .hangUp {
        font-size: 12px;
        letter-spacing: 1px;
        cursor: pointer;
        img {
          margin-bottom: 10px;
        }
      }
    }
  }
  .fullscreen {
    width: 100%;
    height: 100%;
  }
}

@media screen and (max-height: 800px) {
  .call {
    padding: 20px 0;
    min-height: 840px;
    .list,
    .conversation {
      margin: 0 auto;
      position: static;
      transform: translate(0, 0);
    }
  }
}

</style>
