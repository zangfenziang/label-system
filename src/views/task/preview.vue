<template>
  <div style="margin: 20px; width: calc(100% - 40px)">
    <t-button theme="primary" @click="openDrawer">First Step</t-button>
    <div style="height: 72vh; margin-top: 10px">
      <iframe
        ref="iframe"
        style="width: 100%; height: 100%; border: none"
        :src="isProd() ? '/threejs' : 'http://localhost:5174/'"
      />
    </div>
    <t-drawer v-model:visible="showDrawer" size="80%">
      <v-md-editor v-model="firstValue" height="100%"></v-md-editor>
      <template #footer>
        <t-space>
          <t-button theme="default" @click="showDialog = true">对比</t-button>
          <t-button @click="saveFirst">保存</t-button>
        </t-space>
      </template>
    </t-drawer>
    <t-dialog v-model:visible="showDialog" width="80%" :footer="false" header="对比">
      <div style="width: 100%; height: 60vh; overflow-y: scroll">
        <Diff :prev="originFirstValue" :current="firstValue" mode="unified" theme="custom"></Diff>
      </div>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import { cgi } from '@/utils/cgi'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { isProd } from '@/utils/const'
import { MessagePlugin } from 'tdesign-vue-next'

const route = useRoute()
const taskId = ref(0)
const files = ref<string[]>([])
const title = ref('')
const num = ref(0)
const nextId = ref('')
const iframe = ref()
let contentWindow: any
const iframeReady = ref(false)
const iframeData = ref<any>(null)
const showDrawer = ref(false)
const originFirstValue = ref('')
const firstValue = ref('')
const showDialog = ref(false)

watch(
  () => [iframeReady.value, iframeData.value],
  () => {
    if (iframeReady.value && iframeData.value) {
      contentWindow.postMessage(
        JSON.stringify({
          event: 'init',
          data: iframeData.value,
        }),
        '*',
      )
    }
  },
)

const getFileInfo = async (id: string) => {
  const resp = await cgi.get(`/cgi/file/${id}`)
  return String(resp.data)
}

const openDrawer = async () => {
  firstValue.value = await getFileInfo(files.value[0])
  showDrawer.value = true
}

const load = async () => {
  const resp = await cgi.get(`/cgi/task/${taskId.value}/label`)
  originFirstValue.value = await getFileInfo(resp.data.task.info.files[0])
  files.value = resp.data.task.info.files.map((item: any, index: number) => {
    const label = resp.data.task.labelInfo?.files?.[index]
    return label || item
  })
  title.value = resp.data.task.title
  num.value = resp.data.lock
  nextId.value = resp.data.next
  const result = await cgi.post('/cgi/file/conv', {
    files: files.value,
  })
  iframeData.value = result.data
}

const uploadFile = async (content: string) => {
  const resp = await cgi.put('/cgi/file', { content })
  return resp.data.id
}
const save = async (files: string[]) => {
  const resp = await cgi.post(`/cgi/task/${taskId.value}/save`, { files })
  if (resp.data.code !== 0) {
    MessagePlugin.warning('保存失败，请稍后重试')
    return false
  }
  return true
}

const saveFirst = async () => {
  const id = await uploadFile(firstValue.value)
  const arr = [id, ...files.value.slice(1)]
  const ret = await save(arr)
  if (ret) {
    files.value = arr
    showDrawer.value = false
  }
}

onMounted(() => {
  contentWindow = iframe.value.contentWindow
  window.addEventListener('message', (e: any) => {
    if (typeof e.data !== 'string') {
      return
    }
    try {
      const data = JSON.parse(e.data)
      if (data.event === 'ready') {
        iframeReady.value = true
      }
    } catch (err) {
      console.error(e)
    }
  })
  taskId.value = Number(route.query.taskId)
  load()
})
</script>
