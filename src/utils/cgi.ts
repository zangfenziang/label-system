import axios from 'axios'
import { isProd } from './const'
import { LocalStorageKey } from './enum'

const cache = {
  token: '',
  expireTime: 0,
  init: false,
}

const getToken = () => {
  if (!cache.init) {
    try {
      const str = localStorage.getItem(LocalStorageKey.AccessToken)
      if (str) {
        const info = JSON.parse(str)
        cache.token = info.token
        cache.expireTime = info.expireTime
      }
    } catch (err) {
    } finally {
      cache.init = true
    }
  }
  if (Date.now() > cache.expireTime) {
    return ''
  }
  return cache.token
}

export const cgi = axios.create({
  baseURL: isProd() ? 'TODO' : 'http://127.0.0.1:3000',
})

const setCgiAuthorization = () => {
  const token = getToken()
  cgi.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

setCgiAuthorization()
export const logout = () => {
  setAccessToken('', 0)
  location.href = '/'
}

cgi.interceptors.response.use(
  (response) => response,
  (err) => {
    if (err.status === 401 && !location.pathname.startsWith('/')) {
      // 登陆态已经失效
      logout()
    }
  },
)

export const setAccessToken = (token: string, expireTime: number) => {
  cache.token = token
  cache.expireTime = expireTime
  cache.init = true
  localStorage.setItem(
    LocalStorageKey.AccessToken,
    JSON.stringify({
      token,
      expireTime,
    }),
  )
  setCgiAuthorization()
}

export const isLogin = () => {
  const token = getToken()
  return !!token
}
