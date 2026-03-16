<script setup lang="ts">
import { computed, ref } from 'vue'

import ShortcutLegend from '@/components/ShortcutLegend.vue'
import ShortcutScope from '@/components/ShortcutScope.vue'
import type { ShortcutBinding } from '@/components/shortcutScope'
import { useTimestampTool } from '@/features/timestamp-tool/useTimestampTool'

const {
  copyFeedback,
  copyValue,
  clearInputs,
  datetimeInput,
  fillNow,
  mode,
  precision,
  result,
  timestampInput,
} = useTimestampTool()

const timestampInputRef = ref<HTMLInputElement | null>(null)
const datetimeInputRef = ref<HTMLInputElement | null>(null)

const shortcutItems = [
  {
    description: '聚焦当前输入',
    keys: '/',
  },
  {
    description: '切到时间戳转日期',
    keys: '1',
  },
  {
    description: '切到日期转时间戳',
    keys: '2',
  },
  {
    description: '填入当前时间',
    keys: 'N',
  },
  {
    description: '清空输入',
    keys: 'C',
  },
]

const shortcutBindings = computed<ShortcutBinding[]>(() => [
  {
    handler: () =>
      mode.value === 'timestamp-to-date'
        ? timestampInputRef.value?.focus()
        : datetimeInputRef.value?.focus(),
    keys: '/',
  },
  {
    handler: () => {
      mode.value = 'timestamp-to-date'
      timestampInputRef.value?.focus()
    },
    keys: '1',
  },
  {
    handler: () => {
      mode.value = 'date-to-timestamp'
      datetimeInputRef.value?.focus()
    },
    keys: '2',
  },
  {
    handler: () => fillNow(),
    keys: 'n',
  },
  {
    handler: () => clearInputs(),
    keys: 'c',
  },
])
</script>

<template>
  <ShortcutScope
    as="div"
    :active="true"
    :bindings="shortcutBindings"
    class="tool-page panel-stack"
  >
    <section class="surface-card-strong tool-hero">
      <div class="tool-hero__copy">
        <span class="section-kicker">Timestamp Conversion</span>
        <h1>时间戳转换</h1>
        <p>
          秒、毫秒时间戳和本地日期时间之间的往返转换被压到一个紧凑面板中，输入后直接在结果区复制目标格式。
        </p>
      </div>
    </section>

    <section class="tool-layout timestamp-workbench">
      <article class="surface-card tool-panel">
        <div class="segment">
          <button
            class="segment__item"
            :class="{ 'segment__item--active': mode === 'timestamp-to-date' }"
            type="button"
            @click="mode = 'timestamp-to-date'"
          >
            时间戳转日期
          </button>
          <button
            class="segment__item"
            :class="{ 'segment__item--active': mode === 'date-to-timestamp' }"
            type="button"
            @click="mode = 'date-to-timestamp'"
          >
            日期转时间戳
          </button>
        </div>

        <div v-if="mode === 'timestamp-to-date'" class="field-group">
          <label class="field-label" for="timestamp-input">输入时间戳</label>
          <input
            id="timestamp-input"
            ref="timestampInputRef"
            v-model="timestampInput"
            class="glass-input"
            inputmode="numeric"
            placeholder="例如 1710162000 或 1710162000000"
            type="text"
          />

          <div
            class="precision-group"
            role="group"
            aria-label="Timestamp precision"
          >
            <button
              class="precision-pill"
              :class="{ 'precision-pill--active': precision === 'auto' }"
              type="button"
              @click="precision = 'auto'"
            >
              自动识别
            </button>
            <button
              class="precision-pill"
              :class="{ 'precision-pill--active': precision === 'seconds' }"
              type="button"
              @click="precision = 'seconds'"
            >
              秒
            </button>
            <button
              class="precision-pill"
              :class="{
                'precision-pill--active': precision === 'milliseconds',
              }"
              type="button"
              @click="precision = 'milliseconds'"
            >
              毫秒
            </button>
          </div>
        </div>

        <div v-else class="field-group">
          <label class="field-label" for="datetime-input">输入日期时间</label>
          <input
            id="datetime-input"
            ref="datetimeInputRef"
            v-model="datetimeInput"
            class="glass-input"
            step="1"
            type="datetime-local"
          />
        </div>

        <div class="panel-actions">
          <button class="button button--primary" type="button" @click="fillNow">
            填入当前时间
          </button>
          <button
            class="button button--ghost"
            type="button"
            @click="clearInputs"
          >
            清空
          </button>
        </div>
      </article>

      <article class="surface-card-strong result-panel">
        <div class="result-panel__header">
          <div>
            <span class="section-kicker">Result Copy</span>
            <h2>转换结果</h2>
          </div>
          <p v-if="copyFeedback" class="result-panel__feedback">
            {{ copyFeedback }}
          </p>
        </div>

        <div v-if="result.status === 'success'" class="result-list">
          <p class="result-summary">{{ result.data.summary }}</p>

          <div
            v-for="item in result.data.values"
            :key="item.key"
            class="result-item"
          >
            <div>
              <span class="result-item__label">{{ item.label }}</span>
              <strong class="result-item__value">{{ item.value }}</strong>
            </div>
            <button
              class="button button--ghost"
              type="button"
              @click="copyValue(item.value)"
            >
              复制
            </button>
          </div>
        </div>

        <p
          v-else-if="result.status === 'error'"
          class="result-state result-state--error"
        >
          {{ result.message }}
        </p>
        <p v-else class="result-state">
          {{ result.message }}
        </p>
      </article>

      <ShortcutLegend
        eyebrow="Shortcut Map"
        title="时间戳快捷键"
        :items="shortcutItems"
      />
    </section>
  </ShortcutScope>
</template>
