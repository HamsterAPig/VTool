<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import type { ToolDefinition } from '@/types/tool'

const props = defineProps<{
  tool: ToolDefinition
}>()

const isAvailable = computed(() => props.tool.status === 'available')
</script>

<template>
  <article class="tool-card">
    <div class="tool-card__content">
      <div class="tool-card__meta">
        <span class="tool-card__status" :data-state="tool.status">
          {{ isAvailable ? '可用' : '即将推出' }}
        </span>
        <ul class="tool-card__tags">
          <li v-for="tag in tool.tags" :key="tag">{{ tag }}</li>
        </ul>
      </div>

      <div class="tool-card__copy">
        <h3>{{ tool.name }}</h3>
        <p>{{ tool.description }}</p>
      </div>
    </div>

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
