<template>
  <div class="meeting">
    <div class="head">
      <div class="roomId">房间号：{{ roomId }}</div>
      <div class="time"><i class="icon-2"></i> {{ time }}</div>
      <ul class="right clearfix">
        <li class="item" ref="copy" style="opacity: 0;">{{ windowUrl }}</li>
        <li class="item copy" @click="copy"><i class="icon icon-16"></i><span>邀请他人</span></li>
        <router-link to="/call" tag="li" class="item">离开房间</router-link>
      </ul>
    </div>
    <ul class="features clearfix">
      <li class="full-item"><i class="icon icon--4" @click="openDocument"></i></li>
      <li class="full-item"><i class="icon icon--3" @click="sorry"></i></li>
      <li class="full-item"><i class="icon icon--7" @click="sorry"></i></li>
      <!-- <li class="full-item"><i class="icon icon-6" @click="sorry"></i></li> -->
    </ul>
    <div class="content">
      <div class="video-box">
        <ul class="inner clearfix">
          <li class="item">
            <video muted autoplay="autoplay" ref="localStream" :controls="isMobile && (isFF || isSafari)"></video>
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
            <video autoplay="autoplay" ref="remoteStream" :controls="isMobile && (isFF || isSafari)"></video>
            <div class="controls">
              <span class="name" ref="name">{{item.attributes.name || 'May'}}</span>
              <div class="wrap clearfix">
                <span class="media" @click="enableAudio"><i class="icon-" :data-stream="index"></i></span>
                <span class="video" @click="enableVideo"><i class="icon-" :data-stream="index"></i></span>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div class="features-others">
        <div class="board" ref="board">
          <div id="canvas"></div>
          <div class="tool">
            <ul class="tool-bar">
              <li class="item" v-for=" item in toolBar" :key="item.type" @click="addToolListener(item)" :class="{ 'current': item.active }"><i class="icon" :class="item.class"></i></li>
              <input ref="Image" type="file" id="Image" accept="image/png,image/gif,image/jpeg">
            </ul>
            <div class="tool-style" :class="{ 'open-style': openStyle }">
              <ul class="stroke-size-div" v-if="isStroke">
                <li class="item stroke-size" v-for="item in strokeWidth" :key="item.style" @click="addSizeListener(item)" :class="{ 'current': item.active }">
                  <i class="icon" :style="{ transform: 'scale(' + item.style + ')' }"></i>
                </li>
              </ul>
              <ul class="font-size-div" v-else>
                <li class="item font-size" v-for="item in fontSize" :key="item.style" :style="{ fontSize: item.style + 'px'} " @click="addSizeListener(item)" :class="{ 'current': item.active }">A</li>
              </ul>
              <ul class="stroke-color-div">
                <i class="line"></i>
                <li v-for="item in strokeColor" :key="item.color" class="item stroke-color" :class="{ 'current': item.active }" :style="{ background: item.color }" @click="addColorListener(item)"></li>
              </ul>
            </div>
          </div>
          <div class="flie-upload" v-show="document.status">
            <ul class="upload-head">
              <li class="head-item" :class="{'current-head': !document.currentTab}" @click="document.currentTab = false">文档</li>
              <li class="head-item" :class="{'current-head': document.currentTab}" @click="document.currentTab = true">音视频</li>
              <li class="head-close" @click="document.status = false"><i class="icon-25"></i></li>
            </ul>
            <div class="upload-content">
              <upload-videos v-show="document.currentTab" :upload-video-data='document.videoFiles' :room-id='roomId' @operateVideoSuccess='operateVideoSuccess' @useVideoSuccess='useVideoSuccess'></upload-videos>
              <v-loading v-show="document.loading" @waitingLoading="waitingLoading"></v-loading>
            </div>
          </div>
          <div class="insert-video" v-show="document.videoFiles.externalInputs.length !== 0">
            <div class="video-header"> <span class="title">{{  document.videoFiles.video.name }} </span>
              <!-- <span class="close"><i class="icon-25"></i></span> -->
            </div>
            <video autoplay="autoplay" ref="insertStream"></video>
            <div class="video-controls">
              <div class="funcs" v-show='document.videoFiles.video.funcsShow'>
                <span class="func pause" @click="controlInsertVideo('pause')" v-show='document.videoFiles.video.play'><i class="icon icon--19"></i></span>
                <span class="func continue" @click="controlInsertVideo('continue')" v-show='!document.videoFiles.video.play'><i class="icon icon--20"></i></span>
                <span class="func replay" @click="controlInsertVideo('replay')"><i class="icon icon--18"></i></span>
                <span class="func stop" @click="controlInsertVideo('stop')"><i class="icon icon--21"></i></span>
              </div>
              <div class="time">
                00:00:00/00:00:00
              </div>
            </div>
          </div>
        </div>
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

import base from "wilddog-video-base";
import room from "wilddog-video-room";
import WildBoard from "wilddog-board";
import dialog from "@/components/Dialog";
import loading from "@/components/Loading";
import uploadVideos from "./uploadVideos";
import { realSysTime } from "@/utils";
import { getList, controlFile } from 'api/uploadVideo';

import { genToken, initImageUpload, uploadClient } from "@/utils/qiniu";
import "@/assets/libs/qiniu.min";
import "@/assets/libs/plupload/js/moxie";
import "@/assets/libs/plupload/js/plupload.full.min.js";
import "@/assets/libs/plupload/js/i18n/zh_CN";
import config from "config";
import './index.scss'

const wilddogVideo = base.wilddogVideo;
wilddogVideo.regService("room", room);

export default {
  name: "meeting",
  components: {
    "v-dialog": dialog,
    'upload-videos': uploadVideos,
    'v-loading': loading
  },
  data() {
    return {
      roomId: "",
      time: "00:00:00",
      windowUrl: null,
      localStream: null,
      participants: [],
      showDialog: false,
      document: {
        status: false,
        loading: false,
        currentTab: false,
        officeFiles: {},
        videoFiles: {
          isEmpty: true,
          list: [],
          externalInputs: [],
          video: {
            name: '',
            play: true,
            funcsShow: false
          }
        }
      },
      isMobile: /Mobile/i.test(navigator.userAgent),
      isFF: navigator.userAgent.indexOf("Firefox") > -1,
      isSafari: navigator.userAgent.indexOf("Safari") > -1 && navigator.userAgent.indexOf("Chrome") < 1,
      dialogOption: {
        width: "300px",
        height: "200px",
        title: "温馨提示",
        text: "复制成功!!!",
        cancelButtonText: "取消",
        confirmButtonText: "确定"
      },
      users: null,
      strokeColor: [{
          color: "rgb(252,61,57)",
          active: true
        },
        {
          color: "rgb(252,148,39)",
          active: false
        },
        {
          color: "rgb(81,214,106)",
          active: false
        },
        {
          color: "rgb(21,128,249)",
          active: false
        },
        {
          color: "rgb(202,202,202)",
          active: false
        },
        {
          color: "rgb(10,10,10)",
          active: false
        }
      ],
      strokeWidth: [{
          style: 0.2,
          width: 2,
          active: true
        },
        {
          style: 0.4,
          width: 6,
          active: false
        },
        {
          style: 0.6,
          width: 10,
          active: false
        }
      ],
      fontSize: [{
          style: 18,
          width: 18,
          active: true
        },
        {
          style: 23,
          width: 28,
          active: false
        },
        {
          style: 28,
          width: 40,
          active: false
        }
      ],
      toolBar: [{
          active: false,
          type: "Pen",
          color: "rgb(252,61,57)",
          size: 18,
          class: "icon-09",
          width: 2
        },
        {
          active: false,
          type: "Line",
          color: "rgb(252,61,57)",
          size: 18,
          class: "icon-line",
          width: 2
        },
        {
          active: false,
          type: "Rect",
          color: "rgb(252,61,57)",
          size: 18,
          class: "icon-circle",
          width: 2
        },
        {
          active: false,
          type: "Circle",
          color: "rgb(252,61,57)",
          size: 18,
          class: "icon-rect",
          width: 2
        },
        {
          active: false,
          type: "Image",
          color: "rgb(252,61,57)",
          size: 18,
          class: "icon-photo-1",
          width: 2
        },
        {
          active: false,
          type: "IText",
          color: "rgb(252,61,57)",
          size: 18,
          class: "icon-text",
          width: 2
        },
        {
          active: false,
          type: "Undo",
          color: "rgb(252,61,57)",
          size: 18,
          class: "icon--6",
          width: 2
        },
        {
          active: false,
          type: "Clear",
          color: "rgb(252,61,57)",
          size: 18,
          class: "icon-30",
          width: 2
        }
      ],
      isStroke: false,
      openStyle: false,
      currentTool: {
        type: "",
        color: "rgb(252,61,57)",
        size: 18,
        width: 2
      },
      chatData: null,
      messageVal: "",
      roomInstance: null
    };
  },
  created() {
    this.getVideoList()

    let roomName = location.hash.split("?")[1];
    roomName = roomName.replace("roomId=", "").split("&")[0];
    this.roomId = decodeURI(roomName);

    this.windowUrl = `https://www.wilddog.com/demo/wilddogvideo/#/login`;
    this.userRef = wilddog.sync().ref(`room/${this.roomId}/users/`);
    this.boardRef = wilddog.sync().ref(`room/${this.roomId}/board`);
    this.chatRef = wilddog.sync().ref(`room/${this.roomId}/chat`);
    this.documentRef = wilddog.sync().ref(`room/${this.roomId}/document`);

    if (!wilddogVideo.appId) {
      wilddogVideo.initialize({
        appId: config.wd.videoAppid,
        token: this.token
      });
    }

    this.roomInstance = wilddogVideo.room(this.roomId);
    // this.roomInstance.connect();

    //创建一个同时有音频和视频的媒体流
    wilddogVideo
      .createLocalStream({
        captureAudio: false,
        captureVideo: true,
        dimension: this.dimension,
        maxFPS: 15
      })
      .then(localStream => {
        this.localStream = localStream;
        this.localStream.setAttributes({ 'isExternalInput': false, 'name': this.name });
        this.localStream.attach(this.$refs.localStream);
      });

    this.$nextTick(() => {
      let boardConfig = {
        width: this.$refs.board.clientWidth,
        height: this.$refs.board.clientHeight,
        write: true
      };

      this.wdBoard = new WildBoard(
        this.boardRef,
        this.uid,
        "canvas",
        boardConfig
      );

      this.wdBoard.on("objectSelected", this.objectSelectedHandler);
      this.wdBoard.on("objectDeselected", this.objectDeselectedHandler);

      this.qiniuToken = genToken({
        ACCESS_KEY: config.qiniu.ACCESS_KEY,
        SECRET_KEY: config.qiniu.SECRET_KEY,
        BUCKET_NAME: config.qiniu.BUCKET_NAME
      });

      initImageUpload(this.wdBoard, this.qiniuToken);
    });

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

    //获取office列表
    this.documentRef.on("value", snapshot => {
      const data = snapshot.val() && snapshot.val().officeFiles;
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const element = data[key];
          if (element.date + 86400000 < Date.now()) {
            this.documentRef.child(`officeFiles/${element}`).remove();
            return;
          }
        }
      }
      this.document.officeFiles = data;
    });

  },
  mounted() {
    window.onresize = () => {
      this.wdBoard.setOption({
        width: this.$refs.board.clientWidth,
        height: this.$refs.board.clientHeight,
        write: true
      });
    };

    this.updateTime();
    this.addUid();
    const uploader = uploadClient();

    uploader.bind("FileUploaded", (uploader, file, result) => {
      var status = JSON.parse(result.response).status;
      var results = JSON.parse(result.response).results;
      if (status == "success") {
        results.date = Date.now();
        this.documentRef
          .child("officeFiles")
          .push(results)
          .then(() => {
            if (results.errors.length == 0) {
              alert("上传成功！");
            } else {
              alert("上传成功！部分页码转码失败！");
            }
          })
          .catch(err => {
            alert("Sync 错误！" + err.message);
          });
      } else {
        alert("上传失败！");
      }
    });
  },
  beforeDestroy() {
    // this.leaveRoom();
  },
  methods: {
    getVideoList() {
      this.document.loading = true
      getList(config.wd.videoAppid, this.uid, this.token).then(response => {
        this.document.loading = false
        let data = response.data
        this.document.videoFiles.list = data
        this.document.videoFiles.isEmpty = data.length == 0 ? true : false
      })
    },
    // 复制
    copy(e) {
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
    switchCamera(e) {
      this.roomInstance.switchCamera(this.localStream, this.$refs.localStream);
    },
    enableAudio(e) {
      const dataStream = e.target.attributes["data-stream"];
      const index = dataStream ? dataStream.value : null;
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
      const dataStream = e.target.attributes["data-stream"];
      const index = dataStream ? dataStream.value : null;
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
        .then(() => {
          this.showDialog = false;
        })
        .catch(() => {
          this.showDialog = false;
        });
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

    _addStream(stream) {
      if (stream.attributes.isExternalInput == false) {
        this.participants.push(stream);
        this._displayStreams(this.participants);
      } else {
        this.document.status = false;

        if (this.document.videoFiles.externalInputs.length == 0) {
          this.document.videoFiles.externalInputs.push(stream);
        } else {
          this.document.videoFiles.externalInputs.splice(0, 1, stream);
        }

        //插播流不是自己的，底部的功能栏去掉
        if (this.document.videoFiles.externalInputs[0].streamOwners[0].userId == this.uid) {
          this.document.videoFiles.video.funcsShow = true
        }

        this.$nextTick(() => {
          stream.attach(this.$refs.insertStream)
        });
      }
    },

    _removeStream(stream) {
      this.participants.map((element, index) => {
        if (element.streamId == stream.streamId) {
          this.participants.splice(index, 1);
          this._displayStreams(this.participants);
        }
      });

      if (this.document.videoFiles.externalInputs.length !== 0 && stream.streamId == this.document.videoFiles.externalInputs[0].streamId) {
        this.document.videoFiles.externalInputs = []

      }

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
              snapshot.val() > date ?
              realSysTime(date) :
              realSysTime(snapshot.val());
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
        console.log(e);
      }
      this.removeUid();
      this.userRef.once("value", snapshot => {
        const data = snapshot.val();
        if (!data)
          wilddog
          .sync()
          .ref(`room/${this.roomId}`)
          .remove();
      });
    },
    addToolListener(tool) {
      if (tool.type == "Undo") {
        this.wdBoard.undo();
        return false;
      }
      if (tool.type == "Image") {
        return false;
      }
      if (tool.type == "Clear") {
        const selectedObject = this.wdBoard.getActiveObject();
        if (selectedObject) {
          selectedObject.removeFromCanvas();
          return false;
        }
        this.dialogOption.text = "确定清空全部内容？";
        this.showDialog = true;
        this.$refs.dialog
          .confirm()
          .then(() => {
            this.showDialog = false;
            this.wdBoard.clearPage(this.wdBoard.currentPage());
          })
          .catch(() => {
            this.showDialog = false;
          });
        return false;
      }
      this.currentTool.type = tool.type;
      this.currentTool.color = tool.color;
      this.currentTool.width = tool.width;
      this.currentTool.size = tool.size;
      // 取消所有选择
      this.toolBar.map(e => {
        if (e.active != tool.active) e.active = false;
      });
      //显示之前的选择颜色
      this.strokeColor.map(
        e => (e.active = e.color == tool.color ? true : false)
      );
      //显示之前的大小
      if (this.isStroke) {
        this.strokeWidth.map(
          e => (e.active = e.width == tool.width ? true : false)
        );
      } else {
        this.fontSize.map(e => (e.active = e.size == tool.size ? true : false));
      }
      //是否展示
      this.openStyle = tool.active ? false : true;
      this.setTool(tool);
    },
    //选择颜色
    addColorListener(tool) {
      this.strokeColor.map(e => {
        if (e.active != tool.active) e.active = false;
      });
      this.toolBar = this.toolBar.map(e => {
        if (e.type == this.currentTool.type) e.color = tool.color;
        return e;
      });
      this.setTool(tool);
    },
    // 选择大小
    addSizeListener(tool) {
      if (this.isStroke) {
        this.currentTool.width = tool.width;
        this.strokeWidth.map(e => {
          if (e.active != tool.active) e.active = false;
        });
        this.toolBar = this.toolBar.map(e => {
          if (e.type == this.currentTool.type) e.width = tool.width;
          return e;
        });
      } else {
        this.currentTool.size = tool.width;
        this.fontSize.map(e => {
          if (e.active != tool.active) e.active = false;
        });
        this.toolBar = this.toolBar.map(e => {
          if (e.type == this.currentTool.type) e.size = tool.size;
          return e;
        });
      }
      this.setTool(tool);
    },
    setTool(tool) {
      if (tool.active) {
        tool.active = false;
        this.wdBoard.setTool("Default", {});
      } else {
        const object = this.wdBoard.getActiveObject();
        tool.active = true;
        this.currentTool.color = tool.color || "red";
        let options = null;
        if (this.currentTool.type == "IText") {
          this.isStroke = false;
          options = {
            fill: this.currentTool.color,
            fontSize: this.currentTool.size
          };
        } else {
          this.isStroke = true;
          options = {
            stroke: this.currentTool.color,
            strokeWidth: this.currentTool.width,
            fill: "rgba(0,0,0,0)"
          };
        }
        if (!object) {
          this.wdBoard.setTool(this.currentTool.type, options);
        } else {
          object.updateOptions(options);
        }
      }
    },
    objectSelectedHandler(object) {
      if (object.type() === "Image") return;
      let type = object.type() == "Path" ? "Pen" : object.type();
      this.toolBar.map(e => {
        if (e.type == type) this.addToolListener(e);
      });
    },
    objectDeselectedHandler(object) {
      this.toolBar.map(e => ((e.active = false), (this.openStyle = false)));
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
    delOfficeFile(type, key) {
      this.documentRef.child(`${type == 'office' ? 'officeFiles' : 'videoFiles'}/${key}`).remove();
    },
    operateVideoSuccess() {
      this.getVideoList()
    },
    useVideoSuccess() {
      this.document.status = false
    },
    openDocument() {
      this.document.status = true;
    },
    controlInsertVideo() {
      const arg = arguments[0]
      controlFile(config.wd.videoAppid, this.roomId, arg, this.document.videoFiles.externalInputs[0].streamId, this.token).then(response => {
        let data = response.data
        switch (arg) {
          case 'stop':
            this.document.videoFiles.externalInputs = []
            break;
          case 'pause':
            this.document.videoFiles.video.play = false
            break;
          case 'continue':
            this.document.videoFiles.video.play = true
          default:
            break;
        }
      })
    },
    waitingLoading() {

    },
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
          this.roomInstance.subscribe(stream, err => {
            if (err == null) {
              console.log("subscribe success");
            }
          });
        });

        this.roomInstance.on("stream_received", stream => {
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


</style>
