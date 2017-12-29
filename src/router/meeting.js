//只有在正式环境下才使用懒加载
const _import = require('./_import_' + process.env.NODE_ENV);
const Meeting = _import('meeting/index');

export default {
  path: '/meeting',
  component: Meeting,
  hidden: true
}
