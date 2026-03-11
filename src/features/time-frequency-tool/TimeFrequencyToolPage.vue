<script setup lang="ts">
import type { SupportedUnit } from '@/features/time-frequency-tool/timeFrequency'
import { useTimeFrequencyTool } from '@/features/time-frequency-tool/useTimeFrequencyTool'

const {
  clearInputs,
  copyFeedback,
  copyValue,
  fillExample,
  inputDimension,
  inputUnit,
  inputValue,
  oppositeDimensionLabel,
  result,
  setInputDimension,
  setInputUnit,
  swapDimension,
  unitOptions,
} = useTimeFrequencyTool()

function handleUnitChange(event: Event) {
  const target = event.target as HTMLSelectElement

  setInputUnit(target.value as SupportedUnit)
}
</script>

<template>
  <div class="tool-page">
    <section class="tool-hero">
      <span class="hero-badge">Time & Frequency Utility</span>
      <h1>时间 / 频率换算</h1>
      <p>
        支持时间单位内部换算、频率单位内部换算，以及时间与频率之间的倒数互转。
        允许输入浮点数和科学计数法，并自动挑选更适合阅读的结果单位。
      </p>
    </section>

    <section class="tool-layout">
      <article class="surface-panel tool-panel time-frequency-panel">
        <div class="segment time-frequency-switch">
          <button
            class="segment__item time-frequency-switch__item"
            :class="{ 'segment__item--active': inputDimension === 'time' }"
            type="button"
            @click="setInputDimension('time')"
          >
            从时间输入
          </button>
          <button
            class="segment__item time-frequency-switch__item"
            :class="{ 'segment__item--active': inputDimension === 'frequency' }"
            type="button"
            @click="setInputDimension('frequency')"
          >
            从频率输入
          </button>
        </div>

        <div class="field-group">
          <div class="time-frequency-panel__field-head">
            <label class="field-label" for="time-frequency-input"
              >输入数值</label
            >
            <span class="time-frequency-panel__auto-note">输入后自动换算</span>
          </div>

          <div class="time-frequency-panel__control-row">
            <input
              id="time-frequency-input"
              v-model="inputValue"
              class="glass-input time-frequency-panel__input"
              inputmode="decimal"
              placeholder="例如 0.5、50、1e6"
              type="text"
            />

            <label
              class="time-frequency-panel__select-wrap"
              for="time-frequency-unit"
            >
              <span class="time-frequency-panel__select-label">单位</span>
              <select
                id="time-frequency-unit"
                class="glass-input time-frequency-panel__select"
                :value="inputUnit"
                @change="handleUnitChange"
              >
                <option
                  v-for="option in unitOptions"
                  :key="option.unit"
                  :value="option.unit"
                >
                  {{ option.label }} ({{ option.unit }})
                </option>
              </select>
            </label>
          </div>
        </div>

        <p class="time-frequency-panel__hint">
          当前支持 `s / ms / us / ns` 与 `Hz / kHz / MHz /
          GHz`。修改数值或单位后，右侧结果会立即自动刷新。
        </p>

        <div class="panel-actions time-frequency-panel__actions">
          <button
            class="button button--primary time-frequency-action"
            type="button"
            @click="swapDimension"
          >
            切换到{{ oppositeDimensionLabel }}输入
          </button>
          <button
            class="button button--ghost time-frequency-action time-frequency-action--secondary"
            type="button"
            @click="fillExample"
          >
            填入示例
          </button>
          <button
            class="button button--ghost time-frequency-action time-frequency-action--secondary"
            type="button"
            @click="clearInputs"
          >
            清空
          </button>
        </div>
      </article>

      <article class="surface-panel result-panel time-frequency-result">
        <div class="result-panel__header">
          <h2>换算结果</h2>
          <p v-if="copyFeedback" class="result-panel__feedback">
            {{ copyFeedback }}
          </p>
        </div>

        <div
          v-if="result.status === 'success'"
          class="time-frequency-result__stack"
        >
          <div class="time-frequency-main-result">
            <span class="time-frequency-main-result__eyebrow">智能主结果</span>
            <p class="time-frequency-main-result__source">
              输入值：{{ result.data.mainState.sourceDisplay }}
            </p>
            <strong>{{ result.data.mainState.mainDisplay }}</strong>
            <p>{{ result.data.mainState.mainDescription }}</p>

            <div class="panel-actions time-frequency-main-result__actions">
              <button
                class="button button--primary time-frequency-action"
                type="button"
                @click="copyValue(result.data.mainState.copyValue)"
              >
                复制主结果
              </button>
            </div>
          </div>

          <p class="result-summary">
            {{ result.data.mainState.summary }}
          </p>

          <p
            v-if="result.data.reciprocalGroup.status === 'error'"
            class="result-state result-state--warning"
          >
            {{ result.data.reciprocalGroup.message }}
          </p>

          <div class="time-frequency-group-grid">
            <section class="time-frequency-group">
              <div class="time-frequency-group__header">
                <div>
                  <h3>{{ result.data.sameDimensionGroup.title }}</h3>
                  <p>
                    已自动选出更易读的单位：{{
                      result.data.sameDimensionGroup.preferred.display
                    }}
                  </p>
                </div>
              </div>

              <div class="result-list">
                <div
                  v-for="item in result.data.sameDimensionGroup.items"
                  :key="item.key"
                  class="result-item"
                >
                  <div>
                    <span class="result-item__label">{{ item.label }}</span>
                    <strong class="result-item__value">{{
                      item.display
                    }}</strong>
                  </div>
                  <button
                    class="time-frequency-copy-button"
                    type="button"
                    @click="copyValue(item.display)"
                  >
                    复制
                  </button>
                </div>
              </div>
            </section>

            <section class="time-frequency-group">
              <div class="time-frequency-group__header">
                <div>
                  <h3>{{ result.data.reciprocalGroup.title }}</h3>
                  <p v-if="result.data.reciprocalGroup.status === 'success'">
                    已自动选出更易读的单位：{{
                      result.data.reciprocalGroup.preferred.display
                    }}
                  </p>
                  <p v-else>当前输入不满足互转条件，但同维度换算仍然可用。</p>
                </div>
              </div>

              <div
                v-if="result.data.reciprocalGroup.status === 'success'"
                class="result-list"
              >
                <div
                  v-for="item in result.data.reciprocalGroup.items"
                  :key="item.key"
                  class="result-item"
                >
                  <div>
                    <span class="result-item__label">{{ item.label }}</span>
                    <strong class="result-item__value">{{
                      item.display
                    }}</strong>
                  </div>
                  <button
                    class="time-frequency-copy-button"
                    type="button"
                    @click="copyValue(item.display)"
                  >
                    复制
                  </button>
                </div>
              </div>
              <p v-else class="result-state">
                {{ result.data.reciprocalGroup.message }}
              </p>
            </section>
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
