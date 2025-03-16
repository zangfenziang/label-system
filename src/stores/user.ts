import { cgi } from '@/utils/cgi'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref({
    level: 0,
    status: '',
    uid: 0,
    username: '',
  })

  const init = async () => {
    const resp = await cgi.get('/cgi/user/me')
    userInfo.value = resp.data
  }

  return {
    userInfo,
    init,
  }
})
