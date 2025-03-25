import './assets/main.css'
import 'tdesign-vue-next/es/style/index.css'

import VueDiff from 'vue-diff'
import 'vue-diff/dist/index.css'

// @ts-ignore
import VueMarkdownEditor from '@kangc/v-md-editor'
import '@kangc/v-md-editor/lib/style/base-editor.css'
// @ts-ignore
import VMdPreview from '@kangc/v-md-editor/lib/preview'
import '@kangc/v-md-editor/lib/style/preview.css'
// @ts-ignore
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js'
import '@kangc/v-md-editor/lib/theme/style/vuepress.css'
// @ts-ignore
import Prism from 'prismjs'

VueMarkdownEditor.use(vuepressTheme, {
  Prism,
})
VMdPreview.use(vuepressTheme, {
  Prism,
})

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueDiff)
app.use(VueMarkdownEditor)
app.use(VMdPreview)

app.mount('#app')
