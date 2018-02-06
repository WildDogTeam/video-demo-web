<template>
  <div class="board" ref="board">
    <div id="canvas" @click="onBoardChange(boardObj.bigBoard)"></div>
    <div class="tool">
      <ul class="tool-bar">
        <li class="item" v-for=" item in toolBar" :key="item.type" @click="addToolListener(item)" :class="{ 'current': item.active }">
          <i class="icon" :class="item.class"></i>
        </li>
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
        <li class="head-close" @click="document.status = false">
          <i class="icon-25"></i>
        </li>
      </ul>
      <div class="upload-content">
        <upload-office v-show="!document.currentTab" :upload-office-data="document.officeFiles" class="documents" @delOfficeFile="delOfficeFile" @useOfficeFile="useOfficeFile"></upload-office>
        <upload-videos v-show="document.currentTab" :upload-video-data='document.videoFiles' :room-id='roomId' @operateVideoSuccess='operateVideoSuccess' @useVideoSuccess='useVideoSuccess'></upload-videos>
        <v-loading v-show="document.loading"></v-loading>
      </div>
    </div>
    <office-file :currentFile="currentFile" :boardRef="boardRef" :boardObj="boardObj" @onBoardChange="onBoardChange" @delCurrentFile="delCurrentFile" @pageLast="pageLast" @pageNext="pageNext"></office-file>
    <div class="insert-video" v-show="document.videoFiles.externalInputs.length !== 0" ref="videoBox">
      <div class="video-header">
        <div class="title">
          <span class="title-name">{{ document.videoFiles.video.name | splitType}}</span>
          <span class="title-type">{{document.videoFiles.video.name | fileType}}</span>
        </div>
        <span class="close" @click="controlInsertVideo('stop')">
          <i class="icon-25"></i>
        </span>
      </div>
      <div>
        <video autoplay="autoplay" ref="insertStream"></video>
        <img src="../../assets/images/ware.gif" alt="" class="ware" v-show='!document.videoFiles.video.ismp4'>
      </div>
      <div class="video-controls">
        <div class="funcs" v-show='document.videoFiles.video.funcsShow'>
          <span class="func pause" @click="controlInsertVideo('pause')" v-show='document.videoFiles.video.play'>
            <i class="icon icon--19"></i>
          </span>
          <span class="func continue" @click="controlInsertVideo('continue')" v-show='!document.videoFiles.video.play'>
            <i class="icon icon--20"></i>
          </span>
          <span class="func replay" @click="controlInsertVideo('replay')">
            <i class="icon icon--18"></i>
          </span>
          <!-- <span class="func stop" @click="controlInsertVideo('stop')"><i class="icon icon--21"></i></span> -->
        </div>
        <div class="time" v-show='document.videoFiles.video.funcsShow'>{{ document.videoFiles.video.num == 0 ? '00:00:00' : convertTime(document.videoFiles.video.num)}}/{{ document.videoFiles.video.totalTime}}</div>
      </div>
    </div>
  </div>
</template>
<script>
import config from "config";
import { mapGetters } from "vuex";
import Bus from './Bus.js';

import { getList, controlFile } from "api/uploadVideo";
import { genToken, initImageUpload, uploadClient } from "@/utils/qiniu";
import { sec2time, time2sec, drag } from "@/utils/index.js";

import WildBoard from "wilddog-board";
window.WildBoard = WildBoard;

import uploadOffice from "./uploadOffice";
import officeFileBox from "./officeFile";
import uploadVideos from "./uploadVideos";
import loading from "@/components/Loading";

import "@/assets/libs/qiniu.min";
import "@/assets/libs/plupload/js/moxie";
import "@/assets/libs/plupload/js/plupload.full.min.js";

export default {
  name: "board",
  components: {
    "upload-office": uploadOffice,
    "office-file": officeFileBox,
    "upload-videos": uploadVideos,
    "v-loading": loading
  },
  data() {
    return {
      roomId: this.$route.query.roomId,
      document: {
        status: false,
        loading: false,
        currentTab: false,
        officeFiles: {
          isEmpty: true,
          fileLists: []
        },
        videoFiles: {
          isEmpty: true,
          list: [],
          externalInputs: [],
          video: {
            name: "",
            play: true,
            funcsShow: false,
            num: 0,
            totalTime: '00:00:00',
            timer: null,
            ismp4: true
          }
        }
      },
      currentFile: {},
      boardObj: {},
      wdBoard: {},
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
      }
    };
  },
  created() {
    this.boardRef = wilddog.sync().ref(`room/${this.roomId}/board`);
    this.documentRef = wilddog.sync().ref(`room/${this.roomId}/document`);

    wilddog.sync().ref(`room/${this.roomId}/curFile`).on('value', (snap) => {
      if (snap.val()) {
        this.document.videoFiles.video.name = snap.val().name
      }
    })

    this.getVideoList();
    this.getOfficeLists();
    //获取当前打开的文档
    this.getCurrentFile();

    this.$nextTick(() => {
      let boardConfig = {
        width: this.$refs.board.clientWidth,
        height: this.$refs.board.clientHeight,
        write: true
      };

      this.wdBoard = this.boardObj.bigBoard = new WildBoard(
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

    this.$on("openDocument", () => {
      this.openDocument();
    });

    Bus.$on("addInsertStream", (stream) => {
      this.addInsertStream(stream);
    });

    Bus.$on("removeInsertStream", () => {
      this.document.videoFiles.externalInputs = [];
    });

    Bus.$emit("send-document", this.document);
  },
  mounted() {
    window.onresize = () => {
      this.boardObj.bigBoard.setOption({
        width: this.$refs.board.clientWidth,
        height: this.$refs.board.clientHeight,
        write: true
      });
    };

    Bus.$on('waitingLoading', (display) => {
      this.document.loading = display;
    })

    const uploader = uploadClient();

    uploader.bind("FilesAdded", (uploader, files) => {
      this.document.loading = true;
      uploader.start();
    });

    uploader.bind("FileUploaded", (uploader, file, result) => {
      var status = JSON.parse(result.response).status;
      var results = JSON.parse(result.response).results;
      if (status == "success") {
        results.date = Date.now();
        this.documentRef.child("officeFiles").push(results).then(() => {
          if (results.errors.length == 0) {
            this.document.loading = false;
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

    uploader.bind('Error', (uploader, err) => {
      console.error('Error:', err);
      this.document.loading = false
      this.$parent.dialogOption.text = "上传文件格式错误";
      this.$parent.showDialog = true;
      this.$parent.$refs.dialog.confirm().then(() => {
        this.$parent.showDialog = false;
      }).catch(() => {
        this.$parent.showDialog = false;
      });
    });

    drag(this.$refs.board, this.$refs.videoBox)
  },
  methods: {
    convertTime(num) {
      return sec2time(num)
    },

    getVideoList() {
      this.document.loading = true;
      getList(config.wd.videoAppid, this.uid, this.token).then(response => {
        this.document.loading = false;
        let data = response.data;
        if (Array.isArray(data)) {
          let syncData = []
          data.forEach((element, index) => {
            syncData.push({
              name: element.name,
              status: 'stop'
            })
          });
          wilddog.sync().ref(`room/${this.roomId}/users/${this.uid}/files`).set(syncData)
          this.document.videoFiles.list = data;
          this.document.videoFiles.isEmpty = data.length == 0 ? true : false;
        }
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
        this.$parent.dialogOption.text = "确定清空全部内容？";
        this.$parent.showDialog = true;
        this.$parent.$refs.dialog.confirm().then(() => {
          this.$parent.showDialog = false;
          this.wdBoard.clearPage(this.wdBoard.currentPage());
        }).catch(() => {
          this.$parent.showDialog = false;
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
        this.strokeWidth.map(e => (e.active = e.width == tool.width ? true : false));
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
    operateVideoSuccess() {
      this.getVideoList();
    },
    useVideoSuccess(name) {
      this.document.status = false;
      wilddog.sync().ref(`room/${this.roomId}/curFile`).set({
        'name': name
      })
    },
    controlInsertVideo() {
      const arg = arguments[0];
      if (this.document.videoFiles.externalInputs[0].streamOwners[0].userId == this.uid) {
        controlFile(config.wd.videoAppid, this.roomId, arg, this.document.videoFiles.externalInputs[0].streamId, this.token).then(response => {
          let data = response.data;
        });
      }
      switch (arg) {
        case "pause":
          this.document.videoFiles.video.play = false;
          clearInterval(this.document.videoFiles.video.timer)
          break;
        case "continue":
          this.document.videoFiles.video.play = true;
          this.document.videoFiles.video.timer = setInterval(() => {
            if (this.document.videoFiles.video.num < time2sec(this.document.videoFiles.video.totalTime)) {
              this.document.videoFiles.video.num++
            }
          }, 1000)
          break;
        case "replay":
          this.document.videoFiles.video.num = 0
          this.document.videoFiles.video.play = true;
          break;
        case "stop":
          this.document.videoFiles.externalInputs = [];
          clearInterval(this.document.videoFiles.video.timer)
          this.document.videoFiles.video.num = 0
          break;

        default:
          break;
      }
    },
    openDocument() {
      this.document.status = true;
    },
    getOfficeLists() {
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
        this.document.officeFiles.fileLists = [];
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            const element = data[key];
            element.key = key
            this.document.officeFiles.fileLists.push(element)
          }
        }
      });
    },

    getCurrentFile() {
      this.boardRef.child(`currentFile`).on("value", snapshot => {
        this.currentFile = snapshot.val();
      });
    },

    useOfficeFile(key) {
      this.document.status = false;
      var data = {};
      this.document.officeFiles.fileLists.map(e => {
        if (e.key == key) data = e
      })
      data.currentPage = 1;
      data.index = 1;
      data.top = `30px`;
      data.left = `80px`;
      this.boardRef.child(`currentFile`).set(null);
      this.boardRef.child(`currentFile`).push(data);
    },

    delOfficeFile(key) {
      this.$parent.dialogOption.text = "确认删除所选文档？";
      this.$parent.showDialog = true;
      this.$parent.$refs.dialog.confirm().then(() => {
        this.documentRef.child(`officeFiles/${key}`).remove();
        if (this.currentFile[key]) {
          this.boardRef.child(`currentFile${key}`).remove();
        }
        this.$parent.showDialog = false;
      }).catch(() => {
        this.$parent.showDialog = false;
      });
    },

    delCurrentFile(key) {
      this.boardRef.child(`currentFile/${key}`).remove();
    },

    pageLast(key) {
      if (this.currentFile[key].currentPage > 1) {
        this.currentFile[key].currentPage--;
        this.wdBoard.changePage(this.currentFile[key].currentPage - 1);
        this.boardRef.child(`currentFile/${key}/currentPage`).set(this.currentFile[key].currentPage);
      }
    },

    pageNext(key) {
      if (this.currentFile[key].currentPage < this.currentFile[key].info.Pages) {
        this.currentFile[key].currentPage++;
        this.wdBoard.changePage(this.currentFile[key].currentPage - 1);
        this.boardRef.child(`currentFile/${key}/currentPage`).set(this.currentFile[key].currentPage);
      }
    },

    onBoardChange(object) {
      this.wdBoard = object;
    },

    addInsertStream(stream) {
      this.document.status = false;
      if (this.document.videoFiles.externalInputs.length == 0) {
        this.document.videoFiles.externalInputs.push(stream);
      } else {
        this.document.videoFiles.externalInputs.splice(0, 1, stream);
      }

      //插播流是自己的，底部的功能栏显示
      if (this.document.videoFiles.externalInputs[0].streamOwners[0].userId == this.uid) {
        this.document.videoFiles.video.funcsShow = true;
        this.document.videoFiles.video.totalTime = sec2time(stream.attributes.duration)
        this.document.videoFiles.video.num = 0;

        this.document.videoFiles.video.timer = setInterval(() => {
          if (this.document.videoFiles.video.num < stream.attributes.duration) {
            this.document.videoFiles.video.num++
          }
        }, 1000)
      } else {
        this.document.videoFiles.video.funcsShow = false;
      }

      if (stream.captureVideo == false) {
        this.document.videoFiles.video.ismp4 = false
      } else {
        this.document.videoFiles.video.ismp4 = true
      }

      this.$refs.insertStream && stream.attach(this.$refs.insertStream);
    }
  },
  computed: {
    ...mapGetters(["name", "token", "uid", "dimension"])
  }
};

</script>
