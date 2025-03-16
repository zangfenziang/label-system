<template>
  <t-space direction="vertical" style="margin: 24px">
    <t-space>
      <t-radio-group v-model="status" style="background: #fff">
        <t-radio-button v-for="item in taskTab" :key="item.value" :value="item.value">{{
          item.label
        }}</t-radio-button>
      </t-radio-group>
      <t-button v-if="user.userInfo.level === UserLevel.Admin" @click="insertDialogVisible = true"
        >新增任务</t-button
      >
    </t-space>
    <t-table row-key="taskId" :data="list" :columns="columns">
      <template #info="{ row }">
        <t-space>
          下载：
          <t-link theme="primary" @click="download(row.info.files[0], `${row.taskId}-01.txt`)"
            >01</t-link
          >
          <t-link theme="primary" @click="download(row.info.files[1], `${row.taskId}-02.txt`)"
            >02</t-link
          >
          <t-link theme="primary" @click="download(row.info.files[2], `${row.taskId}-03.txt`)"
            >03</t-link
          >
          <t-link theme="primary" @click="download(row.info.files[3], `${row.taskId}-04.txt`)"
            >04</t-link
          >
        </t-space>
      </template>
      <template #labelInfo="{ row }">
        <div v-if="!row.labelInfo.files.length">暂无</div>
        <t-space v-else>
          下载：
          <t-link theme="primary" @click="download(row.labelInfo.files[0], `${row.taskId}-01.txt`)"
            >01</t-link
          >
          <t-link theme="primary" @click="download(row.labelInfo.files[1], `${row.taskId}-02.txt`)"
            >02</t-link
          >
          <t-link theme="primary" @click="download(row.labelInfo.files[2], `${row.taskId}-03.txt`)"
            >03</t-link
          >
          <t-link theme="primary" @click="download(row.labelInfo.files[3], `${row.taskId}-04.txt`)"
            >04</t-link
          >
        </t-space>
      </template>
      <template #taskStatus="{ row }">
        {{ row?.user?.username }}
        {{ taskTab.find((item) => item.value === row.taskStatus)?.label || '-' }}
      </template>
      <template #opt="{ row }">
        <t-space>
          <template v-for="item in taskStatusOptList[row.taskStatus]">
            <t-link
              v-if="showOpt(item, row)"
              :theme="item.theme || 'primary'"
              hover="color"
              @click="handleEvent(row, item.event)"
              >{{ item.name }}</t-link
            >
          </template>
        </t-space>
      </template>
    </t-table>
    <t-pagination v-model="current" v-model:pageSize="pageSize" :total="total" />
  </t-space>
  <t-dialog v-model:visible="insertDialogVisible" header="新增任务" :footer="null">
    <task-form v-model="insertDialogValue" @submit="handleInsertSubmit" />
  </t-dialog>
  <t-dialog
    v-model:visible="editDialogVisible"
    :header="`修改任务-${editDialogRowId}`"
    :footer="null"
  >
    <task-form v-model="editDialogValue" @submit="handleEditSubmit" />
  </t-dialog>
</template>
<script lang="ts" setup>
import { useUserStore } from '@/stores/user'
import { cgi } from '@/utils/cgi'
import { UserLevel } from '@/utils/enum'
import { onMounted, ref, watch } from 'vue'
import taskForm from './form.vue'
import { getTaskInitFormValue } from './utils'
import { MessagePlugin, type TableProps } from 'tdesign-vue-next'

enum TaskTab {
  Waiting = 'waiting',
  Self = 'self',
  Lock = 'lock',
  Audit = 'audit',
  Accept = 'accept',
  Reject = 'reject',
  All = 'all',
}

const taskTab = [
  {
    value: TaskTab.Waiting,
    label: '待领取',
  },
  {
    value: TaskTab.Self,
    label: '我的',
  },
  {
    value: TaskTab.Lock,
    label: '已领取',
  },
  {
    value: TaskTab.Audit,
    label: '审核中',
  },
  {
    value: TaskTab.Accept,
    label: '审核通过',
  },
  {
    value: TaskTab.Reject,
    label: '审核不通过',
  },
  {
    value: TaskTab.All,
    label: '全部',
  },
]

const taskStatusOptList: any = {
  [TaskTab.Waiting]: [
    {
      name: '领取',
      event: 'lock',
    },
    {
      name: '修改',
      admin: true,
      event: 'edit',
    },
    {
      name: '删除',
      admin: true,
      theme: 'danger',
      event: 'delete',
    },
  ],
  [TaskTab.Lock]: [
    {
      name: '提交审核',
      self: true,
      event: 'apply',
    },
    {
      name: '解锁',
      self: true,
      admin: true,
      event: 'unlock',
    },
    {
      name: '修改',
      admin: true,
      event: 'edit',
    },
    {
      name: '删除',
      admin: true,
      theme: 'danger',
      event: 'delete',
    },
  ],
  [TaskTab.Audit]: [
    {
      name: '撤回审核',
      self: true,
      event: 'withdraw',
    },
    {
      name: '审核通过',
      admin: true,
      event: 'accept',
    },
    {
      name: '审核不通过',
      admin: true,
      event: 'reject',
    },
    {
      name: '修改',
      admin: true,
      event: 'edit',
    },
    {
      name: '删除',
      admin: true,
      theme: 'danger',
      event: 'delete',
    },
  ],
  [TaskTab.Accept]: [
    {
      name: '修改',
      admin: true,
      event: 'edit',
    },
    {
      name: '删除',
      admin: true,
      theme: 'danger',
      event: 'delete',
    },
  ],
  [TaskTab.Reject]: [
    {
      name: '重新提审',
      self: true,
      event: 'apply',
    },
    {
      name: '修改',
      admin: true,
      event: 'edit',
    },
    {
      name: '删除',
      admin: true,
      theme: 'danger',
      event: 'delete',
    },
  ],
}
const showOpt = (item: any, row: any) => {
  if (item.admin && user.userInfo.level === UserLevel.Admin) {
    return true
  }
  if (item.self && row.uid === user.userInfo.uid) {
    return true
  }
  if (!item.admin && !item.self) {
    return true
  }
  return false
}

const columns = ref<TableProps['columns']>([
  {
    colKey: 'taskId',
    title: 'id',
    width: '100',
  },
  {
    colKey: 'title',
    title: '标题',
    width: '100',
  },
  {
    colKey: 'info',
    title: '原始数据',
    width: '150',
  },
  {
    colKey: 'labelInfo',
    title: '修改数据',
    width: '150',
  },
  {
    colKey: 'cost',
    title: '费用',
    width: '80',
  },
  {
    colKey: 'taskStatus',
    title: '状态',
    width: '100',
  },
  {
    colKey: 'opt',
    title: '操作',
    width: '200',
  },
])

const user = useUserStore()
const status = ref(TaskTab.Waiting)
const current = ref(1)
const pageSize = ref(10)
const total = ref(0)
const list = ref<any[]>([])

const fetch = async () => {
  const resp = await cgi.get(
    `/cgi/task?status=${status.value}&pageSize=${pageSize.value}&pageNum=${current.value}`,
  )
  list.value = resp.data.list
  total.value = resp.data.total
}

const insertDialogVisible = ref(false)
const insertDialogValue = ref(getTaskInitFormValue())
watch(insertDialogVisible, () => {
  if (insertDialogVisible.value) {
    insertDialogValue.value = getTaskInitFormValue()
  }
})
const handleInsertSubmit = async () => {
  const resp = await cgi.put('/cgi/task', insertDialogValue.value)
  if (resp.data.code !== 0) {
    MessagePlugin.warning('新增失败，请稍后重试')
    return
  }
  MessagePlugin.success('新增成功')
  insertDialogVisible.value = false
  fetch()
}

const editDialogVisible = ref(false)
const editDialogValue = ref(getTaskInitFormValue())
const editDialogRowId = ref(0)
const handleEditSubmit = async () => {
  const resp = await cgi.post(`/cgi/task/${editDialogRowId.value}`, editDialogValue.value)
  if (resp.data.code !== 0) {
    MessagePlugin.warning('修改失败，请稍后重试')
    return
  }
  MessagePlugin.success('修改成功')
  editDialogVisible.value = false
  fetch()
}

const handleEvent = async (row: any, event: string) => {
  if (event === 'lock') {
    const resp = await cgi.post(`/cgi/task/${row.taskId}/lock`)
    if (resp.data.code !== 0) {
      MessagePlugin.warning('领取失败')
    } else {
      MessagePlugin.success('领取成功')
    }
    fetch()
    return
  } else if (event === 'unlock') {
    const resp = await cgi.post(`/cgi/task/${row.taskId}/unlock`)
    if (resp.data.code !== 0) {
      MessagePlugin.warning('解锁失败')
    } else {
      MessagePlugin.success('解锁成功')
    }
    fetch()
    return
  } else if (event === 'apply') {
  } else if (event === 'withdraw') {
  } else if (event === 'accept') {
  } else if (event === 'reject') {
  } else if (event === 'edit') {
    editDialogVisible.value = true
    editDialogValue.value = JSON.parse(JSON.stringify(row))
    editDialogRowId.value = row.taskId
    return
  } else if (event === 'delete') {
    const resp = await cgi.delete(`/cgi/task/${row.taskId}`)
    if (resp.data.code !== 0) {
      MessagePlugin.warning('删除失败')
    } else {
      MessagePlugin.success('删除成功')
    }
    fetch()
    return
  }
}

const download = async (id: string, name: string) => {
  const resp = await cgi.get(`/cgi/file/${id}`)
  new Blob()

  // 将字符串转换为Blob对象
  const blob = new Blob([resp.data], { type: 'text/plain' })

  // 你可以使用Blob对象，例如创建一个下载链接
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
}

watch(() => [pageSize.value, current.value, status.value], fetch)

onMounted(fetch)
</script>
