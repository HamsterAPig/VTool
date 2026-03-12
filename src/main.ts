import { createPinia } from 'pinia'
import { createApp } from 'vue'

import '@fontsource-variable/manrope/wght.css'
import '@fontsource/noto-sans-sc/chinese-simplified-400.css'
import '@fontsource/noto-sans-sc/chinese-simplified-500.css'
import '@fontsource/noto-sans-sc/chinese-simplified-700.css'
import '@fontsource/noto-serif-sc/chinese-simplified-600.css'
import '@fontsource/noto-serif-sc/chinese-simplified-700.css'

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
