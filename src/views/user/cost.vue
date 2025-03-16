<template>
  <div>
    <div>总费用：{{ totalCost }} 总任务：{{ props.list.length }}条</div>
    <t-table row-key="time" :data="renderList" :columns="columns" bordered></t-table>
  </div>
</template>
<script setup lang="ts">
import type { TableProps } from 'tdesign-vue-next'
import { computed, ref } from 'vue'

const props = defineProps<{ list: any[] }>()

const columns = ref<TableProps['columns']>([
  {
    colKey: 'time',
    title: '时间',
    width: '100',
  },
  {
    colKey: 'cost',
    title: '费用',
    width: '100',
  },
])
const renderList = computed(() => {
  const ret = props.list.reduce((pre: any, cur) => {
    const d = new Date(cur.finishTime)
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`
    const cost = cur.cost
    if (!pre[key]) {
      pre[key] = {
        all: 0,
        list: [],
      }
    }
    pre[key].all += cost
    pre[key].list.push(cur)
    return pre
  }, {})
  return Object.keys(ret).map((key) => {
    return {
      time: key,
      cost: ret[key].all,
    }
  })
})

const totalCost = computed(() => {
  return props.list.reduce((pre: number, cur) => {
    return pre + cur.cost
  }, 0)
})
</script>
<style scoped></style>
