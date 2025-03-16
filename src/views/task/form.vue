<template>
  <t-form
    ref="form"
    :data="model"
    :colon="true"
    :rules="rules"
    @submit="onSubmit"
    style="width: 100%"
  >
    <t-form-item name="title" label="标题">
      <t-input v-model="model.title" clearable> </t-input>
    </t-form-item>

    <!-- <t-form-item name="desc" label="描述">
      <t-textarea v-model="model.desc" clearable> </t-textarea>
    </t-form-item> -->

    <t-form-item name="cost" label="费用">
      <t-input-number v-model="model.cost" />
    </t-form-item>

    <t-form-item name="info.files[0]" label="output-01">
      <Upload v-model="model.info.files[0]" />
    </t-form-item>
    <t-form-item name="info.files[1]" label="output-02">
      <Upload v-model="model.info.files[1]" />
    </t-form-item>
    <t-form-item name="info.files[2]" label="output-03">
      <Upload v-model="model.info.files[2]" />
    </t-form-item>
    <t-form-item name="info.files[3]" label="output-04">
      <Upload v-model="model.info.files[3]" />
    </t-form-item>

    <t-form-item style="margin: 32px 0 0 0">
      <t-button theme="primary" size="large" type="submit" block>确定</t-button>
    </t-form-item>
  </t-form>
</template>
<script setup lang="ts">
import { MessagePlugin, type FormProps } from 'tdesign-vue-next'
import { type TaskFormValue } from './utils'
import Upload from './upload.vue'
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'submit'): void
}>()
const model = defineModel<TaskFormValue>({ required: true })

const rules: FormProps['rules'] = {
  title: [
    {
      required: true,
      message: '请输入标题',
    },
  ],
  desc: [
    {
      required: true,
      message: '请输入描述',
    },
  ],
  cost: [
    {
      required: true,
      message: '请选择费用',
    },
  ],
  ['info.files[0]']: [
    {
      required: true,
      message: '请上传文件',
    },
  ],
  ['info.files[1]']: [
    {
      required: true,
      message: '请上传文件',
    },
  ],
  ['info.files[2]']: [
    {
      required: true,
      message: '请上传文件',
    },
  ],
  ['info.files[3]']: [
    {
      required: true,
      message: '请上传文件',
    },
  ],
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
