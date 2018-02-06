<template>
  <div class="video-box">
    <ul class="inner clearfix">
      <li class="item">
        <video muted autoplay="autoplay" ref="localStream" :controls="isMobile && (isFF || isSafari)"></video>
        <div class="controls">
          <span class="name">{{ name }}</span>
          <div class="wrap">
            <!-- <span class="translate" @click="switchCamera"><i class="icon-"></i></span> -->
            <span class="media" @click="enableAudio">
              <i class="icon-"></i>
            </span>
            <span class="video" @click="enableVideo">
              <i class="icon-"></i>
            </span>
          </div>
        </div>
      </li>
      <li class="item" v-for='(item, index) in participants' :key="item.id">
        <video autoplay="autoplay" ref="remoteStream" :controls="isMobile && (isFF || isSafari)"></video>
        <div class="controls">
          <span class="name" ref="name">{{item.attributes.name || 'May'}}</span>
          <div class="wrap clearfix">
            <span class="media" @click="enableAudio">
              <i class="icon-" :data-stream="index"></i>
            </span>
            <span class="video" @click="enableVideo">
              <i class="icon-" :data-stream="index"></i>
            </span>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
<script>
import config from "config";
import { mapGetters } from "vuex";
import Bus from './Bus.js';

export default {
  name: "videoBox",
  data() {
    return {
      roomId: this.$route.query.roomId,
      isMobile: /Mobile/i.test(navigator.userAgent),
      isFF: navigator.userAgent.indexOf("Firefox") > -1,
      isSafari: navigator.userAgent.indexOf("Safari") > -1 &&
        navigator.userAgent.indexOf("Chrome") < 1,
      localStream: "",
      participants: [],
      roomInstance: "",
      document: {}
    };
  },
  created() {
    if (!wilddogVideo.appId) {
      wilddogVideo.initialize({
        appId: config.wd.videoAppid,
        token: this.token
      });
    }

    this.roomInstance = wilddogVideo.room(this.roomId);
    // 创建一个同时有音频和视频的媒体流
    wilddogVideo.createLocalStream({
      captureAudio: true,
      captureVideo: true,
      dimension: this.dimension || "480p",
      maxFPS: 15
    }).then(localStream => {
      this.localStream = localStream;
      this.localStream.setAttributes({
        name: this.name
      });
      this.$nextTick(() => {
        this.localStream.attach(this.$refs.localStream);
      });
    });

    this.$on("leaveRoom", () => {
      if (this.localStream) this.localStream.close();
      try {
        this.roomInstance.disconnect();
      } catch (e) {
        console.log(e);
      }
    });

    Bus.$on("send-document", document => {
      this.document = document
    });
  },
  methods: {
    _addStream(stream) {
      if (stream.attributes.isExternalInput == true) {
        Bus.$emit("addInsertStream", stream);
      } else {
        this.participants.push(stream);
        this._displayStreams(this.participants);
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
        Bus.$emit("removeInsertStream");
      }
    },

    _displayStreams(participant) {
      for (let i = 0; i < participant.length; i++) {
        this.$nextTick(() => {
          if (this.$refs.remoteStream[i]) {
            participant[i].attach(this.$refs.remoteStream[i]);
          }
        });
      }
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
    }
  },
  watch: {
    localStream: function(argument) {
      this.roomInstance.connect();
      this.roomInstance.on("connected", () => {
        console.log("connected success");
        this.roomInstance.publish(this.localStream, 'H264', () => {
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
          this.$nextTick(() => {
            this._addStream(stream);
          });
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
