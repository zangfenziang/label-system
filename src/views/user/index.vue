<template>
  <div style="margin: 24px">
    <t-space style="margin-bottom: 12px">
      <t-button @click="showInsertDialog = true">新增</t-button>
    </t-space>
    <t-table row-key="uid" :data="list" :columns="columns" bordered>
      <template #status="{ row }">
        <t-space>
          {{ row.status === UserStatus.Active ? '生效中' : '禁用中' }}
          <t-link
            theme="primary"
            hover="color"
            @click="
              update(row, {
                status: row.status === UserStatus.Active ? UserStatus.Inactive : UserStatus.Active,
              })
            "
            >{{ row.status === UserStatus.Active ? '禁用' : '解禁' }}</t-link
          >
        </t-space>
      </template>
      <template #level="{ row }">
        <t-dropdown
          :options="levelOptions"
          @click="(item: any) => update(row, { level: item.value })"
        >
          <t-link hover="color">
            {{ levelOptions.find((item) => item.value === row.level)?.content }}
            <t-icon name="chevron-down" size="16" style="margin-left: 4px" />
          </t-link>
        </t-dropdown>
      </template>
      <template #opt="{ row }">
        <t-space>
          <t-link theme="primary" hover="color" @click="reset(row)">重置密码</t-link>
          <t-link theme="primary" hover="color" @click="showCost(row)">费用详情</t-link>
          <t-link v-if="row.username !== 'admin'" theme="danger" hover="color" @click="del(row)">
            删除
          </t-link>
        </t-space>
      </template>
    </t-table>

    <t-dialog v-model:visible="showInsertDialog" header="新增成员" :on-confirm="insert">
      <t-form
        ref="form"
        :data="formData"
        :colon="true"
        :label-width="0"
        style="width: 100%; margin-top: 12px"
      >
        <t-form-item name="username">
          <t-input v-model="formData.username" clearable placeholder="请输入账户名">
            <template #prefix-icon>
              <desktop-icon />
            </template>
          </t-input>
        </t-form-item>

        <t-form-item name="level">
          <t-radio-group
            v-model="formData.level"
            :options="levelOptions.map((item) => ({ ...item, label: item.content }))"
          ></t-radio-group>
        </t-form-item>
      </t-form>
    </t-dialog>
    <t-dialog header="费用详情" v-model:visible="costDailogVisible">
      <cost :list="costList" />
    </t-dialog>
  </div>
</template>
<script lang="ts" setup>
import { cgi } from '@/utils/cgi'
import { UserLevel, UserStatus } from '@/utils/enum'
import { MessagePlugin, NotifyPlugin, type TableProps } from 'tdesign-vue-next'
import { DesktopIcon, LockOnIcon } from 'tdesign-icons-vue-next'
import { onMounted, ref, watch } from 'vue'
import { hash } from '@/utils/hash'
import { useRouter } from 'vue-router'
import cost from './cost.vue'
const router = useRouter()

const columns = ref<TableProps['columns']>([
  {
    colKey: 'uid',
    title: 'id',
    width: '100',
  },
  {
    colKey: 'username',
    title: '用户名',
    width: '100',
  },
  {
    colKey: 'status',
    title: '状态',
    width: '100',
  },
  {
    colKey: 'level',
    title: '角色',
    width: '100',
  },
  {
    colKey: 'opt',
    title: '操作',
    width: '80',
  },
])
const levelOptions = [
  {
    content: '用户',
    value: UserLevel.Normal,
  },
  {
    content: '管理员',
    value: UserLevel.Admin,
  },
]

const list = ref<any[]>([])
const fetch = async () => {
  const resp = await cgi.get('/cgi/user')
  list.value = resp.data
}

const update = async (row: any, info: any) => {
  const resp = await cgi.post(`/cgi/user/${row.uid}`, info)
  if (resp.data.code !== 0) {
    MessagePlugin.warning('修改失败，请稍后重试')
    return
  }
  MessagePlugin.success('修改成功')
  fetch()
}

const del = async (row: any) => {
  await cgi.delete(`/cgi/user/${row.uid}`)
  MessagePlugin.success('删除成功')
  fetch()
}

const rand = (length: number) => {
  const lowerCaseLetters = 'abcdefghijklmnopqrstuvwxyz'
  const upperCaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const specialCharacters = '!@#%&?'
  const allCharacters = lowerCaseLetters + upperCaseLetters + specialCharacters

  let password = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allCharacters.length)
    password += allCharacters[randomIndex]
  }

  return password
}

const reset = async (row: any) => {
  const password = rand(16)
  const resp = await cgi.post(`/cgi/user/${row.uid}`, { password })
  if (resp.data.code !== 0) {
    MessagePlugin.warning('修改失败，请稍后重试')
    return
  }
  NotifyPlugin.info({
    title: `用户${row.username}密码已重置`,
    content: `密码：${password}`,
    duration: 0,
    closeBtn: true,
  })
  fetch()
}

const costDailogVisible = ref(false)
const costList = ref<any[]>([])
const showCost = async (row: any) => {
  const resp = await cgi.get(`/cgi/user/${row.uid}/cost`, {})
  costList.value = resp.data
  costDailogVisible.value = true
}

const showInsertDialog = ref(false)
const getInitForm = () => ({
  username: '',
  level: UserLevel.Normal,
})
const formData = ref(getInitForm())
watch(showInsertDialog, () => {
  if (showInsertDialog.value) {
    formData.value = getInitForm()
  }
})
const insert = async () => {
  if (!formData.value.username) {
    MessagePlugin.warning('请输入用户名')
    return
  }
  const password = rand(16)
  const resp = await cgi.put('/cgi/user', {
    ...formData.value,
    password: hash(password),
  })
  if (resp.data.code !== 0) {
    MessagePlugin.warning('添加失败，请稍后重试')
    return
  }
  showInsertDialog.value = false
  NotifyPlugin.info({
    title: `新用户${formData.value.username}已添加`,
    content: `密码：${password}`,
    duration: 0,
    closeBtn: true,
  })
  fetch()
}

onMounted(fetch)
</script>
