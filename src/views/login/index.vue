<template>
  <div class="login-page">
    <div class="login-page__inner">
      <div class="login-page-title">Label System</div>
      <t-form
        v-if="tab === 1"
        :data="formData"
        :colon="true"
        :label-width="0"
        @submit="onSubmit"
        style="width: 100%"
      >
        <t-form-item name="username">
          <t-input v-model="formData.username" clearable placeholder="请输入账户名">
            <template #prefix-icon>
              <desktop-icon />
            </template>
          </t-input>
        </t-form-item>

        <t-form-item name="password">
          <t-input v-model="formData.password" type="password" clearable placeholder="请输入密码">
            <template #prefix-icon>
              <lock-on-icon />
            </template>
          </t-input>
        </t-form-item>

        <t-form-item style="margin: 32px 0 0 0">
          <t-button theme="primary" size="large" type="submit" block>登录</t-button>
        </t-form-item>
      </t-form>

      <t-form
        v-else
        :data="registerFormData"
        :colon="true"
        :label-width="0"
        @submit="onRegisterSubmit"
        style="width: 100%"
      >
        <t-form-item name="username">
          <t-input v-model="registerFormData.username" clearable placeholder="请输入账户名">
            <template #prefix-icon>
              <desktop-icon />
            </template>
          </t-input>
        </t-form-item>

        <t-form-item name="password">
          <t-input
            v-model="registerFormData.password"
            type="password"
            clearable
            placeholder="请输入密码"
          >
            <template #prefix-icon>
              <lock-on-icon />
            </template>
          </t-input>
        </t-form-item>

        <t-form-item name="repeatPasswd">
          <t-input
            v-model="registerFormData.repeatPasswd"
            type="password"
            clearable
            placeholder="请再次输入密码"
          >
            <template #prefix-icon>
              <lock-on-icon />
            </template>
          </t-input>
        </t-form-item>

        <t-form-item style="margin: 32px 0 0 0">
          <t-button theme="primary" size="large" type="submit" block>注册</t-button>
        </t-form-item>
      </t-form>

      <div class="login-page-tips">
        <t-link v-if="tab === 1" theme="primary" hover="color" @click="tab = 2">注册</t-link>
        <t-link v-else theme="primary" hover="color" @click="tab = 1">登录</t-link>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { cgi, isLogin, setAccessToken } from '@/utils/cgi'
import { MessagePlugin, type FormProps } from 'tdesign-vue-next'
import { DesktopIcon, LockOnIcon } from 'tdesign-icons-vue-next'
import { reactive, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { hash } from '@/utils/hash'

const router = useRouter()

const tab = ref(1) // 1 登陆 2 注册
const formData = reactive({
  username: '',
  password: '',
})

const goHome = () => {
  router.replace({
    path: '/task',
  })
}

const onSubmit: FormProps['onSubmit'] = async ({ validateResult, firstError }) => {
  if (validateResult === true) {
    if (!formData.username || !formData.password) {
      MessagePlugin.warning('请填写账号密码')
      return
    }
    try {
      const resp = await cgi.post('/cgi/sign', {
        ...formData,
        password: hash(formData.password),
      })
      setAccessToken(resp.data.token)
      goHome()
    } catch (err) {
      MessagePlugin.warning('账号密码错误')
    }
  } else {
    console.log('Validate Errors: ', firstError, validateResult)
    MessagePlugin.warning(firstError || '')
  }
}

const registerFormData = ref({
  username: '',
  password: '',
  repeatPasswd: '',
})

const onRegisterSubmit: FormProps['onSubmit'] = async ({ validateResult, firstError }) => {
  if (validateResult === true) {
    if (!registerFormData.value.username) {
      MessagePlugin.warning('请填写账号名')
      return
    }
    if (!registerFormData.value.password) {
      MessagePlugin.warning('请填写密码')
      return
    }
    if (
      !registerFormData.value.repeatPasswd ||
      registerFormData.value.repeatPasswd !== registerFormData.value.password
    ) {
      MessagePlugin.warning('两次输入密码不一致')
      return
    }
    try {
      const resp = await cgi.post('/cgi/user', {
        username: registerFormData.value.username,
        password: hash(registerFormData.value.password),
      })
      MessagePlugin.success('已注册')
      tab.value = 1
    } catch (err) {
      MessagePlugin.warning('注册失败，请稍后重试')
    }
  } else {
    console.log('Validate Errors: ', firstError, validateResult)
    MessagePlugin.warning(firstError || '')
  }
}

onMounted(async () => {
  const res = await isLogin()
  if (res) {
    goHome()
  }
})
</script>
<style scoped>
.login-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('./0cc3c72150454a8cb1169de56d23df20.jpg');
  background-size: cover;
  position: relative;
}
.login-page__inner {
  position: relative;
  margin: 0px auto;
  padding-top: 20vh;
  padding-bottom: 136px;
  width: 392px;

  padding: 0px 40px 36px;
  border-radius: 24px;
  background-color: white;
  /** Surface/1 */
  display: flex;
  flex-direction: column;
  margin: 0px auto;
  text-align: center;
  box-sizing: border-box;

  display: flex;
  align-items: center;
}
.login-page-title {
  width: 100%;
  padding-top: 40px;
  padding-bottom: 24px;
  font-size: 32px;
}
.login-page-tips {
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 20px;
  text-align: center;
  color: #858585;
  /** Text/3 */
  margin-top: 20px;
  padding-top: 12px;
  width: 100%;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}
</style>
