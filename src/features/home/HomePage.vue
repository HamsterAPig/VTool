<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import SectionHeader from '@/components/SectionHeader.vue'
import ToolCard from '@/components/ToolCard.vue'
import { useToolCatalogStore } from '@/stores/toolCatalog'

const toolCatalogStore = useToolCatalogStore()

const tools = computed(() => toolCatalogStore.tools)
const readyCount = computed(
  () =>
    toolCatalogStore.tools.filter((tool) => tool.status === 'available').length,
)
</script>

<template>
  <div class="home-page">
    <section class="hero-panel">
      <div class="hero-panel__copy">
        <span class="hero-badge">Curated Utility Workspace</span>
        <h1>把常用工具做得更顺手，也更好看。</h1>
        <p class="hero-panel__description">
          VTool 是一个面向开发和日常效率场景的工具站。当前已提供 Git
          提交辅助、工时日历、时间戳转换和时间 /
          频率换算，并支持在不同主题下保持一致的浏览与操作体验。
        </p>

        <div class="hero-panel__actions">
          <RouterLink class="button button--primary" to="/tools/worktime">
            立即使用工时日历
          </RouterLink>
          <RouterLink class="button button--ghost" to="/tools/time-frequency">
            打开时间 / 频率换算
          </RouterLink>
        </div>
      </div>

      <aside class="hero-panel__aside">
        <div class="hero-stat">
          <span>首版可用工具</span>
          <strong>{{ readyCount }}</strong>
        </div>
        <div class="hero-stat">
          <span>计划中的工具方向</span>
          <strong>{{ tools.length }}</strong>
        </div>
        <p class="hero-panel__note">
          顶部现已支持主题切换，分别提供冷白科技、玉色雅室和玫瑰实验室三种精致浅色方案。
        </p>
      </aside>
    </section>

    <section id="tool-grid" class="content-section">
      <SectionHeader
        eyebrow="Tool Directory"
        title="从首页直接进入具体工具"
        description="当前优先交付高频、可立即使用的小工具。每个工具都保持统一壳层、统一视觉、统一交互节奏。"
      />

      <div class="tool-grid">
        <ToolCard v-for="tool in tools" :key="tool.id" :tool="tool" />
      </div>
    </section>
  </div>
</template>
