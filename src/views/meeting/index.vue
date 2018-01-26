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
      <li class="full-item"><i class="icon icon-6" @click="sorry"></i></li>
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
          <li class="item" v-for='(item, index) in participants' :key="item.id">
            <video autoplay="autoplay" ref="remoteStream" :controls="isMobile && (isFF || isSafari)"></video>
            <div class="controls">
              <!-- <span class="name" ref="name">{{users[item.streamOwners[0].userId].name}}</span> -->
              <span class="name" ref="name">May</span>
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
              <upload-office v-show="!document.currentTab" :upload-office-data="document.officeFiles"></upload-office>
              <!-- <div class="videos" v-else>
                <ul class="content-item">
                  <li class="upload-input">
                    <div class="file-button">上传</div>
                    <input type="file" class="file-input">
                    <div class="file-info"><i></i>支持上传mp3、mp4</div>
                  </li>
                  <li class="upload-title">
                      <div>文件名</div><div>大小</div><div>上传时间</div><div>操作</div>
                  </li>
                </ul>
              </div> -->
              <v-loading v-show="document.loading"></v-loading>
            </div>
          </div>
          <div v-for="(item, key) in currentFile" class="officefile" :key="key">
            <div class="officefile-head">
              <div class="officefile-title">{{item.fileName | splitJoin}}</div>
              <div class="head-close" @click="document.status = false"><i class="icon-25"></i></div>
            </div>
            <div class="officefile-content">
              <iframe v-if="$options.filters.fileType(item.fileName) == 'ppt'" :src="item.urls[0].url" frameborder="0"></iframe>
              <img v-else :src="item.urls[0].url" :alt="item.fileName | splitJoin">
            </div>
            <div class="officefile-footer">《  ||  》</div>
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
import base from "wilddog-video-base";
import room from "wilddog-video-room";
import WildBoard from "wilddog-board";
import dialog from "@/components/Dialog";
import loading from "@/components/Loading";
import uploadOffice from "./uploadOffice";
import { realSysTime } from "@/utils";
import { parseTime } from "@/filters";
import { mapGetters } from "vuex";
import { genToken, initImageUpload, uploadClient } from "@/utils/qiniu";
import "@/assets/libs/qiniu.min";
import "@/assets/libs/plupload/js/moxie";
import "@/assets/libs/plupload/js/plupload.full.min.js";
import config from "config";
const wilddogVideo = base.wilddogVideo;
wilddogVideo.regService("room", room);

export default {
  name: "meeting",
  components: {
    "v-dialog": dialog,
    "v-loading": loading,
    "upload-office": uploadOffice
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
        status: true,
        currentTab: false,
        loading: false,
        officeFiles: {
          isEmpty: true,
          fileLists: {}
        },
        videoFiles: {}
      },
      currentFile: {
        
      },
      isMobile: /Mobile/i.test(navigator.userAgent),
      isFF: navigator.userAgent.indexOf("Firefox") > -1,
      isSafari:
        navigator.userAgent.indexOf("Safari") > -1 &&
        navigator.userAgent.indexOf("Chrome") < 1,
      dialogOption: {
        width: "300px",
        height: "200px",
        title: "温馨提示",
        text: "复制成功!!!",
        cancelButtonText: "取消",
        confirmButtonText: "确定"
      },
      users: null,
      strokeColor: [
        {
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
      strokeWidth: [
        {
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
      fontSize: [
        {
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
      toolBar: [
        {
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
    // console.log(this.$route.query.roomId);
    // let roomName = location.hash.split("?")[1];
    // roomName = roomName.replace("roomId=", "").split("&")[0];
    this.roomId = this.$route.query.roomId;
    this.windowUrl = `https://www.wilddog.com/demo/wilddogvideo/#/login`;
    this.userRef = wilddog.sync().ref(`room/${this.roomId}/users/`);
    this.boardRef = wilddog.sync().ref(`room/${this.roomId}/board`);
    this.chatRef = wilddog.sync().ref(`room/${this.roomId}/chat`);
    this.documentRef = this.userRef.child(`${this.uid}/document`);

    if (!wilddogVideo.appId) {
      wilddogVideo.initialize({
        appId: config.wd.videoAppid,
        token: this.token
      });
    }

    this.roomInstance = wilddogVideo.room(this.roomId);

    // 创建一个同时有音频和视频的媒体流
    wilddogVideo
      .createLocalStream({
        captureAudio: false,
        captureVideo: true,
        dimension: this.dimension,
        maxFPS: 15
      })
      .then(localStream => {
        this.localStream = localStream;
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
  },
  mounted() {
    window.addEventListener("beforeunload", event => this.leaveRoom());
    window.onresize = () => {
      this.wdBoard.setOption({
        width: this.$refs.board.clientWidth,
        height: this.$refs.board.clientHeight,
        write: true
      });
    };

    this.updateTime();
    this.addUid();

    this.openDocument(); //临时调用

    const uploader = uploadClient();

    uploader.bind("FilesAdded", (uploader, files) => {
      this.document.loading = true;
      console.log("FilesAdded!", files);
      uploader.start();
      //每个事件监听函数都会传入一些很有用的参数，
      //我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作
    });

    uploader.bind("FileUploaded", (uploader, file, result) => {
      var status = JSON.parse(result.response).status;
      var results = JSON.parse(result.response).results;
      console.log(results);
      if (status == "success") {
        results.date = Date.now();
        this.documentRef
          .child("officeFiles")
          .push(results)
          .then(() => {
            if (results.errors.length == 0) {
              this.document.loading = false;
              // alert("上传成功！");
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
              snapshot.val() > date
                ? realSysTime(date)
                : realSysTime(snapshot.val());
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
    openDocument() {
      this.document.status = true;
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
        this.document.officeFiles.isEmpty = data ? false : true;
        this.document.officeFiles.fileLists = data;
      });
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
    ...mapGetters(["name", "token", "uid", "dimension"]),
  }
};
</script>

<style rel="stylesheet/scss" lang="scss">
.meeting {
  width: 100%;
  min-height: 100%;
  color: #ffffff;
  background-color: #1f2229;
  background-image: url("../../assets/images/room-bg.png");
  position: relative;
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
  .features {
    position: absolute;
    left: 0;
    top: 50%;
    z-index: 99;
    width: 62px;
    height: 260px;
    transform: translateY(-50%);
    background-color: #3c3c3c;
    border-radius: 0 5px 5px 0;
    .full-item {
      padding: 10px 0;
      height: calc(100%/4);
      text-align: center;
      font-size: 12px;
      .icon {
        display: block;
        margin: 0 auto 5px;
        width: 46px;
        height: 46px;
        line-height: 54px;
        font-size: 30px;
        border-radius: 8px;
        cursor: pointer;
        &:hover {
          background-color: #242424;
        }
      }
      .icon-6 {
        margin-left: 5px;
        font-size: 28px;
      }
      .icon--4 {
        margin-left: 7px;
      }
      .icon-current {
        background-color: #242424;
      }
    }
  }
  .content {
    min-height: calc(100% - 52px);
    .video-box {
      width: 100%;
      height: 180px;
      overflow: hidden;
      .inner {
        height: 100%;
        display: flex; // justify-content: center;
        // align-items: center;
        overflow-x: auto;
        overflow-y: hidden;
        margin: 0 auto;
        background-color: rgba(43, 47, 56, 0.5);
        &::-webkit-scrollbar {
          width: 3px;
          height: 3px;
          background-color: #fcfcfc;
        }
        &::-webkit-scrollbar-thumb {
          min-height: 5px;
          min-width: 5px;
          border-radius: 20px;
          border: 1px solid rgba(247, 250, 255, 0.3);
          border-radius: 5px;
          background-color: rgba(247, 250, 255, 0.3);
        }
        .item {
          position: relative;
          float: left;
          margin-right: 5px; // margin-bottom: 44px;
          background-color: #000;
          video {
            width: 240px;
            height: 180px;
            background-color: #000;
          }
          &:last-child {
            margin-right: 0;
          }
        }
      }
      .controls {
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 40px;
        line-height: 40px;
        background-color: rgba(33, 43, 50, 0.5);
        padding: 0 5px;
        .wrap {
          float: right;
          font-size: 25px;
          height: 40px;
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
              font-size: 17px;
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
              font-size: 17px;
              margin-top: -2px;
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
  .features-others {
    height: calc(100vh - 232px);
    display: flex;
    .board {
      height: 100%;
      flex: 8;
      background-color: #121b25;
      position: relative;
      .tool {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%); // height: 120px;
        width: 600px;
        margin: 0 auto;
      }
      .tool-bar {
        position: absolute;
        bottom: 0;
        background-color: #3c3c3c;
        height: 65px;
        padding: 7.5px 15px;
        transition: 0.3s;
        border-radius: 5px;
        z-index: 9;
        .item {
          float: left;
          width: 50px;
          height: 50px;
          line-height: 50px;
          text-align: center;
          margin-right: 15px;
          cursor: pointer;
          border-radius: 5px;
          position: relative;
          border: 2px solid transparent;
          &:last-child {
            margin-right: 0;
          }
          .icon {
            font-size: 20px;
          }
          .icon-line {
            &:after {
              content: "/";
            }
          }
          .icon-rect {
            border-radius: 50%;
          }
          .icon-rect,
          .icon-circle {
            position: absolute;
            top: 50%;
            left: 50%;
            display: block;
            width: 45%;
            height: 45%;
            border: 1px solid #fff;
            transform: translate(-50%, -50%);
          }
          .icon-text {
            font-size: 23px;
            &:after {
              content: "A";
              font-style: normal;
            }
          }
          .icon--6 {
            display: block;
            transform: scaleX(-1);
          }
          .icon-photo-1,
          .icon--6,
          .icon-30 {
            position: relative;
            top: 2px;
          }
        }
        #Image {
          position: absolute;
          z-index: 1;
          width: 50px;
          height: 50px;
          left: 275px;
          opacity: 0;
          cursor: pointer;
        }
      }
      .tool-style {
        position: absolute;
        top: -60px;
        height: 50px;
        background-color: #5d5d5d;
        border-radius: 3px;
        transition: 0.3s;
        .stroke-size-div,
        .font-size-div,
        .stroke-color-div {
          float: left;
          height: 100%;
          padding: 10px 10px;
        }
        .stroke-size-div {
          .icon {
            display: block;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background-color: #fff;
            border: 1px solid #fff;
            box-shadow: 0px 0px 2px 2px;
          }
        }
        .stroke-color-div {
          position: relative;
          .line {
            position: absolute;
            left: -3px;
            display: inline-block;
            width: 1px;
            height: 30px;
            background-color: #9e9e9e;
          }
        }
        .item {
          float: left;
          width: 30px;
          height: 30px;
          line-height: 30px;
          text-align: center;
          margin-right: 10px;
          border-radius: 3px;
          font-weight: 300;
          cursor: pointer;
          border: 2px solid transparent;
          user-select: none;
          &:last-child {
            margin-right: 0;
          }
        }
      }
      .open-style {
        top: -120px;
      }
      .flie-upload {
        width: 800px;
        height: 600px;
        position: absolute;
        z-index: 99;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        .upload-head {
          height: 60px;
          background-color: #3d424e;
          border-top-left-radius: 10px;
          border-top-right-radius: 10px;
          .head-item {
            float: left;
            height: 100%;
            line-height: 3;
            font-size: 18px;
            padding: 0 20px;
            cursor: pointer;
            &.current-head {
              border-bottom: 5px solid #66afff;
            }
          }
          .head-close {
            cursor: pointer;
            float: right;
            padding-right: 20px;
            padding-top: 23px;
            font-size: 12px;
          }
        }
        .upload-content {
          border-bottom-left-radius: 10px;
          border-bottom-right-radius: 10px;
          background-color: #ffffff;
          height: 550px;
          overflow-y: auto;
          position: relative;
          &::-webkit-scrollbar {
            width: 5px;
            height: 100%;
            border-radius: 5px;
            background-color: transparent;
          }
          &::-webkit-scrollbar-thumb {
            min-height: 5px;
            min-width: 5px;
            border: 1px solid #dddddd;
            border-radius: 5px;
            background-color: #dddddd;
          }
          .content-item {
            li {
              height: 50px;
              padding-left: 17px;
              &:nth-child(odd) {
                background-color: #f9fafe;
              }
            }
            .upload-input {
              position: relative;
              .file-input {
                position: absolute;
                top: 0;
                cursor: pointer;
                width: 80px;
                height: 100%;
                opacity: 0;
              }
              .file-button {
                position: absolute;
                top: 7px;
                width: 80px;
                height: 35px;
                line-height: 35px;
                padding-right: 20px;
                text-align: right;
                background-color: #66afff;
                border-radius: 5px;
              }
              .file-info {
                color: #919193;
                height: 100%;
                font-size: 14px;
                line-height: 3.5;
                padding-left: 120px;
              }
            }
            .upload-title {
              font-size: 13px;
              .file-div {
                color: #666;
                float: left;
                height: 50px;
                line-height: 50px;
                &:nth-child(1) {
                  width: 250px;
                  padding-left: 20px;
                }
                &:nth-child(2) {
                  width: 85px;
                }
                &:nth-child(3) {
                  width: 280px;
                }
                &:nth-child(4) {
                  width: 150px;
                }
              }
            }
            .upload-title-content {
              border: 1px solid transparent;
              color: #666;
              position: relative;
              &:hover {
                background-color: #eaf5ff;
                border: 1px solid #d5eaff;
              }
              .file-type-icon {
                width: 20px;
                height: 24px;
                background-size: contain;
                position: absolute;
                top: 10px;
                left: 35px;
                &.doc {
                  background: url("../../assets/images/fileType/doc.png");
                }
                &.ppt {
                  background: url("../../assets/images/fileType/ppt.png");
                }
                &.pdf {
                  background: url("../../assets/images/fileType/pdf.png");
                }
                &.mp3 {
                  background: url("../../assets/images/fileType/mp3.png");
                }
                &.mp4 {
                  background: url("../../assets/images/fileType/mp4.png");
                }
              }
              .file-div {
                float: left;
                height: 50px;
                line-height: 50px;
                font-size: 13px;
              }
              .file-name {
                width: 250px;
                padding-left: 50px;
              }
              .size {
                width: 85px;
              }
              .date {
                width: 280px;
              }
              .file-ues {
                cursor: pointer;
                margin-right: 20px;
                &:hover {
                  color: #5da6f5;
                }
              }
              .file-del {
                cursor: pointer;
                &:hover {
                  color: red;
                }
              }
            }
          }
          .empty {
            padding-top: 100px;
            text-align: center;
            .text {
              padding-top: 15px;
              color: #999;
            }
            img {
              padding-left: 35px;
            }
          }
        }
      }
      .officefile {
        width: 800px;
        height: 540px;
        max-width: 800px;
        max-height: 530px;
        position: absolute;
        left: 20px;
        top: 40px;
        color: #666;
        .officefile-head {
          height: 40px;
          color: #ffffff;
          padding-left: 20px;          
          line-height: 40px;
          background-color: #3d424e;          
          border-top-left-radius: 10px;
          border-top-right-radius: 10px;
          .officefile-title {
            float: left;
          }
          .head-close {
            float: right;
            padding-right: 20px;
            font-size: 12px;
            cursor: pointer;
          }
        }
        .officefile-content {
          max-height: 500px;
          width: 100%;
          overflow-y: scroll;
          img {
            width: 100%;
            vertical-align: middle;
          }
        }
        .officefile-footer{
          height: 40px;
          color: #fff;
          line-height: 40px;
          background-color: #3d424e;
          text-align: center;
        }
      }
    }
    .current {
      border: 2px solid #242424 !important;
      background-color: #242424;
    }
    .chat {
      height: 100%;
      flex: 2;
      background-color: #2b2f38;
      position: relative;
      .msg {
        padding: 25px 20px;
        overflow-y: auto;
        max-height: calc(100% - 40px);
        &::-webkit-scrollbar {
          width: 5px;
          height: 100%;
          border-radius: 5px;
          background-color: transparent;
        }
        &::-webkit-scrollbar-thumb {
          min-height: 5px;
          min-width: 5px;
          border: 1px solid rgb(85, 91, 106);
          border-radius: 5px;
          background-color: rgb(85, 91, 106);
        }
        .msg-left {
          text-align: left;
          position: relative;
          .info {
            &::after {
              left: 10px;
            }
          }
        }
        .msg-right {
          text-align: right;
          position: relative;
          .info {
            &::after {
              right: 10px;
            }
          }
        }
        .name {
          margin: 12px 0 8px;
        }
        .info {
          display: inline-block;
          background-color: #fff;
          color: #282828;
          border-radius: 6px;
          line-height: 2;
          width: auto;
          min-width: 30px;
          text-align: center;
          padding: 0 5px;
          &::after {
            content: "";
            position: absolute;
            top: 16px;
            display: inline-block;
            width: 0;
            height: 0;
            border: 4px solid #fff;
            border-left-color: transparent;
            border-right-color: transparent;
            border-bottom-color: transparent;
            transform: rotate(180deg);
          }
        }
      }
      .send {
        position: absolute;
        bottom: 0;
        height: 40px;
        width: 100%;
        display: flex;
        input[type="text"] {
          height: 100%;
          flex: 4;
          outline: none;
          padding: 0 10px;
          border: 0.5px solid transparent;
          font-size: 14px;
        }
        input[type="button"] {
          display: inline-block;
          height: 100%;
          flex: 1;
          outline: none;
          color: #fff;
          border: 0.5px solid #5da6f5;
          background-color: #5da6f5;
          -webkit-appearance: button;
          cursor: pointer;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          font-size: 14px;
          &:hover {
            background: #4897ed;
          }
        }
      }
    }
  }
}
</style>
