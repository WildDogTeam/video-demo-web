<template>
  <div id="loading">
    <div class="loader">
      <div class="ball-spin-fade-loader">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "Loading"
};

</script>
<style lang="scss">
#loading {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, .8);
  top: 0;
  left: 0;
  .loader {
    width: 100px;
    height: 100px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  @keyframes ball-spin-fade-loader {
    50% {
      opacity: 0.3;
      transform: scale(0.4);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  .ball-spin-fade-loader {
    position: relative;
    top: 50px;
    left: 40px;
  }

  .ball-spin-fade-loader>div:nth-child(1) {
    top: 25px;
    left: 0;
    animation: ball-spin-fade-loader 1s -0.96s infinite linear;
  }

  .ball-spin-fade-loader>div:nth-child(2) {
    top: 17.04545px;
    left: 17.04545px;
    animation: ball-spin-fade-loader 1s -0.84s infinite linear;
  }

  .ball-spin-fade-loader>div:nth-child(3) {
    top: 0;
    left: 25px;
    animation: ball-spin-fade-loader 1s -0.72s infinite linear;
  }

  .ball-spin-fade-loader>div:nth-child(4) {
    top: -17.04545px;
    left: 17.04545px;
    animation: ball-spin-fade-loader 1s -0.6s infinite linear;
  }

  .ball-spin-fade-loader>div:nth-child(5) {
    top: -25px;
    left: 0;
    animation: ball-spin-fade-loader 1s -0.48s infinite linear;
  }

  .ball-spin-fade-loader>div:nth-child(6) {
    top: -17.04545px;
    left: -17.04545px;
    animation: ball-spin-fade-loader 1s -0.36s infinite linear;
  }

  .ball-spin-fade-loader>div:nth-child(7) {
    top: 0;
    left: -25px;
    animation: ball-spin-fade-loader 1s -0.24s infinite linear;
  }

  .ball-spin-fade-loader>div:nth-child(8) {
    top: 17.04545px;
    left: -17.04545px;
    animation: ball-spin-fade-loader 1s -0.12s infinite linear;
  }

  .ball-spin-fade-loader>div {
    background-color: #fff;
    width: 15px;
    height: 15px;
    border-radius: 100%;
    margin: 2px;
    animation-fill-mode: both;
    position: absolute;
  }
}

</style>
