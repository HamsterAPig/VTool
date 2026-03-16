<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import SectionHeader from '@/components/SectionHeader.vue'
import ToolCard from '@/components/ToolCard.vue'
import { useToolCatalogStore } from '@/stores/toolCatalog'

const toolCatalogStore = useToolCatalogStore()

const tools = computed(() => toolCatalogStore.tools)
const featuredTools = computed(() =>
  tools.value.filter((tool) => tool.status === 'available' && tool.featured),
)
const availableTools = computed(() =>
  tools.value.filter((tool) => tool.status === 'available'),
)
const roadmapTools = computed(() =>
  tools.value.filter((tool) => tool.status === 'coming-soon'),
)
const readyCount = computed(() => availableTools.value.length)
const roadmapCount = computed(() => roadmapTools.value.length)

const designPrinciples = [
  {
    description:
      '输入、结果、复制和说明保持在同一工作区，不把最终动作扔到远处。',
    title: '结果贴近操作',
  },
  {
    description: '每个页面都有自己的快捷键提示，不让用户猜测可键盘化的动作。',
    title: '页面级快捷键',
  },
  {
    description: '同一套逻辑可以切换到三种完全不同的页面皮肤，而不是只换色板。',
    title: '主题即页面样式',
  },
]
</script>

<template>
  <div class="home-page panel-stack">
    <!-- <section class="surface-card-strong home-hero">
      <div class="home-hero__lead">
        <span class="section-kicker">Curated Utility Workspace</span>
        <h1>高频小工具，不该在页面里来回折返。</h1>
        <p class="home-hero__description">
          VTool
          重做为一个任务导向的工作台：输入、选择、结果和复制被重新组织在一起，
          主题切换也不再只是换配色，而是整套不同的页面样式。
        </p>

        <div class="button-row">
          <RouterLink
            class="button button--primary"
            to="/tools/git-commit-helper"
          >
            进入 Git 提交流程
          </RouterLink>
          <RouterLink class="button button--ghost" to="/tools/worktime">
            打开工时台
          </RouterLink>
        </div>
      </div>

      <div class="home-hero__stats">
        <article class="home-hero__metric">
          <span>已完成工作区</span>
          <strong>{{ readyCount }}</strong>
        </article>
        <article class="home-hero__metric">
          <span>规划中的扩展</span>
          <strong>{{ roadmapCount }}</strong>
        </article>
        <article class="home-hero__metric home-hero__metric--wide">
          <span>当前方向</span>
          <strong>高级工具产品 + 页面级快捷键 + 三套主题页样式</strong>
        </article>
      </div>
    </section> -->

    <section class="panel-stack">
      <!-- <SectionHeader
        eyebrow="Featured Workspaces"
        title="优先重构的任务流"
        description="先把高频使用、最容易暴露交互问题的工作区做重。"
      /> -->

      <div class="home-feature-grid">
        <article
          v-for="tool in featuredTools"
          :key="tool.id"
          class="surface-card home-feature-card"
        >
          <p class="home-feature-card__eyebrow">{{ tool.shortcutHint }}</p>
          <div>
            <h3>{{ tool.name }}</h3>
            <p>{{ tool.headline }}</p>
          </div>
          <RouterLink class="button button--primary" :to="tool.path">
            进入工作区
          </RouterLink>
        </article>
      </div>
    </section>

    <section class="panel-stack">
      <SectionHeader
        eyebrow="Tool Directory"
        title="可直接投入使用的工具"
        description="保留现有业务能力，但用新的结构与视觉把主操作流收回来。"
      />

      <div class="tool-grid">
        <ToolCard v-for="tool in availableTools" :key="tool.id" :tool="tool" />
      </div>
    </section>

    <section class="home-principles">
      <article
        v-for="item in designPrinciples"
        :key="item.title"
        class="surface-card home-principle-card"
      >
        <span class="section-kicker">Design Principle</span>
        <h3>{{ item.title }}</h3>
        <p>{{ item.description }}</p>
      </article>
    </section>

    <!-- <section class="panel-stack">
      <SectionHeader
        eyebrow="Roadmap"
        title="下一批工具位"
        description="先把基础壳层和操作模式做稳，再扩展 JSON、文本等数据处理能力。"
      />

      <div class="tool-grid">
        <ToolCard v-for="tool in roadmapTools" :key="tool.id" :tool="tool" />
      </div>
    </section> -->
  </div>
</template>
