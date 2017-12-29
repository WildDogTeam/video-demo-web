import Cookies from 'js-cookie'
const Key = 'token'

export function getToken() {
  return Cookies.get(Key)
}

/**
 * [setToken description]
 * @param {[type]} token [expires 是以天为单位]
 */
export function setToken(token) {
  return Cookies.set(Key, token, {
    expires: 1 / 12,
    path: '/'
  })
}

export function removeToken() {
  return Cookies.remove(Key)
}
