//只有在正式环境下才使用懒加载
const _import = require('./_import_' + process.env.NODE_ENV);
const Call = _import('call/index');

export default {
  path: '/call',
  component: Call
}
