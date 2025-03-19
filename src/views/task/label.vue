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
        当前任务：{{ title }}<span style="margin-left: 16px">待处理任务：{{ num }}</span>
      </div>
      <t-steps v-model="step" theme="dot" readonly>
        <t-step-item title="01" />
        <t-step-item title="02" />
        <t-step-item title="03" />
        <t-step-item title="04" />
      </t-steps>
      <div
        ref="calc"
        style="
          position: fixed;
          font-size: 14px;
          line-height: 18px;
          font-family: PingFang SC;
          white-space: pre;
          top: -10000px;
        "
      >
        {{ text }}
      </div>
      <div
        style="
          margin: 40px 0;
          width: 800px;
          height: 40vh;
          overflow-x: scroll;
          border-radius: 4px;
          border: 1px solid var(--td-brand-color);
          padding: 8px;
        "
      >
        <textarea
          v-model="text"
          style="
            height: 100%;
            border: none;
            outline: none;
            resize: none;
            font-size: 14px;
            line-height: 18px;
            font-family: PingFang SC;
            padding: 0;
            min-width: 100%;
          "
          :style="{ width: `${width}px` }"
          @input="calcTextareaWidth"
        ></textarea>
      </div>
      <t-space style="align-self: flex-end">
        <t-button v-if="step !== 0" @click="pre" theme="default">上一步</t-button>
        <t-button theme="default" @click="showDialog = true">对比</t-button>
        <t-button @click="next">{{ step === 3 ? '提交' : '下一步' }}</t-button>
      </t-space>
    </div>
    <t-dialog v-model:visible="showDialog" width="80%" :footer="false" header="对比">
      <div style="width: 100%; height: 60vh; overflow-y: scroll">
        <Diff :prev="fileValue" :current="text" mode="unified" theme="custom"></Diff>
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
const files = ref<string[]>([])
const fileValue = ref('')
const text = ref('')

const labelFiles = ref<string[]>([])
const showDialog = ref(false)

const width = ref(10000)
const calc = ref()
const calcTextareaWidth = () => {
  console.log(calc.value.offsetWidth)
  width.value = calc.value.offsetWidth + 2
}

const getFileInfo = async (id: string) => {
  const resp = await cgi.get(`/cgi/file/${id}`)
  return resp.data
}

const setTextInit = async () => {
  const id = files.value[step.value]
  fileValue.value = await getFileInfo(id)
  const labelId = labelFiles.value[step.value]
  if (labelId) {
    text.value = await getFileInfo(labelId)
  } else {
    text.value = fileValue.value
  }
  nextTick(() => {
    calcTextareaWidth()
  })
}

const pre = () => {
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
  step.value = step.value + 1
  setTextInit()
}
const submit = async () => {
  const resp = await cgi.post(`/cgi/task/${taskId.value}/apply`, { files: labelFiles.value })
  if (resp.data.code !== 0) {
    MessagePlugin.warning('提交申请失败，请稍后重试')
    return
  }
  MessagePlugin.success('已提交申请，自动跳转下一个任务')
  if (nextId.value) {
    nextTask()
  } else {
    window.close()
  }
}

const nextTask = () => {
  router.replace({
    path: '/task/label',
    query: {
      taskId: nextId.value,
    },
  })
  step.value = 0
  load()
}

const load = async () => {
  taskId.value = Number(route.query.taskId)
  const resp = await cgi.get(`/cgi/task/${taskId.value}/label`)
  files.value = resp.data.task.info.files
  title.value = resp.data.task.title
  num.value = resp.data.lock
  nextId.value = resp.data.next
  setTextInit()
}

onMounted(() => load())
</script>
<style scoped></style>
