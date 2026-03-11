<template>
  <div class="app-shell">
    <header class="site-header">
      <div class="container shell-row">
        <RouterLink class="brand-mark" to="/">
          <span class="brand-mark__dot"></span>
          <span>VTool</span>
        </RouterLink>

        <nav class="top-nav" aria-label="Primary">
          <RouterLink class="top-nav__link" to="/">首页</RouterLink>
          <RouterLink class="top-nav__link" to="/tools/timestamp"
            >时间戳转换</RouterLink
          >
        </nav>
      </div>
    </header>

    <main class="container page-frame">
      <RouterView v-slot="{ Component, route }">
        <Transition mode="out-in" name="page-fade">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </main>

    <footer class="site-footer">
      <div class="container footer-row">
        <div>
          <p class="footer-row__title">VTool</p>
          <p class="footer-row__text">
            现代化工具集合，先把常用能力做得清晰、快速、好看。
          </p>
        </div>
        <p class="footer-row__text">
          Built with Vue 3, Vite, TypeScript and pnpm.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>
