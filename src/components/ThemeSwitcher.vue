<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { useThemePreferenceStore } from '@/stores/themePreference'
import type { ThemeId } from '@/features/theme/theme'

const themePreferenceStore = useThemePreferenceStore()

const currentTheme = computed(() => themePreferenceStore.currentTheme)
const themes = computed(() => themePreferenceStore.availableThemes)
const isOpen = ref(false)
const rootElement = ref<HTMLElement | null>(null)

function closePanel() {
  isOpen.value = false
}

function togglePanel() {
  isOpen.value = !isOpen.value
}

function selectTheme(themeId: ThemeId) {
  themePreferenceStore.setTheme(themeId)
  closePanel()
}

function handlePointerDown(event: MouseEvent) {
  if (!rootElement.value) {
    return
  }

  if (!rootElement.value.contains(event.target as Node)) {
    closePanel()
  }
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closePanel()
  }
}

onMounted(() => {
  themePreferenceStore.initialize()
  document.addEventListener('mousedown', handlePointerDown)
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handlePointerDown)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <div
    ref="rootElement"
    class="theme-switcher"
    :data-open="isOpen"
    @keydown.esc="closePanel"
  >
    <button
      class="theme-switcher__trigger"
      type="button"
      aria-label="切换主题"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      @click="togglePanel"
    >
      <span class="theme-switcher__swatches" aria-hidden="true">
        <span
          v-for="theme in themes"
          :key="theme.id"
          class="theme-switcher__swatch"
          :data-theme-swatch="theme.id"
        ></span>
      </span>
      <span class="theme-switcher__copy">
        <span class="theme-switcher__eyebrow">Theme</span>
        <strong>{{ currentTheme.label }}</strong>
      </span>
      <span class="theme-switcher__chevron"></span>
    </button>

    <Transition name="theme-switcher-fade">
      <div
        v-if="isOpen"
        class="theme-switcher__panel"
        role="listbox"
        aria-label="主题选项"
      >
        <button
          v-for="theme in themes"
          :key="theme.id"
          class="theme-switcher__option"
          :class="{
            'theme-switcher__option--active':
              theme.id === themePreferenceStore.currentThemeId,
          }"
          type="button"
          role="option"
          :aria-selected="theme.id === themePreferenceStore.currentThemeId"
          @click="selectTheme(theme.id)"
        >
          <span
            class="theme-switcher__option-preview"
            :data-theme-swatch="theme.id"
          ></span>
          <span class="theme-switcher__option-copy">
            <span class="theme-switcher__option-label">{{ theme.label }}</span>
            <span class="theme-switcher__option-description">
              {{ theme.description }}
            </span>
          </span>
          <span
            v-if="theme.id === themePreferenceStore.currentThemeId"
            class="theme-switcher__option-state"
          >
            当前
          </span>
        </button>
      </div>
    </Transition>
  </div>
</template>
