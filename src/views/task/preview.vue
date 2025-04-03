<template>
  <div style="margin: 20px; width: calc(100% - 40px); height: calc(100% - 40px)">
    <iframe
      ref="iframe"
      style="width: 100%; height: 100%; border: none"
      src="http://localhost:5174/"
    />
  </div>
</template>
<script setup lang="ts">
import { cgi } from '@/utils/cgi'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

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

const load = async () => {
  const resp = await cgi.get(`/cgi/task/${taskId.value}/label`)
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
