<template>
<div class="dialog">
	<div class="mask"></div>
	<div class="dialog-content" :style="{ width: modal.width, height: modal.height }">
		<h3 class="title">{{ modal.title }}</h3>
		<p class="text">{{ modal.text }}</p>
		<div class="btn-group">
			<div class="btn cancel" @click="cancel" v-if="modal.cancelButtonText">{{ modal.cancelButtonText }}</div>
			<div class="btn submit" @click="submit" v-if="modal.confirmButtonText">{{ modal.confirmButtonText }}</div>
		</div>
	</div>
</div>
</template>

<script>
export default {
  name: "Dialog",
  props: {
    dialogOption: Object
  },
  data() {
    return {
      resolve: "",
      reject: "",
      promise: ""
    };
  },
  computed: {
    modal: function() {
      const options = this.dialogOption;
      return {
        width: options.width || "300px",
        height: options.height || "200px",
        title: options.title || "温馨提示！",
        text: options.text || "哈哈",
        cancelButtonText: options.cancelButtonText || false,
        confirmButtonText: options.confirmButtonText || false
      };
    }
  },
  methods: {
    submit() {
      this.resolve("submit");
    },
    cancel() {
      this.reject("cancel");
    },
    confirm() {
      this.promise = new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
      return this.promise;
    }
  }
};
</script>

<style lang="scss">
.dialog {
  position: relative;
  .dialog-content {
    position: fixed;
    box-sizing: border-box;
    padding: 20px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border-radius: 5px;
    background: #fff;
    z-index: 50002;
    text-align: center;
    .title {
      font-size: 16px;
      font-weight: 600;
      line-height: 30px;
      color: #555;
    }
    .text {
      font-size: 14px;
      line-height: 30px;
      color: #555;
    }
    .btn-group {
      display: flex;
      position: absolute;
      right: 0;
      bottom: 10px;
      .btn {
        font-size: 14px;
      }
      .cancel {
        color: #76d49b;
      }
      .submit {
        color: #76d49b;
      }
    }
  }
  .mask {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 50001;
    background: rgba(0, 0, 0, 0.5);
  }
}
</style>
