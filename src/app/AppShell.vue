<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import { useThemePreferenceStore } from '@/stores/themePreference'

const themePreferenceStore = useThemePreferenceStore()

const navigationItems = [
  {
    label: '工作台',
    to: '/',
  },
  {
    label: 'Git 提交辅助',
    to: '/tools/git-commit-helper',
  },
  {
    label: '工时台',
    to: '/tools/worktime',
  },
  {
    label: '时间换算',
    to: '/tools/time-frequency',
  },
  {
    label: '时间戳',
    to: '/tools/timestamp',
  },
]

const currentTheme = computed(() => themePreferenceStore.currentTheme)

onMounted(() => {
  themePreferenceStore.initialize()
})
</script>

<template>
  <div class="app-shell">
    <div class="app-shell__backdrop"></div>

    <header class="app-shell__header">
      <div class="shell-container panel-stack">
        <div class="surface-card-strong shell-topbar">
          <div class="shell-brand">
            <RouterLink class="brand-mark" to="/">
              <span class="brand-mark__dot"></span>
              <span class="brand-mark__copy">
                <strong>VTool</strong>
                <small>Tool workspace for focused utility flows</small>
              </span>
            </RouterLink>
          </div>

          <nav class="top-nav" aria-label="Primary">
            <RouterLink
              v-for="item in navigationItems"
              :key="item.to"
              class="top-nav__link"
              :to="item.to"
            >
              {{ item.label }}
            </RouterLink>
          </nav>

          <ThemeSwitcher />
        </div>

        <!--  这个元素重复了，先屏蔽掉 -->
        <!-- <div class="surface-card shell-routebar">
          <div class="shell-routebar__copy">
            <span class="section-kicker">{{ routeEyebrow }}</span>
            <div>
              <p class="shell-routebar__title">{{ routeTitle }}</p>
              <p class="shell-routebar__summary">{{ routeSummary }}</p>
            </div>
          </div>

          <div class="shell-routebar__theme">
            <span class="eyebrow-copy">当前页面样式</span>
            <strong>{{ currentTheme.label }}</strong>
            <p>{{ currentTheme.signature }}</p>
          </div>
        </div> -->
      </div>
    </header>

    <main class="shell-container page-stage">
      <RouterView v-slot="{ Component, route: currentRoute }">
        <Transition mode="out-in" name="page-fade">
          <component :is="Component" :key="currentRoute.path" />
        </Transition>
      </RouterView>
    </main>

    <footer class="site-footer">
      <div class="shell-container">
        <div class="surface-card footer-board">
          <div>
            <p class="footer-board__title">VTool</p>
            <p class="footer-board__text">
              静态托管的使用Vue编写的工具页面
            </p>
          </div>

          <div class="footer-board__theme">
            <span class="section-kicker">Theme Skin</span>
            <strong>{{ currentTheme.family }}</strong>
            <p>{{ currentTheme.signature }}</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
