<template>
  <div class="conversation">
    <video autoplay='autoplay' ref='localStream' muted="" id="localStream" controls=""></video>
    <video autoplay ref='remoteStream' id="remoteStream" controls=""></video>
    <div class="show">
      <div class="name"></div>
      <div class="time"></div>
    </div>
    <div class="funcs">
      <div class="func">
        <div class="item">
          <span class="icon"></span>
          <div class="text">麦克风</div>
        </div>
        <div class="item">
          <span class="icon"></span>
          <div class="text">扬声器</div>
        </div>
        <div class="item">
          <span class="icon"></span>
          <div class="text">摄像头</div>
        </div>
        <div class="item">
          <span class="icon"></span>
          <div class="text">切换摄像头</div>
        </div>
        <div class="item">
          <span class="icon"></span>
          <div class="text">全屏显示</div>
        </div>
      </div>
      <div class="hangUp">
        <img src="../../assets/images/refuse.png" alt="" width="40">
        <div>挂断</div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'conversation',
  props: ['localStream', 'remoteStream'],
  data() {
    return {

    }
  },
  methods: {
    localUpdate: function() {
      console.log(this.localStream)
      this.localStream.attach(this.$refs.localStream)
    },
    remoteUpdate: function() {
      this.remoteStream.attach(this.$refs.remoteStream)
    }
  },
  // watch: {
  //   localStream: function() {
  //     console.log(this.localStream)
  //     this.localUpdate()
  //   },
  //   remoteStream: function() {
  //     this.remoteUpdate()
  //   },
  // },
  // computed: {
  //   local: function() {
  //     return this.localStream
  //   },
  //   remote: function() {
  //     return this.remoteStream
  //   }
  // }

};

</script>
<style rel="stylesheet/scss" lang="scss">
.conversation {}

</style>
