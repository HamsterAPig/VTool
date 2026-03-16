<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

import { useThemePreferenceStore } from '@/stores/themePreference'
import type { ThemeId } from '@/features/theme/theme'

const themePreferenceStore = useThemePreferenceStore()

const currentTheme = computed(() => themePreferenceStore.currentTheme)
const themes = computed(() => themePreferenceStore.availableThemes)
const localId = `theme-switcher-${Math.random().toString(36).slice(2, 8)}`
const listboxId = `${localId}-listbox`
const isOpen = ref(false)
const triggerRef = ref<HTMLButtonElement | null>(null)
const panelRef = ref<HTMLDivElement | null>(null)
const panelStyle = ref<Record<string, string>>({})

function updatePanelPosition() {
  const trigger = triggerRef.value

  if (!trigger) {
    return
  }

  const rect = trigger.getBoundingClientRect()
  const viewportPadding = 12
  const panelGap = 10
  const preferredWidth = Math.max(rect.width, 320)
  const width = Math.min(
    window.innerWidth - viewportPadding * 2,
    preferredWidth,
    370,
  )
  const left = Math.min(
    Math.max(viewportPadding, rect.right - width),
    window.innerWidth - width - viewportPadding,
  )
  const spaceBelow = window.innerHeight - rect.bottom - viewportPadding
  const spaceAbove = rect.top - viewportPadding
  const openUpward = spaceBelow < 260 && spaceAbove > spaceBelow
  const availableHeight = openUpward ? spaceAbove : spaceBelow
  const maxHeight = Math.max(160, Math.min(availableHeight - panelGap, 360))

  panelStyle.value = openUpward
    ? {
        bottom: `${window.innerHeight - rect.top + panelGap}px`,
        left: `${left}px`,
        maxHeight: `${maxHeight}px`,
        width: `${width}px`,
      }
    : {
        left: `${left}px`,
        maxHeight: `${maxHeight}px`,
        top: `${rect.bottom + panelGap}px`,
        width: `${width}px`,
      }
}

function closePanel(restoreFocus = false) {
  isOpen.value = false

  if (restoreFocus) {
    nextTick(() => {
      triggerRef.value?.focus()
    })
  }
}

function togglePanel() {
  isOpen.value = !isOpen.value
}

function selectTheme(themeId: ThemeId) {
  themePreferenceStore.setTheme(themeId)
  closePanel(true)
}

function handlePointerDown(event: Event) {
  const target = event.target as Node | null

  if (
    !target ||
    triggerRef.value?.contains(target) ||
    panelRef.value?.contains(target)
  ) {
    return
  }

  closePanel()
}

function handleEscape(event: KeyboardEvent) {
  if (!isOpen.value || event.key !== 'Escape') {
    return
  }

  event.preventDefault()
  closePanel(true)
}

watch(isOpen, async (open) => {
  if (open) {
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    window.addEventListener('resize', updatePanelPosition)
    window.addEventListener('scroll', updatePanelPosition, true)
    await nextTick()
    updatePanelPosition()
    return
  }

  document.removeEventListener('pointerdown', handlePointerDown)
  document.removeEventListener('keydown', handleEscape)
  window.removeEventListener('resize', updatePanelPosition)
  window.removeEventListener('scroll', updatePanelPosition, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handlePointerDown)
  document.removeEventListener('keydown', handleEscape)
  window.removeEventListener('resize', updatePanelPosition)
  window.removeEventListener('scroll', updatePanelPosition, true)
})
</script>

<template>
  <div class="theme-switcher" :data-open="isOpen">
    <button
      ref="triggerRef"
      class="theme-switcher__trigger"
      type="button"
      aria-label="切换主题"
      :aria-controls="listboxId"
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
        <small>{{ currentTheme.family }}</small>
      </span>
      <span class="theme-switcher__chevron"></span>
    </button>

    <Teleport to="body">
      <Transition name="theme-switcher-fade">
        <div
          v-if="isOpen"
          :id="listboxId"
          ref="panelRef"
          class="theme-switcher__panel"
          :style="panelStyle"
          role="listbox"
          aria-label="主题选项"
          tabindex="-1"
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
              <span class="theme-switcher__option-label">{{
                theme.label
              }}</span>
              <span class="theme-switcher__option-description">
                {{ theme.description }}
              </span>
              <span class="theme-switcher__option-signature">
                {{ theme.signature }}
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
    </Teleport>
  </div>
</template>
