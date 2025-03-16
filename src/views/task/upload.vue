<template>
  <t-upload
    v-model="files"
    theme="file"
    :disabled="props.disabled"
    :requestMethod="requestMethod"
    :show-image-file-name="true"
    :size-limit="{ size: props.size || 5, unit: 'MB', message: '图片大小不超过 {sizeLimit} MB' }"
  ></t-upload>
</template>
<script lang="ts" setup>
import { cgi } from '@/utils/cgi'
import type { UploadFile, UploadProps } from 'tdesign-vue-next'
import { ref, watch } from 'vue'

const props = defineProps<{
  size?: number
  disabled?: boolean
}>()
const model = defineModel<string>()

const files = ref<UploadProps['value']>([])

const requestMethod: UploadProps['requestMethod'] = async (file: UploadFile) => {
  const reader = new FileReader()
  const content = await new Promise((res) => {
    reader.onload = (e) => {
      res(e?.target?.result)
    }
    reader.readAsText(file.raw as Blob)
  })
  const resp = await cgi.put('/cgi/file', { content })
  const id: string = resp.data.id
  if (resp.data.code !== 0) {
    return { status: 'fail', response: {} }
  }
  return {
    status: 'success',
    response: {
      id,
      files: [file],
    },
  }
}

watch(
  model,
  async () => {
    if (model.value === files.value?.[0]?.response?.id) {
      return
    }
    if (model.value) {
      files.value = [
        {
          status: 'success',
          response: {
            id: model.value,
          },
        },
      ]
    } else {
      files.value = []
    }
  },
  {
    immediate: true,
  },
)

watch(files, () => {
  const id = files.value?.[0]?.response?.id
  if (model.value === id) {
    return
  }
  if (!model.value && !id) {
    return
  }
  if (id) {
    model.value = id
  } else {
    model.value = ''
  }
})
</script>
<style scoped></style>
