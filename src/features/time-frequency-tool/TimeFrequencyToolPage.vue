<script setup lang="ts">
import { computed, ref } from 'vue'

import BaseSelect from '@/components/BaseSelect.vue'
import ShortcutLegend from '@/components/ShortcutLegend.vue'
import ShortcutScope from '@/components/ShortcutScope.vue'
import type { ShortcutBinding } from '@/components/shortcutScope'
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

const valueInputRef = ref<HTMLInputElement | null>(null)

const shortcutItems = [
  {
    description: '聚焦输入框',
    keys: '/',
  },
  {
    description: '聚焦单位选择',
    keys: 'U',
  },
  {
    description: '切换时间/频率维度',
    keys: 'X',
  },
  {
    description: '填入示例',
    keys: 'E',
  },
  {
    description: '清空输入',
    keys: 'C',
  },
]

const shortcutBindings = computed<ShortcutBinding[]>(() => [
  {
    handler: () => valueInputRef.value?.focus(),
    keys: '/',
  },
  {
    handler: () => document.getElementById('time-frequency-unit')?.focus(),
    keys: 'u',
  },
  {
    handler: () => swapDimension(),
    keys: 'x',
  },
  {
    handler: () => fillExample(),
    keys: 'e',
  },
  {
    handler: () => clearInputs(),
    keys: 'c',
  },
])

const unitSelectOptions = computed(() =>
  unitOptions.value.map((option) => ({
    description: inputDimension.value === 'time' ? '时间单位' : '频率单位',
    label: `${option.label} (${option.unit})`,
    value: option.unit,
  })),
)

function handleUnitChange(value: string | number) {
  setInputUnit(value as SupportedUnit)
}
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
        <span class="section-kicker">Reciprocal Conversion</span>
        <h1>时间 / 频率换算</h1>
        <p>
          输入、主结果、同维度结果和倒数互转结果被压缩到一个连续工作台里，避免在说明和结果之间来回跳读。
        </p>
      </div>
    </section>

    <section class="tool-layout time-frequency-workbench">
      <article class="surface-card tool-panel time-frequency-panel">
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
              ref="valueInputRef"
              v-model="inputValue"
              class="glass-input time-frequency-panel__input"
              inputmode="decimal"
              placeholder="例如 0.5、50、1e6"
              type="text"
            />

            <div class="time-frequency-panel__select-wrap">
              <span class="time-frequency-panel__select-label">单位</span>
              <BaseSelect
                id="time-frequency-unit"
                class="glass-input time-frequency-panel__select"
                label="时间频率单位"
                :model-value="inputUnit"
                :options="unitSelectOptions"
                @update:model-value="handleUnitChange"
              />
            </div>
          </div>
        </div>

        <p class="time-frequency-panel__hint">
          当前支持 `s / ms / us / ns` 与 `Hz / kHz / MHz /
          GHz`。切换维度后会保留一条可继续操作的主结果路径。
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

      <article class="surface-card-strong result-panel time-frequency-result">
        <div class="result-panel__header">
          <div>
            <span class="section-kicker">Primary Result</span>
            <h2>换算结果</h2>
          </div>
          <p v-if="copyFeedback" class="result-panel__feedback">
            {{ copyFeedback }}
          </p>
        </div>

        <Transition mode="out-in" name="time-frequency-result-fade">
          <div
            v-if="result.status === 'success'"
            :key="`success-${result.data.mainState.sourceDisplay}`"
            class="time-frequency-result__stack"
          >
            <div class="time-frequency-main-result">
              <span class="time-frequency-main-result__eyebrow"
                >智能主结果</span
              >
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
            :key="`error-${result.message}`"
            class="result-state result-state--error"
          >
            {{ result.message }}
          </p>
          <p v-else :key="`idle-${result.message}`" class="result-state">
            {{ result.message }}
          </p>
        </Transition>
      </article>

      <ShortcutLegend
        eyebrow="Shortcut Map"
        title="换算快捷键"
        :items="shortcutItems"
      />
    </section>
  </ShortcutScope>
</template>
