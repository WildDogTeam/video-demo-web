//只有在正式环境下才使用懒加载
// const _import = require('./_import_' + process.env.NODE_ENV);
// const Layout = _import('status/index');
// const Invite = _import('status/invite');
// const Invited = _import('status/invited');

// export default {
//   path: '/status',
//   component: Layout,
//   children: [{
//     path: '',
//     redirect: 'invite',
//     hidden: true
//   }, {
//     path: 'invite',
//     component: Invite,
//   }, {
//     path: 'invited',
//     component: Invited,
//   }]
// }
