import axios from 'axios'
import { isProd } from './const'
import { LocalStorageKey } from './enum'

const cache = {
  token: '',
  init: false,
}

const getToken = () => {
  if (!cache.init) {
    try {
      const str = localStorage.getItem(LocalStorageKey.AccessToken)
      if (str) {
        const info = JSON.parse(str)
        cache.token = info.token
      }
    } catch (err) {
    } finally {
      cache.init = true
    }
  }
  return cache.token || ''
}

export const cgi = axios.create({
  baseURL: isProd() ? '/' : 'http://127.0.0.1:3000',
})

const setCgiAuthorization = () => {
  const token = getToken()
  cgi.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

setCgiAuthorization()
export const logout = () => {
  setAccessToken('')
  location.href = '/'
}

cgi.interceptors.response.use(
  (response) => response,
  (err) => {
    if (err.status === 401) {
      // 登陆态已经失效
      logout()
    }
  },
)

export const setAccessToken = (token: string) => {
  cache.token = token
  cache.init = true
  localStorage.setItem(
    LocalStorageKey.AccessToken,
    JSON.stringify({
      token,
    }),
  )
  setCgiAuthorization()
}

export const isLogin = async () => {
  const resp = await cgi.get('/cgi/loginsession')
  return resp?.data?.code === 0 ? true : false
}
