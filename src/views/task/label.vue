<template>
  <div
    style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%"
  >
    <div
      style="
        padding: 0 64px 64px 64px;
        border-radius: 12px;
        background-color: #fff;
        display: flex;
        flex-direction: column;
        align-items: center;
      "
    >
      <div style="align-self: flex-start; margin: 44px 0; font-size: 20px">
        当前任务：{{ title }}<span style="margin-left: 16px">待处理任务：{{ num }}</span
        ><span
          style="margin-left: 16px; color: var(--td-brand-color); cursor: pointer"
          @click="help"
          >指令</span
        >
      </div>
      <t-steps v-model="step" theme="dot" readonly>
        <t-step-item title="01" />
        <t-step-item title="02" />
        <t-step-item title="03" />
        <t-step-item title="04" />
      </t-steps>
      <div style="width: 65vw; margin: 40px 0">
        <v-md-editor v-model="text" height="50vh"></v-md-editor>
      </div>
      <t-space style="align-self: flex-end">
        <t-button v-if="step !== 0" @click="pre" theme="default">上一步</t-button>
        <t-button theme="default" @click="showDialog = true">对比</t-button>
        <t-button @click="next">{{ step === 3 ? '提交' : '下一步' }}</t-button>
      </t-space>
    </div>
    <t-dialog v-model:visible="showDialog" width="80%" :footer="false" header="对比">
      <div style="width: 100%; height: 60vh; overflow-y: scroll">
        <Diff :prev="originFileValue" :current="text" mode="unified" theme="custom"></Diff>
      </div>
    </t-dialog>
    <t-dialog v-model:visible="showHelpDialog" width="80%" :footer="false" header="指令">
      <div style="width: 100%; height: 60vh; overflow-y: scroll">
        <v-md-preview :text="helpText"></v-md-preview>
      </div>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import { cgi } from '@/utils/cgi'
import { MessagePlugin, TabPanel } from 'tdesign-vue-next'
import { nextTick, onMounted, ref, withCtx } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const taskId = ref(0)
const step = ref(0)

const title = ref('')
const num = ref('')
const nextId = ref(0)
const originFiles = ref<string[]>([])
const files = ref<string[]>([])
const originFileValue = ref('')
const fileValue = ref('')
const text = ref('')

const labelFiles = ref<string[]>([])
const showDialog = ref(false)

const getFileInfo = async (id: string) => {
  const resp = await cgi.get(`/cgi/file/${id}`)
  return String(resp.data)
}

const showHelpDialog = ref(false)
const helpText = ref('')
const help = async () => {
  helpText.value = await getFileInfo(`readme-0${step.value + 1}.md`)
  showHelpDialog.value = true
}

const setTextInit = async () => {
  originFileValue.value = await getFileInfo(originFiles.value[step.value])
  const id = files.value[step.value]
  fileValue.value = await getFileInfo(id)
  const labelId = labelFiles.value[step.value]
  if (labelId) {
    text.value = await getFileInfo(labelId)
  } else {
    text.value = fileValue.value
  }
}

const save = async () => {
  const resp = await cgi.post(`/cgi/task/${taskId.value}/save`, { files: labelFiles.value })
  if (resp.data.code !== 0) {
    MessagePlugin.warning('保存失败，请稍后重试')
    return false
  }
  return true
}

const pre = async () => {
  if (!(await save())) {
    return
  }
  step.value = step.value - 1
  setTextInit()
}

const next = async () => {
  const resp = await cgi.put('/cgi/file', { content: text.value })
  labelFiles.value[step.value] = resp.data.id
  if (step.value === 3) {
    submit()
    return
  }
  if (!(await save())) {
    return
  }
  step.value = step.value + 1
  setTextInit()
}
const submit = async () => {
  const resp = await cgi.post(`/cgi/task/${taskId.value}/apply`, { files: labelFiles.value })
  if (resp.data.code !== 0) {
    MessagePlugin.warning('提交申请失败，请稍后重试')
    return
  }
  MessagePlugin.success(nextId.value ? '已提交申请，自动跳转下一个任务' : '已提交申请')
  setTimeout(() => {
    if (nextId.value) {
      nextTask()
    } else {
      window.close()
    }
  }, 1000)
}

const nextTask = () => {
  router.replace({
    path: '/task/label',
    query: {
      taskId: nextId.value,
    },
  })
  taskId.value = nextId.value
  step.value = 0
  load()
}

const load = async () => {
  const resp = await cgi.get(`/cgi/task/${taskId.value}/label`)
  originFiles.value = resp.data.task.info.files
  files.value = resp.data.task.info.files.map((item: any, index: number) => {
    const label = resp.data.task.labelInfo?.files?.[index]
    return label || item
  })
  title.value = resp.data.task.title
  num.value = resp.data.lock
  nextId.value = resp.data.next
  setTextInit()
}

onMounted(() => {
  taskId.value = Number(route.query.taskId)
  load()
})
</script>
<style scoped></style>
