//只有在正式环境下才使用懒加载
const _import = require('./_import_' + process.env.NODE_ENV);
const Room = _import('room/index');

export default {
  path: '/room',
  component: Room,
  hidden: true
}
