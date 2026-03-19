<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import SectionHeader from '@/components/SectionHeader.vue'
import ToolCard from '@/components/ToolCard.vue'
import { useThemePreferenceStore } from '@/stores/themePreference'
import { useToolCatalogStore } from '@/stores/toolCatalog'

const toolCatalogStore = useToolCatalogStore()
const themePreferenceStore = useThemePreferenceStore()

const heroCardTags = ['Pinned Workspace', 'Keyboard Ready', 'Quick Launch']
const heroCardDepths = ['front', 'mid', 'back'] as const
const heroMotionDefaults = {
  pointerX: 50,
  pointerY: 38,
  shiftX: 0,
  shiftY: 0,
}

const tools = computed(() => toolCatalogStore.tools)
const currentTheme = computed(() => themePreferenceStore.currentTheme)
const themeCount = computed(() => themePreferenceStore.availableThemes.length)
const featuredTools = computed(() =>
  tools.value.filter((tool) => tool.status === 'available' && tool.featured),
)
const availableTools = computed(() =>
  tools.value.filter((tool) => tool.status === 'available'),
)
const isIos18Theme = computed(
  () => themePreferenceStore.currentThemeId === 'ios-18',
)
const heroMotion = ref({ ...heroMotionDefaults })

const heroEyebrow = computed(() =>
  isIos18Theme.value ? 'Liquid Glass Workspace' : 'Curated Utility Workspace',
)
const heroTitle = computed(() =>
  isIos18Theme.value
    ? '像 iOS 18 一样轻盈，但仍是高频工具工作台。'
    : '把高频小工具收拢到一套可切换主题的工作台。',
)
const heroDescription = computed(() =>
  isIos18Theme.value
    ? '新主题把导航、主题切换和首页展示区重做成液态玻璃式界面：保留工具产品的信息密度，同时加入分层卡片、柔和景深与轻量指针交互。'
    : 'VTool 把输入、结果、复制和说明重新组织在同一块工作区里，主题切换也不仅是换色，而是整套页面气质和布局表达的切换。',
)
const heroPills = computed(() =>
  isIos18Theme.value
    ? ['Liquid Glass', 'Depth Layers', 'Subtle Motion']
    : ['工具工作台', '主题切换', '键盘优先'],
)
const heroMetrics = computed(() => [
  {
    label: '已上线工作区',
    note: '输入、结果与复制保持在同一界面内闭环。',
    value: String(availableTools.value.length),
  },
  {
    label: '主题皮肤',
    note: '布局、配色和交互反馈一起变化。',
    value: String(themeCount.value),
  },
  {
    label: '当前风格',
    note: currentTheme.value.family,
    value: currentTheme.value.label,
  },
])
const heroShowcaseCards = computed(() =>
  featuredTools.value.slice(0, 3).map((tool, index) => ({
    depth: heroCardDepths[index] ?? 'mid',
    path: tool.path,
    shortcutHint: tool.shortcutHint,
    tag: heroCardTags[index] ?? 'Workspace',
    title: tool.name,
    description: tool.headline,
  })),
)
const heroDockItems = computed(() => [
  {
    label: 'Theme',
    note: currentTheme.value.label,
    value: currentTheme.value.family,
  },
  {
    label: 'Focus',
    note: '首页优先展示高频任务流。',
    value: `${featuredTools.value.length} 个精选`,
  },
  {
    label: 'Interaction',
    note: isIos18Theme.value
      ? '桌面端启用轻量视差与浮层反馈。'
      : '保留克制的悬浮和切换反馈。',
    value: isIos18Theme.value ? 'Fluid Glass' : 'Balanced Motion',
  },
])
const heroStyle = computed(() => ({
  '--hero-pointer-x': `${heroMotion.value.pointerX}%`,
  '--hero-pointer-y': `${heroMotion.value.pointerY}%`,
  '--hero-shift-x': `${heroMotion.value.shiftX}px`,
  '--hero-shift-y': `${heroMotion.value.shiftY}px`,
}))

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
    description: '同一套逻辑现在可切换到四种不同页面皮肤，而不是只换一组色板。',
    title: '主题即页面样式',
  },
]

function supportsHeroMotion() {
  if (typeof window === 'undefined') {
    return false
  }

  const prefersReducedMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const hasFinePointer =
    typeof window.matchMedia !== 'function' ||
    window.matchMedia('(pointer: fine)').matches

  return isIos18Theme.value && !prefersReducedMotion && hasFinePointer
}

function resetHeroMotion() {
  heroMotion.value = { ...heroMotionDefaults }
}

function handleHeroPointerMove(event: PointerEvent) {
  if (!supportsHeroMotion()) {
    return
  }

  const currentTarget = event.currentTarget as HTMLElement | null

  if (!currentTarget) {
    return
  }

  const rect = currentTarget.getBoundingClientRect()

  if (rect.width <= 0 || rect.height <= 0) {
    return
  }

  const relativeX = (event.clientX - rect.left) / rect.width
  const relativeY = (event.clientY - rect.top) / rect.height
  const pointerX = Math.min(1, Math.max(0, relativeX))
  const pointerY = Math.min(1, Math.max(0, relativeY))

  heroMotion.value = {
    pointerX: Math.round(pointerX * 100),
    pointerY: Math.round(pointerY * 100),
    shiftX: Number(((pointerX - 0.5) * 30).toFixed(2)),
    shiftY: Number(((pointerY - 0.5) * 24).toFixed(2)),
  }
}
</script>

<template>
  <div class="home-page panel-stack">
    <section
      class="surface-card-strong home-hero"
      :data-hero-variant="isIos18Theme ? 'ios-18' : 'default'"
      :style="heroStyle"
      @pointerleave="resetHeroMotion"
      @pointermove="handleHeroPointerMove"
    >
      <div class="home-hero__lead">
        <div class="home-hero__header">
          <span class="section-kicker">{{ heroEyebrow }}</span>
          <span class="home-hero__theme-note">
            {{ currentTheme.label }} / {{ currentTheme.family }}
          </span>
        </div>

        <h1>{{ heroTitle }}</h1>
        <p class="home-hero__description">
          {{ heroDescription }}
        </p>

        <div class="home-hero__pill-row">
          <span v-for="pill in heroPills" :key="pill" class="home-hero__pill">
            {{ pill }}
          </span>
        </div>

        <div class="home-hero__actions">
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

        <div class="home-hero__stats">
          <article
            v-for="metric in heroMetrics"
            :key="metric.label"
            class="home-hero__metric"
          >
            <span>{{ metric.label }}</span>
            <strong>{{ metric.value }}</strong>
            <span class="home-hero__metric-note">{{ metric.note }}</span>
          </article>
        </div>
      </div>

      <div class="home-hero__showcase">
        <div class="home-hero__spotlight"></div>

        <div class="home-hero__showcase-grid">
          <article
            v-for="card in heroShowcaseCards"
            :key="card.title"
            class="home-hero__glass-card"
            :data-depth="card.depth"
          >
            <span class="home-hero__glass-card-tag">{{ card.tag }}</span>
            <div class="home-hero__glass-card-copy">
              <strong>{{ card.title }}</strong>
              <p>{{ card.description }}</p>
            </div>
            <span class="home-hero__glass-card-meta">{{
              card.shortcutHint
            }}</span>
            <RouterLink class="home-hero__glass-card-link" :to="card.path">
              打开工作区
            </RouterLink>
          </article>
        </div>

        <div class="home-hero__dock">
          <article
            v-for="item in heroDockItems"
            :key="item.label"
            class="home-hero__dock-item"
          >
            <span class="home-hero__dock-label">{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
            <small>{{ item.note }}</small>
          </article>
        </div>
      </div>
    </section>

    <section class="panel-stack">
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
  </div>
</template>
