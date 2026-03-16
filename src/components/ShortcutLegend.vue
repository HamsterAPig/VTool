<script setup lang="ts">
interface ShortcutLegendItem {
  description: string
  keys: string
}

defineProps<{
  eyebrow?: string
  title: string
  items: ShortcutLegendItem[]
}>()
</script>

<template>
  <section class="surface-card shortcut-legend">
    <p v-if="eyebrow" class="shortcut-legend__eyebrow">{{ eyebrow }}</p>
    <h3>{{ title }}</h3>
    <ul class="shortcut-legend__list">
      <li v-for="item in items" :key="`${item.keys}-${item.description}`">
        <span class="shortcut-legend__keys">{{ item.keys }}</span>
        <span>{{ item.description }}</span>
      </li>
    </ul>
  </section>
</template>
