/*
 * @Author: liujie3612
 * @Date:   2018-01-25 15:21:01
 * @Last Modified by:   liujie3612
 * @Last Modified time: 2018-01-25 17:20:57
 */
import axios from 'axios';

// 创建axios实例
const service = axios.create({
  baseURL: 'https://bt-sh-api.wilddog.com/',
  timeout: 6000,
  transformRequest: [function(forms) {
    let ret = ''
    for (let it in forms) {
      ret += encodeURIComponent(it) + '=' + encodeURIComponent(forms[it]) + '&'
    }
    return ret
  }],
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
  }
});

// respone拦截器
service.interceptors.response.use(
  response => response
)

export default service;
