<template>
    <div class="documents" v-show="!uploadOfficeData.currentTab">
        <ul class="content-item">
            <li class="upload-input">
                <div class="file file-button">上传</div>
                <button id="officeUpload" class="file-input">上传文件</button>
                <div class="file-info">
                    <i></i>支持上传pdf、doc、docx、ppt、pptx、pptm</div>
            </li>
            <li class="upload-title">
                <div class="file-div">文件名</div>
                <div class="file-div">大小</div>
                <div class="file-div">上传时间</div>
                <div class="file-div">操作</div>
            </li>
            <li v-for="(item, key, index) in uploadOfficeData.officeFiles.fileLists" :key="key" class="upload-title-content">
                <div class="file-div">{{ index + 1 }}</div>
                <div class="file-type-icon" :class="item.fileName | fileType"></div>
                <div class="file-div file-name">{{item.fileName | splitJoin}}</div>
                <div class="file-div size">{{item.size | readablizeBytes}}</div>
                <div class="file-div date">{{item.date | parseTime}}</div>
                <div class="file-div">
                    <span class="file-ues" @click="useOfficeFile(key)">使用</span>
                    <span class="file-del" @click="delOfficeFile(key)">删除</span>
                </div>
            </li>
            <div v-show="uploadOfficeData.officeFiles.isEmpty" class="empty">
                <img src="../../assets/images/empty.png" alt="">
                <div class="text">暂无文档</div>
            </div>Ï
        </ul>
    </div>
</template>

<script>
export default {
  name: "uploadOffice",
  props: {
    uploadOfficeData: Object
  },
  created() {
    console.log(this.uploadOfficeData);
  },
  methods: {
    useOfficeFile(key) {
      this.uploadOfficeData.status = false;
      var data = this.uploadOfficeData.officeFiles.fileLists[key];
      this.currentFile[key] = data;
      this.boardRef.child(`currentFile`).push(data);
    },
    delOfficeFile(key) {
      this.dialogOption.text = "确认删除所选文档";
      this.showDialog = true;
      this.$refs.dialog
        .confirm()
        .then(() => {
          this.documentRef.child(`officeFiles}/${key}`).remove();
          this.showDialog = false;
        })
        .catch(() => {
          this.showDialog = false;
        });
    }
  }
};
</script>

