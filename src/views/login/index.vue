<template>
  <div class="login-page">
    <div class="login-page__inner">
      <div class="login-page-title">Label System</div>
      <t-form
        ref="form"
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

      <div class="login-page-tips">有问题的联系方式</div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { cgi, setAccessToken } from '@/utils/cgi'
import { MessagePlugin, type FormProps } from 'tdesign-vue-next'
import { DesktopIcon, LockOnIcon } from 'tdesign-icons-vue-next'
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { hash } from '@/utils/hash'

const router = useRouter()

const formData = reactive({
  username: '',
  password: '',
})

const onSubmit: FormProps['onSubmit'] = async ({ validateResult, firstError }) => {
  if (validateResult === true) {
    if (!formData.username || !formData.password) {
      MessagePlugin.warning('请填写账号密码')
      return
    }
    const resp = await cgi.post('/cgi/sign', {
      ...formData,
      password: hash(formData.password),
    })
    setAccessToken(resp.data.token)
    router.replace({
      path: '/task',
    })
  } else {
    console.log('Validate Errors: ', firstError, validateResult)
    MessagePlugin.warning(firstError || '')
  }
}
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
