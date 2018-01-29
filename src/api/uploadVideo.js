/*
 * @Author: liujie3612
 * @Date:   2018-01-25 15:19:52
 * @Last Modified by:   liujie3612
 * @Last Modified time: 2018-01-27 16:34:56
 */
import axios from 'axios';
import fetch from 'utils/fetch';

export function getList(appId, userId, token) {
  return fetch({
    url: '/v2/file',
    method: 'GET',
    params: { appId, userId, token }
  });
}

//特殊处理
export function uploadFile(data) {
  const config = { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 };
  return axios.post('https://bt-sh-api.wilddog.com/v2/file', data)
}


export function delFile(appId, userId, id, token) {
  return fetch({
    url: '/v2/file',
    method: 'DELETE',
    params: { appId, userId, id, token }
  });
}

export function useFile(appId, roomId, fileId, token) {
  return fetch({
    url: 'v2/externalInput/start',
    method: 'POST',
    params: { appId, roomId, fileId, token }
  });
}


export function controlFile(appId, roomId, type, streamId, token) {
  return fetch({
    url: 'v2/externalInput/control',
    method: 'POST',
    params: { appId, roomId, type, streamId, token }
  });
}
