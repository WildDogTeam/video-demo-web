<template>
  <div>
    <div v-for="(item, key) in currentFile" class="officefile" :key="key" :style="{top:item.top,left:item.left,zIndex:item.index}">
      <div class="officefile-head" @click="onBoardChangeCurrent(key)">
        <div class="officefile-title">{{ item.fileName | splitJoin }}</div>
        <div class="head-close" @click="delCurrentFile(key)">
          <i class="icon-25"></i>
        </div>
      </div>
      <div class="officefile-content" :style="{'overflow-y':$options.filters.fileType(item.fileName) != 'ppt'? 'scroll' : 'none' }">
        <div class="element-content">
          <iframe v-if="$options.filters.fileType(item.fileName) == 'ppt'" :src="`https://pptserver.wilddogapp.com/?n=5&syn=${item.fileName}&ssl=1&furl=${item.urls[0]}`" frameborder="0" class="iframePPT"></iframe>
          <img v-if="$options.filters.fileType(item.fileName) != 'ppt'" :src="item.urls[item.currentPage-1].url" :alt="item.fileName | splitJoin">
          <div :id="key" :ref="key" class="element-board"></div>
        </div>
      </div>
      <div class="officefile-footer" v-show="$options.filters.fileType(item.fileName) != 'ppt'">
        <span class="page-btn page-last" @click="pageLast(key)"></span>
        <span class="page-num">{{item.currentPage}}</span>/
        <span class="page-num">{{item.info && item.info.Pages}}</span>
        <span class="page-btn page-next" @click="pageNext(key)"></span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "officeFile",
  props: {
    currentFile: Object,
    boardRef: Object,
    boardObj: Object
  },
  data() {
    return {
      boardRefs: this.boardRef,
      currentBoard: "",
      pptSyncWs: ""
    };
  },
  updated() {
    this.boardRefs
      .child(`currentFile/${this.currentBoard}/currentPage`)
      .once("value", snapshot => {
        if (snapshot.val()) {
          const page = snapshot.val() ?
            snapshot.val() - 1 == -1 ? 0 : snapshot.val() - 1 :
            0;
          this.$nextTick(() => {
            if (
              this.boardObj[this.currentBoard].currentPage() + 1 !=
              snapshot.val()
            ) {
              this.boardObj[this.currentBoard].changePage(page);
            }
          });
        }
      });
  },
  methods: {
    delCurrentFile(key) {
      this.$emit("delCurrentFile", key);
    },
    pageLast(key) {
      this.$emit("pageLast", key);
    },
    pageNext(key) {
      this.$emit("pageNext", key);
    },
    onBoardChange(object) {
      this.$emit("onBoardChange", object);
    },
    onBoardChangeCurrent(key) {
      // console.log(key,'onBoardChangeCurrent');
      this.currentBoard = key;
      // console.log(this.currentBoard);
      this.onBoardChange(this.boardObj[key]);
      // for (const item in this.currentFile) {
      //   if (this.currentFile.hasOwnProperty(item)) {
      //     this.boardRef.child(`currentFile/${item}`).update({ index: 1 });
      //   }
      // }
      // this.boardRef.child(`currentFile/${key}`).update({ index: 2 });
    },
    establishConnection(wsUrl) {
      var currentPageNumber = 0;
      this.pptSyncWs = new WebSocket(wsUrl);
      var lastConnectionAttemptTime = Date.now();
      var reconnectDelay = 1000;
      var maxReconnectDelay = 30000;
      var resetDelayTimeout = null;

      var onDisconnect = () => {
        if (resetDelayTimeout) {
          clearTimeout(resetDelayTimeout);
        }
        var timeSinceLastConnectAttempt =
          Date.now() - lastConnectionAttemptTime;
        var currentDelay = Math.max(
          0,
          reconnectDelay - timeSinceLastConnectAttempt
        );
        currentDelay = Math.random() * currentDelay;
        reconnectDelay = Math.min(maxReconnectDelay, reconnectDelay * 1.3);

        setTimeout(() => {
          lastConnectionAttemptTime = Date.now();
          this.pptSyncWs = new WebSocket(wsUrl);
          wsInit(this.pptSyncWs);
        }, currentDelay);
      };

      var wsInit = ws => {
        ws.onopen = () => {
          resetDelayTimeout = setTimeout(() => {
            reconnectDelay = 1000;
            resetDelayTimeout = null;
          }, 30000);
        };

        ws.onmessage = message => {
          // console.log(message);
          if (message.data != "3") {
            var pageIndex = message.data.split(",")[0] - 1;
            // console.log(pageIndex);
            if (currentPageNumber != pageIndex) {
              currentPageNumber = pageIndex;
              // console.log(this.currentBoard,'onmessage');
              this.boardObj[this.currentBoard].changePage(pageIndex);
              this.boardRef
                .child(`currentFile/${this.currentBoard}`)
                .update({ currentPage: pageIndex + 1 });
            }
          }
        };

        ws.onerror = () => {
          ws.close();
        };

        var interval = setInterval(() => {
          ws.send("2");
        }, 25000);

        ws.onclose = () => {
          clearInterval(interval);
          onDisconnect();
        };
      };

      wsInit(this.pptSyncWs);
    },
    excludeSpecial(s) {
      // 去掉转义字符
      s = s.replace(/[\'\"\\\/\b\f\n\r\t]/g, "");
      // 去掉特殊字符
      s = s.replace(/[\;\/\?\:\@\=\&\<\>\"\#\%\{\}\|\\\^\~\[\]\`\ \$\￥]/g, "");
      return s;
    }
  },
  watch: {
    currentFile: function (obj) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const element = obj[key];
          if (!this.boardObj[key]) {
            // console.log('watch',key);
            this.currentBoard = key;
            this.$nextTick(() => {
              this.boardObj[key] = new WildBoard(
                this.boardRef.child(`currentFile/${key}`),
                this.$parent.uid,
                key, {
                  width: 595,
                  height: element.info ? 842 : 338,
                  write: true
                }
              );
              //   console.log(this.boardObj[key]);
              this.onBoardChange(this.boardObj[key]);
              if (!element.info) {
                // console.log(element);
                // console.log(
                //   `wss://pptsyncserver.wilddog.com/api/Ppt/?isListener=true&syn=${this.excludeSpecial(
                //     element.fileName
                //   )}&user=${Date.now()}`
                // );
                this.establishConnection(
                  `wss://pptsyncserver.wilddog.com/api/Ppt/?isListener=true&syn=${this.excludeSpecial(
                    element.fileName
                  )}&user=${Date.now()}`
                );
              }
            });
          }
        }
      }
    }
  }
};

</script>
