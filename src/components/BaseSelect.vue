<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

type SelectValue = string | number

interface SelectOption {
  label: string
  value: SelectValue
  description?: string
}

const props = withDefaults(
  defineProps<{
    id?: string
    modelValue: SelectValue
    options: readonly SelectOption[]
    label?: string
    placeholder?: string
    disabled?: boolean
    maxPanelHeight?: number
  }>(),
  {
    id: undefined,
    label: '',
    placeholder: '请选择',
    disabled: false,
    maxPanelHeight: 320,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: SelectValue]
}>()

const localId = `base-select-${Math.random().toString(36).slice(2, 8)}`
const triggerId = computed(() => props.id ?? `${localId}-trigger`)
const listboxId = `${localId}-listbox`

const triggerRef = ref<HTMLButtonElement | null>(null)
const panelRef = ref<HTMLDivElement | null>(null)
const isOpen = ref(false)
const activeIndex = ref(-1)
const openDirection = ref<'down' | 'up'>('down')
const panelStyle = ref<Record<string, string>>({})

const selectedIndex = computed(() =>
  props.options.findIndex((option) => option.value === props.modelValue),
)

const selectedOption = computed(() =>
  selectedIndex.value >= 0 ? props.options[selectedIndex.value] : null,
)

function syncActiveIndex() {
  activeIndex.value = selectedIndex.value >= 0 ? selectedIndex.value : 0
}

function scrollActiveOptionIntoView() {
  const option = panelRef.value?.querySelector<HTMLElement>(
    `[data-option-index="${activeIndex.value}"]`,
  )

  option?.scrollIntoView?.({ block: 'nearest' })
}

function updatePanelPosition() {
  const trigger = triggerRef.value

  if (!trigger) {
    return
  }

  const rect = trigger.getBoundingClientRect()
  const viewportPadding = 12
  const panelGap = 8
  const width = rect.width
  const left = Math.min(
    Math.max(viewportPadding, rect.left),
    window.innerWidth - width - viewportPadding,
  )
  const spaceBelow = window.innerHeight - rect.bottom - viewportPadding
  const spaceAbove = rect.top - viewportPadding
  const openUpward = spaceBelow < 220 && spaceAbove > spaceBelow
  const maxHeight = Math.max(
    160,
    Math.min(
      props.maxPanelHeight,
      openUpward ? spaceAbove - panelGap : spaceBelow - panelGap,
    ),
  )

  openDirection.value = openUpward ? 'up' : 'down'
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

function openPanel() {
  if (props.disabled || props.options.length === 0) {
    return
  }

  syncActiveIndex()
  isOpen.value = true
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
  if (isOpen.value) {
    closePanel()
    return
  }

  openPanel()
}

function selectOption(option: SelectOption) {
  emit('update:modelValue', option.value)
  closePanel(true)
}

function moveActiveIndex(direction: 1 | -1) {
  if (props.options.length === 0) {
    return
  }

  const current = activeIndex.value >= 0 ? activeIndex.value : 0
  activeIndex.value =
    (current + direction + props.options.length) % props.options.length
  scrollActiveOptionIntoView()
}

function setActiveIndex(index: number) {
  activeIndex.value = index
}

function selectActiveOption() {
  const option = props.options[activeIndex.value]

  if (option) {
    selectOption(option)
  }
}

function handleTriggerKeydown(event: KeyboardEvent) {
  if (props.disabled) {
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()

    if (!isOpen.value) {
      openPanel()
    } else {
      moveActiveIndex(1)
    }

    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()

    if (!isOpen.value) {
      openPanel()
      activeIndex.value =
        selectedIndex.value >= 0
          ? selectedIndex.value
          : props.options.length - 1
    } else {
      moveActiveIndex(-1)
    }

    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    togglePanel()
  }
}

function handlePanelKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    moveActiveIndex(1)
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    moveActiveIndex(-1)
    return
  }

  if (event.key === 'Home') {
    event.preventDefault()
    activeIndex.value = 0
    scrollActiveOptionIntoView()
    return
  }

  if (event.key === 'End') {
    event.preventDefault()
    activeIndex.value = props.options.length - 1
    scrollActiveOptionIntoView()
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    selectActiveOption()
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    closePanel(true)
    return
  }

  if (event.key === 'Tab') {
    closePanel()
  }
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

watch(isOpen, async (open) => {
  if (open) {
    document.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('resize', updatePanelPosition)
    window.addEventListener('scroll', updatePanelPosition, true)
    await nextTick()
    updatePanelPosition()
    panelRef.value?.focus()
    scrollActiveOptionIntoView()
    return
  }

  document.removeEventListener('pointerdown', handlePointerDown)
  window.removeEventListener('resize', updatePanelPosition)
  window.removeEventListener('scroll', updatePanelPosition, true)
})

watch(
  () => props.modelValue,
  () => {
    if (!isOpen.value) {
      return
    }

    syncActiveIndex()
  },
)

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handlePointerDown)
  window.removeEventListener('resize', updatePanelPosition)
  window.removeEventListener('scroll', updatePanelPosition, true)
})
</script>

<template>
  <div class="base-select" :data-open="isOpen">
    <button
      :id="triggerId"
      ref="triggerRef"
      :aria-controls="listboxId"
      :aria-expanded="isOpen"
      :aria-haspopup="'listbox'"
      :aria-label="props.label || undefined"
      class="base-select__trigger"
      :disabled="props.disabled"
      type="button"
      @click="togglePanel"
      @keydown="handleTriggerKeydown"
    >
      <span class="base-select__trigger-copy">
        <span
          class="base-select__trigger-label"
          :class="{
            'base-select__trigger-label--placeholder': !selectedOption,
          }"
        >
          {{ selectedOption?.label ?? props.placeholder }}
        </span>
        <span
          v-if="selectedOption?.description"
          class="base-select__trigger-description"
        >
          {{ selectedOption.description }}
        </span>
      </span>
      <span class="base-select__chevron" aria-hidden="true"></span>
    </button>

    <Teleport to="body">
      <div
        v-if="isOpen"
        :id="listboxId"
        ref="panelRef"
        :aria-activedescendant="
          activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
        "
        class="base-select__panel"
        :class="{
          'base-select__panel--up': openDirection === 'up',
        }"
        :style="panelStyle"
        role="listbox"
        tabindex="-1"
        @keydown="handlePanelKeydown"
      >
        <button
          v-for="(option, index) in props.options"
          :id="`${listboxId}-option-${index}`"
          :key="`${listboxId}-${option.value}`"
          class="base-select__option"
          :class="{
            'base-select__option--active': index === activeIndex,
            'base-select__option--selected': option.value === props.modelValue,
          }"
          :data-option-index="index"
          :data-select-option-value="String(option.value)"
          :aria-selected="option.value === props.modelValue"
          role="option"
          type="button"
          @click="selectOption(option)"
          @mouseenter="setActiveIndex(index)"
        >
          <span class="base-select__option-copy">
            <span class="base-select__option-label">{{ option.label }}</span>
            <span
              v-if="option.description"
              class="base-select__option-description"
            >
              {{ option.description }}
            </span>
          </span>
          <span v-if="option.value === props.modelValue" aria-hidden="true">
            ✓
          </span>
        </button>
      </div>
    </Teleport>
  </div>
</template>
