<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import type { ToolDefinition } from '@/types/tool'

const props = defineProps<{
  tool: ToolDefinition
}>()

const isAvailable = computed(() => props.tool.status === 'available')

const categoryLabelMap = {
  data: '数据处理',
  time: '时间工具',
  workflow: '开发流程',
} satisfies Record<ToolDefinition['category'], string>

const categoryLabel = computed(() => categoryLabelMap[props.tool.category])
</script>

<template>
  <article
    class="tool-card"
    :data-category="tool.category"
    :data-featured="tool.featured ? 'true' : 'false'"
  >
    <div class="tool-card__meta">
      <span class="tool-card__status" :data-state="tool.status">
        {{ isAvailable ? '可用' : '即将推出' }}
      </span>
      <span class="tool-card__category">{{ categoryLabel }}</span>
    </div>

    <div class="tool-card__copy">
      <p class="tool-card__headline">{{ tool.headline }}</p>
      <h3>{{ tool.name }}</h3>
      <p>{{ tool.description }}</p>
    </div>

    <p class="tool-card__shortcut">{{ tool.shortcutHint }}</p>

    <ul class="tool-card__tags">
      <li v-for="tag in tool.tags" :key="tag">{{ tag }}</li>
    </ul>

    <RouterLink
      v-if="isAvailable"
      class="button button--primary"
      :to="tool.path"
    >
      进入工具
    </RouterLink>
    <span v-else class="button button--ghost button--disabled">敬请期待</span>
  </article>
</template>
