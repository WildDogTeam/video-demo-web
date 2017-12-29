import Vue from 'vue';
import Router from 'vue-router';
import Home from './home'
import Login from './login'
// import Status from './status'
import Call from './call'
import Meeting from './meeting'
import Room from './room'

Vue.use(Router);

export const constantRouterMap = [
  Home,
  Login,
  // Status,
  Call,
  Meeting,
  Room
]

export default new Router({
  routes: constantRouterMap,
  strict: process.env.NODE_ENV !== 'production', //在非生产环境下，使用严格模式
});
