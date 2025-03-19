import './assets/main.css'
import 'tdesign-vue-next/es/style/index.css'

import VueDiff from 'vue-diff'
import 'vue-diff/dist/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueDiff)

app.mount('#app')
