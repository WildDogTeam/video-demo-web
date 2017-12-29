//只有在正式环境下才使用懒加载
const _import = require('./_import_' + process.env.NODE_ENV);
const Login = _import('login/index');

export default {
  path: '/login',
  component: Login,
  hidden: true
}
