<template>
  <div class="page">
    <div class="card">
      <div style="font-size: 24px; line-height: 32px; padding-top: 40px; margin-bottom: 24px">
        修改密码
      </div>
      <t-form
        ref="form"
        :data="formData"
        :colon="true"
        :label-width="0"
        @submit="onSubmit"
        style="width: 100%"
      >
        <t-form-item name="password">
          <t-input v-model="formData.password" type="password" clearable placeholder="请输入新密码">
            <template #prefix-icon>
              <lock-on-icon />
            </template>
          </t-input>
        </t-form-item>
        <t-form-item name="confirmPass">
          <t-input
            v-model="formData.confirmPass"
            type="password"
            clearable
            placeholder="请再次输入新密码"
          >
            <template #prefix-icon>
              <lock-on-icon />
            </template>
          </t-input>
        </t-form-item>

        <t-form-item style="margin: 32px 0 0 0">
          <t-button theme="primary" size="large" type="submit" block>修改</t-button>
        </t-form-item>
      </t-form>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { cgi } from '@/utils/cgi'
import { hash } from '@/utils/hash'
import { MessagePlugin, type FormProps } from 'tdesign-vue-next'
import { reactive } from 'vue'

const formData = reactive({
  password: '',
  confirmPass: '',
})

const onSubmit: FormProps['onSubmit'] = async ({ validateResult, firstError }) => {
  if (validateResult === true) {
    if (!formData.confirmPass || !formData.password) {
      MessagePlugin.warning('请填写信息')
      return
    }
    if (formData.confirmPass !== formData.password) {
      MessagePlugin.warning('两次密码不同')
      return
    }
    const resp = await cgi.post('/cgi/user/me', {
      password: hash(formData.password),
    })
    if (resp.status !== 200) {
      MessagePlugin.warning('修改失败')
      return
    }
    MessagePlugin.success('已修改')
    formData.password = ''
    formData.confirmPass = ''
  } else {
    console.log('Validate Errors: ', firstError, validateResult)
    MessagePlugin.warning(firstError || '')
  }
}
</script>
<style lang="css" scoped>
.page {
  position: relative;
  margin: 0px auto;
  padding-top: 20vh;
  padding-bottom: 136px;
  width: 392px;
}
.card {
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
</style>
