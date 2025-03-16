<template>
  <t-form
    ref="form"
    :data="model"
    :colon="true"
    :rules="rules"
    @submit="onSubmit"
    style="width: 100%"
  >
    <t-form-item name="files[0]" label="output-01">
      <Upload v-model="model.files[0]" />
    </t-form-item>
    <t-form-item name="files[1]" label="output-02">
      <Upload v-model="model.files[1]" />
    </t-form-item>
    <t-form-item name="files[2]" label="output-03">
      <Upload v-model="model.files[2]" />
    </t-form-item>
    <t-form-item name="iles[3]" label="output-04">
      <Upload v-model="model.files[3]" />
    </t-form-item>

    <t-form-item style="margin: 32px 0 0 0">
      <t-button theme="default" size="large" block @click="copy" style="margin-right: 12px"
        >同步原始数据</t-button
      >
      <t-button theme="primary" size="large" type="submit" block>确定</t-button>
    </t-form-item>
  </t-form>
</template>
<script setup lang="ts">
import { MessagePlugin, type FormProps } from 'tdesign-vue-next'
import Upload from './upload.vue'
import type { TaskInfo } from './utils'

const props = defineProps<{
  info: TaskInfo
}>()
const emit = defineEmits<{
  (e: 'submit'): void
}>()
const model = defineModel<TaskInfo>({ required: true })

const rules: FormProps['rules'] = {
  ['files[0]']: [
    {
      required: true,
      message: '请上传文件',
    },
  ],
  ['files[1]']: [
    {
      required: true,
      message: '请上传文件',
    },
  ],
  ['files[2]']: [
    {
      required: true,
      message: '请上传文件',
    },
  ],
  ['files[3]']: [
    {
      required: true,
      message: '请上传文件',
    },
  ],
}

const copy = () => {
  model.value = JSON.parse(JSON.stringify(props.info))
}
const onSubmit: FormProps['onSubmit'] = async ({ validateResult, firstError }) => {
  if (validateResult === true) {
    emit('submit')
  } else {
    console.log('Validate Errors: ', firstError, validateResult)
    MessagePlugin.warning(firstError || '')
  }
}
</script>
<style scoped></style>
