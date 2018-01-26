// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import * as filters from './filters';

Vue.config.productionTip = false

Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
});

const whiteList = ['/login'];
router.beforeEach((to, from, next) => {
  store.dispatch('checkAuthState').then((user) => {
    if (user) {
      if (whiteList.indexOf(to.path) == -1) {
        NProgress.start();
        next()
      } else {
        next({
          path: '/'
        });
      }
    } else {
      if (whiteList.indexOf(to.path) !== -1) {
        next()
      } else {
        next('/login');
        NProgress.done();
      }
    }
  })
});


router.afterEach(() => {
  setTimeout(() => {
    NProgress.done();
  }, 600)
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
