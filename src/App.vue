<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>
<script>
export default {
  name: 'app'
};
</script>
<style lang="scss">
@import './styles/index.scss'; // 全局自定义的css样式
#app {
    min-height: 100vh;
    width: 100%;
    height: 100%;
}
</style>
