<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  description: string
}>()
</script>

<template>
  <header class="section-header">
    <p class="section-header__eyebrow">{{ eyebrow }}</p>
    <h2>{{ title }}</h2>
    <p class="section-header__description">{{ description }}</p>
  </header>
</template>
