<template>
  <t-layout v-if="!publicPage" style="height: 100%">
    <t-header>
      <t-head-menu value="item1" height="120px">
        <template #logo>
          <div style="font-size: 24px">Label System</div>
        </template>
        <template #operations>
          <div style="margin-right: 8px">{{ user.userInfo.username }}</div>
          <a href="javascript:;" @click="logout"
            ><t-icon class="t-menu__operations-icon" name="logout"
          /></a>
        </template>
      </t-head-menu>
    </t-header>
    <t-layout>
      <t-aside style="border-top: 1px solid var(--component-border)">
        <t-menu :value="route.path" theme="light" style="margin-right: 50px" @change="handleChange">
          <t-menu-item value="/task">
            <template #icon>
              <t-icon name="server" />
            </template>
            任务列表
          </t-menu-item>
          <t-menu-item v-if="user.userInfo.level === UserLevel.Admin" value="/user">
            <template #icon>
              <t-icon name="member" />
            </template>
            成员管理
          </t-menu-item>
          <t-menu-item value="/self">
            <template #icon>
              <t-icon name="user-circle" />
            </template>
            个人中心
          </t-menu-item>
        </t-menu>
      </t-aside>
      <t-layout>
        <t-content>
          <RouterView />
        </t-content>
        <t-footer
          >Copyright @ 2019-{{ new Date().getFullYear() }} LYX. All Rights Reserved</t-footer
        >
      </t-layout>
    </t-layout>
  </t-layout>
  <RouterView v-else />
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { RouterView } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'
import { logout } from './utils/cgi'
import { useUserStore } from './stores/user'
import { UserLevel } from './utils/enum'
const route = useRoute()
const router = useRouter()
const publicPage = computed(() => {
  return ['/'].includes(route.path)
})

const user = useUserStore()

const handleChange = (path: string) => {
  router.replace({
    path,
  })
}

watch(
  publicPage,
  async () => {
    if (publicPage.value) {
      return
    }
    user.init()
  },
  {
    immediate: true,
  },
)
</script>

<style scoped></style>
