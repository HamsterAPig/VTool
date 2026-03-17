/*
 * @Author: HamsterAPig
 * @Date: 2026-03-17 07:05:16
 * @LastEditors: HamsterAPig 102395304+HamsterAPig@users.noreply.github.com
 * @LastEditTime: 2026-03-17 07:12:04
 * @FilePath: \VTool\vite.config.ts
 * @Description:
 * Copyright (c) 2026 by HamsterAPig, All Rights Reserved.
 */
import { fileURLToPath, URL } from 'node:url'

import UnoCSS from 'unocss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'
import VueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [vue(), UnoCSS(), VueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
})
