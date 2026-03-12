<script setup lang="ts">
import { computed } from 'vue'

import BaseSelect from '@/components/BaseSelect.vue'
import {
  type CommitMessageStyle,
  type CommitCopyTarget,
} from '@/features/git-commit-helper/gitCommitHelper'
import { useGitCommitHelper } from '@/features/git-commit-helper/useGitCommitHelper'

const {
  availableEmojis,
  availableTypes,
  copyFeedback,
  copyTarget,
  draft,
  helperNotice,
  isCopying,
  selectedEmojiCode,
  selectedType,
  setDescription,
  setEmoji,
  setScope,
  setStyle,
  setType,
  suggestion,
} = useGitCommitHelper()

const styleOptions: Array<{
  description: string
  label: string
  value: CommitMessageStyle
}> = [
  {
    value: 'code',
    label: ':emoji: code',
    description: '仓库规范推荐',
  },
  {
    value: 'emoji',
    label: 'emoji 表情',
    description: '适合快速预览',
  },
]

const typeSelectOptions = computed(() =>
  availableTypes.value.map((item) => ({
    description: item.description,
    label: `${item.label} (${item.type})`,
    value: item.type,
  })),
)

const selectedTypeLabel = computed(
  () =>
    availableTypes.value.find((item) => item.type === selectedType.value)
      ?.label ?? '',
)

const quickRules = [
  ':emoji: type(scope): description',
  'scope 可选',
  '中文描述优先',
]

function handleTypeChange(value: string | number) {
  setType(value as string)
}

function handleStyleChange(style: CommitMessageStyle) {
  setStyle(style)
}

function handleCopy(target: CommitCopyTarget) {
  void copyTarget(target)
}
</script>

<template>
  <div class="tool-page git-commit-helper-page">
    <section class="tool-hero git-commit-helper-hero">
      <span class="hero-badge">Git Commit Utility</span>
      <h1>Git 提交辅助</h1>
      <p>
        基于精选 Gitmoji 与 Conventional Commits 语义，实时生成建议文案、 `git
        commit -m` 命令、emoji code 和 emoji 表情，适合提交前快速定稿。
      </p>

      <div class="git-commit-helper-hero__rules">
        <span
          v-for="rule in quickRules"
          :key="rule"
          class="git-commit-helper-hero__rule"
        >
          {{ rule }}
        </span>
      </div>
    </section>

    <section class="tool-layout">
      <article class="surface-panel tool-panel git-commit-helper-panel">
        <div class="field-group git-commit-helper-panel__group">
          <div class="git-commit-helper-panel__head">
            <label class="field-label">提交风格</label>
            <span class="git-commit-helper-panel__assist">{{
              helperNotice
            }}</span>
          </div>

          <div
            class="segment git-commit-helper-style-switch"
            role="group"
            aria-label="提交风格"
          >
            <button
              v-for="option in styleOptions"
              :key="option.value"
              class="segment__item git-commit-helper-style-switch__item"
              :class="{ 'segment__item--active': draft.style === option.value }"
              type="button"
              @click="handleStyleChange(option.value)"
            >
              <span>{{ option.label }}</span>
              <small>{{ option.description }}</small>
            </button>
          </div>
        </div>

        <div class="field-group git-commit-helper-panel__group">
          <div class="git-commit-helper-panel__head">
            <label class="field-label">Git emoji</label>
            <span class="git-commit-helper-panel__assist"
              >当前 type 会优先展示推荐 emoji，并自动保持有效组合。</span
            >
          </div>

          <div class="git-commit-helper-emoji-grid">
            <button
              v-for="item in availableEmojis"
              :key="item.code"
              class="git-commit-helper-emoji-card"
              :class="{
                'git-commit-helper-emoji-card--active':
                  selectedEmojiCode === item.code,
              }"
              :data-emoji-code="item.code"
              :aria-pressed="selectedEmojiCode === item.code"
              type="button"
              @click="setEmoji(item.code)"
            >
              <span class="git-commit-helper-emoji-card__emoji">{{
                item.emoji
              }}</span>
              <span class="git-commit-helper-emoji-card__code">{{
                item.code
              }}</span>
              <span class="git-commit-helper-emoji-card__description">{{
                item.description
              }}</span>
            </button>
          </div>
        </div>

        <div class="field-group git-commit-helper-panel__group">
          <div class="git-commit-helper-panel__head">
            <label class="field-label" for="git-commit-type">Commit type</label>
            <span class="git-commit-helper-panel__assist"
              >切换 type 后，emoji 会同步切到该语义下的首个推荐项。</span
            >
          </div>

          <BaseSelect
            id="git-commit-type"
            label="Commit type"
            :model-value="selectedType"
            :options="typeSelectOptions"
            placeholder="请选择 commit type"
            @update:model-value="handleTypeChange"
          />

          <p class="git-commit-helper-panel__hint">
            当前选择：{{ selectedTypeLabel }}。scope
            可留空；有值时建议使用短英文词或 `kebab-case`。
          </p>
        </div>

        <div class="field-group git-commit-helper-panel__group">
          <label class="field-label" for="git-commit-scope"
            >Scope（可选）</label
          >
          <input
            id="git-commit-scope"
            class="glass-input"
            :value="draft.scope"
            placeholder="例如 home、git-tools、build-system"
            type="text"
            @input="setScope(($event.target as HTMLInputElement).value)"
          />
        </div>

        <div class="field-group git-commit-helper-panel__group">
          <label class="field-label" for="git-commit-description"
            >Description（必填）</label
          >
          <textarea
            id="git-commit-description"
            class="glass-input git-commit-helper-panel__textarea"
            :value="draft.description"
            placeholder="例如 新增首页布局"
            rows="4"
            @input="
              setDescription(($event.target as HTMLTextAreaElement).value)
            "
          ></textarea>
        </div>
      </article>

      <article class="surface-panel result-panel git-commit-helper-result">
        <div class="result-panel__header git-commit-helper-result__header">
          <div>
            <h2>实时结果</h2>
            <p class="git-commit-helper-result__description">
              选定 emoji、type、scope、description 后，右侧结果会立即同步刷新。
            </p>
          </div>
        </div>

        <div class="git-commit-helper-result__stack">
          <section
            class="git-commit-helper-result-card git-commit-helper-result-card--primary"
          >
            <div class="git-commit-helper-result-card__head">
              <div>
                <span class="git-commit-helper-result-card__eyebrow"
                  >建议文案</span
                >
                <strong>{{
                  suggestion.isReady
                    ? '可直接用于提交信息'
                    : '等待补充 description'
                }}</strong>
              </div>
              <button
                class="button button--primary git-commit-helper-result-card__copy"
                :disabled="isCopying.message"
                type="button"
                @click="handleCopy('message')"
              >
                {{ copyFeedback.message || '复制文案' }}
              </button>
            </div>

            <p
              v-if="suggestion.isReady"
              class="git-commit-helper-result-card__value git-commit-helper-result-card__value--message"
            >
              {{ suggestion.message }}
            </p>
            <p v-else class="result-state">
              输入 description 后，这里会生成完整建议文案。
            </p>
          </section>

          <section class="git-commit-helper-result-card">
            <div class="git-commit-helper-result-card__head">
              <div>
                <span class="git-commit-helper-result-card__eyebrow"
                  >提交命令</span
                >
                <strong>安全可复制的单行 `git commit -m`</strong>
              </div>
              <button
                class="button button--ghost git-commit-helper-result-card__copy"
                :disabled="isCopying.command"
                type="button"
                @click="handleCopy('command')"
              >
                {{ copyFeedback.command || '复制命令' }}
              </button>
            </div>

            <p
              v-if="suggestion.isReady"
              class="git-commit-helper-result-card__value git-commit-helper-result-card__value--command"
            >
              {{ suggestion.command }}
            </p>
            <p v-else class="result-state">
              description 为空时，不生成最终提交命令。
            </p>
          </section>

          <div class="git-commit-helper-result__mini-grid">
            <section
              class="git-commit-helper-result-card git-commit-helper-result-card--mini"
            >
              <div class="git-commit-helper-result-card__head">
                <div>
                  <span class="git-commit-helper-result-card__eyebrow"
                    >emoji code</span
                  >
                  <strong>{{ suggestion.code }}</strong>
                </div>
                <button
                  class="button button--ghost git-commit-helper-result-card__copy"
                  :disabled="isCopying.code"
                  type="button"
                  @click="handleCopy('code')"
                >
                  {{ copyFeedback.code || '复制 code' }}
                </button>
              </div>
            </section>

            <section
              class="git-commit-helper-result-card git-commit-helper-result-card--mini"
            >
              <div class="git-commit-helper-result-card__head">
                <div>
                  <span class="git-commit-helper-result-card__eyebrow"
                    >emoji 表情</span
                  >
                  <strong>{{ suggestion.emoji }}</strong>
                </div>
                <button
                  class="button button--ghost git-commit-helper-result-card__copy"
                  :disabled="isCopying.emoji"
                  type="button"
                  @click="handleCopy('emoji')"
                >
                  {{ copyFeedback.emoji || '复制 emoji' }}
                </button>
              </div>
            </section>
          </div>

          <div
            v-if="suggestion.validationHints.length"
            class="git-commit-helper-result__hints"
          >
            <p
              v-for="hint in suggestion.validationHints"
              :key="hint"
              class="git-commit-helper-result__hint"
            >
              {{ hint }}
            </p>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>
