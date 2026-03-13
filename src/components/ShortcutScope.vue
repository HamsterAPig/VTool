<script setup lang="ts">
import hotkeys from 'hotkeys-js'
import { createFocusTrap, type FocusTrap } from 'focus-trap'
import { computed, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'

import type { ShortcutBinding } from '@/components/shortcutScope'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    active: boolean
    bindings: ShortcutBinding[]
    trapFocus?: boolean
    initialFocus?: () => HTMLElement | null
    fallbackFocus?: () => HTMLElement | null
    restoreFocus?: boolean
    as?: string
  }>(),
  {
    as: 'div',
    fallbackFocus: undefined,
    initialFocus: undefined,
    restoreFocus: true,
    trapFocus: false,
  },
)

const attrs = useAttrs()
const rootRef = ref<HTMLElement | null>(null)
const trapRef = ref<FocusTrap | null>(null)
const registeredBindings = ref<
  Array<{ keys: string; handler: ShortcutBinding['handler'] }>
>([])

let isHotkeysFilterInstalled = false

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)
  )
}

function ensureHotkeysFilterInstalled() {
  if (isHotkeysFilterInstalled) {
    return
  }

  const originalFilter = hotkeys.filter

  hotkeys.filter = (event: KeyboardEvent) =>
    originalFilter(event) || isEditableTarget(event.target)
  isHotkeysFilterInstalled = true
}

function toHotkeyString(keys: string | string[]) {
  return Array.isArray(keys) ? keys.join(',') : keys
}

function unbindHotkeys() {
  for (const binding of registeredBindings.value) {
    hotkeys.unbind(binding.keys, binding.handler)
  }

  registeredBindings.value = []
}

function bindHotkeys() {
  unbindHotkeys()

  if (!props.active) {
    return
  }

  ensureHotkeysFilterInstalled()

  const nextBindings = props.bindings.filter(
    (binding) => binding.enabled !== false,
  )

  for (const binding of nextBindings) {
    const keys = toHotkeyString(binding.keys)
    const handler = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target) && !binding.allowInInput) {
        return
      }

      if (binding.preventDefault !== false) {
        event.preventDefault()
      }

      if (binding.stopPropagation !== false) {
        event.stopPropagation()
      }

      binding.handler(event)
    }

    hotkeys(
      keys,
      {
        keydown: true,
        keyup: false,
      },
      handler,
    )

    registeredBindings.value.push({ keys, handler })
  }
}

function syncFocusTrap() {
  if (!props.trapFocus || !props.active || !rootRef.value) {
    if (trapRef.value) {
      trapRef.value.deactivate()
      trapRef.value = null
    }

    return
  }

  if (!rootRef.value) {
    return
  }

  if (!trapRef.value) {
    trapRef.value = createFocusTrap(rootRef.value, {
      clickOutsideDeactivates: false,
      escapeDeactivates: false,
      fallbackFocus: () => props.fallbackFocus?.() ?? rootRef.value!,
      initialFocus: () => props.initialFocus?.() ?? undefined,
      returnFocusOnDeactivate: props.restoreFocus,
    })
  }

  trapRef.value.activate()
}

const renderedTag = computed(() => props.as)

onMounted(() => {
  bindHotkeys()
  void syncFocusTrap()
})

watch(
  () => props.active,
  () => {
    bindHotkeys()
    void syncFocusTrap()
  },
)

watch(
  () => props.bindings,
  () => {
    bindHotkeys()
  },
  {
    deep: true,
  },
)

watch(
  () => props.trapFocus,
  () => {
    void syncFocusTrap()
  },
)

watch(
  () => props.restoreFocus,
  () => {
    if (trapRef.value) {
      trapRef.value.deactivate()
      trapRef.value = null
    }

    void syncFocusTrap()
  },
)

onBeforeUnmount(() => {
  unbindHotkeys()

  if (trapRef.value) {
    trapRef.value.deactivate()
    trapRef.value = null
  }
})
</script>

<template>
  <component :is="renderedTag" ref="rootRef" v-bind="attrs">
    <slot />
  </component>
</template>
