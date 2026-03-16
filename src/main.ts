import { createPinia } from 'pinia'
import { createApp } from 'vue'

import '@fontsource-variable/manrope/wght.css'
import '@fontsource-variable/outfit/wght.css'
import 'uno.css'

import App from '@/app/App.vue'
import { router, updateDocumentTitle } from '@/router'
import {
  applyThemeToDocument,
  loadThemePreference,
} from '@/stores/themePreference'
import '@/styles/main.scss'

applyThemeToDocument(loadThemePreference())

const app = createApp(App)

app.use(createPinia())
app.use(router)

router.isReady().then(() => {
  updateDocumentTitle()
  app.mount('#app')
})
