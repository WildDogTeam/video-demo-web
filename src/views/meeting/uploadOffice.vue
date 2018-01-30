<template>
  <ul class="content-item">
    <li class="upload-input">
      <div class="file file-button">
        <i class="icon--17">&nbsp;</i>上传</div>
      <button id="officeUpload" class="file-input">上传文件</button>
      <div class="file-info">
        <i class="icon--15"></i>支持上传pdf、doc、docx、ppt、pptx、pptm</div>

    </li>
    <li class="upload-title">
      <div class="file-div">文件名</div>
      <div class="file-div">大小</div>
      <div class="file-div">上传时间</div>
      <div class="file-div">操作</div>
    </li>
    <li v-for="(item, key, index) in uploadOfficeData.fileLists" :key="key" class="upload-title-content">
      <div class="file-div">{{ index + 1 }}</div>
      <div class="file-type-icon" :class="item.fileName | fileType"></div>
      <div class="file-div file-name">{{item.fileName | splitJoin}}</div>
      <div class="file-div size">{{item.size | readablizeBytes}}</div>
      <div class="file-div date">{{item.date | parseTime('{y}/{m}/{d} {h}:{i}:{s}')}}</div>
      <div class="file-div">
        <span class="file-ues" @click="useFile(key)">使用</span>
        <span class="file-del" @click="delFile(key)">删除</span>
      </div>
    </li>
    <div v-show="uploadOfficeData.isEmpty" class="empty">
      <img src="../../assets/images/empty.png" alt="">
      <div class="text">暂无文档</div>
    </div>
  </ul>
</template>
<script>
export default {
  name: "uploadOffice",
  props: {
    uploadOfficeData: Object
  },
  methods: {
    useFile(key) {
      this.$emit("useOfficeFile", key);
    },
    delFile(key) {
      this.$emit("delOfficeFile", key);
    }
  }
};

</script>
