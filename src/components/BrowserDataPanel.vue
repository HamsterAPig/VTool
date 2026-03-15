<script setup lang="ts">
const emit = defineEmits<{
  export: []
  'import-clipboard': []
  'import-file': [file: File]
}>()

const props = withDefaults(
  defineProps<{
    title: string
    description: string
    status?: string
    exportDisabled?: boolean
    clipboardImportLabel?: string
    importLabel?: string
    exportLabel?: string
  }>(),
  {
    status: '',
    exportDisabled: false,
    clipboardImportLabel: '从剪贴板导入',
    importLabel: '导入 JSON',
    exportLabel: '导出 JSON',
  },
)

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const [file] = input.files ?? []

  if (file) {
    emit('import-file', file)
  }

  input.value = ''
}
</script>

<template>
  <article class="surface-panel browser-data-panel">
    <div class="browser-data-panel__copy">
      <span class="browser-data-panel__eyebrow">Browser Storage</span>
      <h2>{{ props.title }}</h2>
      <p>{{ props.description }}</p>
      <p v-if="props.status" class="browser-data-panel__status">
        {{ props.status }}
      </p>
    </div>

    <div class="browser-data-panel__actions">
      <button
        class="button button--ghost"
        type="button"
        @click="emit('import-clipboard')"
      >
        {{ props.clipboardImportLabel }}
      </button>
      <label class="button button--ghost browser-data-panel__import">
        {{ props.importLabel }}
        <input
          accept="application/json"
          class="browser-data-panel__input"
          type="file"
          @change="onFileChange"
        />
      </label>
      <button
        class="button button--primary"
        :disabled="props.exportDisabled"
        type="button"
        @click="emit('export')"
      >
        {{ props.exportLabel }}
      </button>
    </div>
  </article>
</template>
