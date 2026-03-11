<script setup lang="ts">
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
</script>

<template>
  <div class="tool-page">
    <section class="tool-hero">
      <span class="hero-badge">Timestamp Utility</span>
      <h1>时间戳转换</h1>
      <p>
        在秒、毫秒时间戳与本地日期时间之间快速互转。界面保持最小操作路径，
        同时给出清晰的成功、空状态和错误反馈。
      </p>
    </section>

    <section class="tool-layout">
      <article class="surface-panel tool-panel">
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

      <article class="surface-panel result-panel">
        <div class="result-panel__header">
          <h2>转换结果</h2>
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
    </section>
  </div>
</template>
