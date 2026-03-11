import { createPinia } from 'pinia'
import { createApp } from 'vue'

import '@fontsource-variable/outfit/wght.css'

import App from '@/app/App.vue'
import { router, updateDocumentTitle } from '@/router'
import '@/styles/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

router.isReady().then(() => {
  updateDocumentTitle()
  app.mount('#app')
})
