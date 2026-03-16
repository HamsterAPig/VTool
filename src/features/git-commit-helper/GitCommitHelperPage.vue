<script setup lang="ts">
import { computed, ref } from 'vue'

import BaseSelect from '@/components/BaseSelect.vue'
import ShortcutLegend from '@/components/ShortcutLegend.vue'
import ShortcutScope from '@/components/ShortcutScope.vue'
import type { ShortcutBinding } from '@/components/shortcutScope'
import {
  type CommitCopyTarget,
  type CommitMessageStyle,
} from '@/features/git-commit-helper/gitCommitHelper'
import { useGitCommitHelper } from '@/features/git-commit-helper/useGitCommitHelper'

const {
  availableTypes,
  copyFeedback,
  copyTarget,
  draft,
  emojiSearchQuery,
  emojiSections,
  helperNotice,
  isCopying,
  selectedEmojiCode,
  selectedEmojiDefinition,
  selectedType,
  setDescription,
  setEmoji,
  setEmojiSearchQuery,
  setScope,
  setStyle,
  setType,
  suggestion,
  totalEmojiCount,
  visibleEmojiCount,
} = useGitCommitHelper()

const scopeInputRef = ref<HTMLInputElement | null>(null)
const descriptionInputRef = ref<HTMLTextAreaElement | null>(null)
const emojiSearchInputRef = ref<HTMLInputElement | null>(null)

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

const shortcutItems = [
  {
    description: '聚焦 Description',
    keys: 'D',
  },
  {
    description: '聚焦 Emoji 搜索',
    keys: '/',
  },
  {
    description: '聚焦 Scope',
    keys: 'S',
  },
  {
    description: '复制建议文案',
    keys: 'C',
  },
  {
    description: '切换风格',
    keys: '1 / 2',
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
  '结果区与输入区同步更新',
  '页面支持任务级快捷键',
]

const shortcutBindings = computed<ShortcutBinding[]>(() => [
  {
    handler: () => descriptionInputRef.value?.focus(),
    keys: 'd',
  },
  {
    handler: () => emojiSearchInputRef.value?.focus(),
    keys: '/',
  },
  {
    handler: () => scopeInputRef.value?.focus(),
    keys: 's',
  },
  {
    enabled: suggestion.value.isReady,
    handler: () => handleCopy('message'),
    keys: 'c',
  },
  {
    handler: () => handleStyleChange('code'),
    keys: '1',
  },
  {
    handler: () => handleStyleChange('emoji'),
    keys: '2',
  },
])

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
  <ShortcutScope
    as="div"
    :active="true"
    :bindings="shortcutBindings"
    class="tool-page git-commit-helper-page panel-stack"
  >
    <section class="surface-card-strong tool-hero tool-hero--commit">
      <div class="tool-hero__copy">
        <span class="section-kicker">Commit Workspace</span>
        <h1>Git 提交辅助</h1>
        <p>
          emoji、type、scope、描述和最终复制结果都被拉回同一工作台里。先在左侧完成选择，
          再直接在右侧确认最终文案和命令，不需要再跨区域寻找结果。
        </p>
      </div>

      <div class="tool-hero__meta">
        <span class="tool-hero__metric"
          >内置 {{ totalEmojiCount }} 个 Git emoji</span
        >
        <div class="tool-hero__rules">
          <span v-for="rule in quickRules" :key="rule" class="tool-hero__rule">
            {{ rule }}
          </span>
        </div>
      </div>
    </section>

    <section class="git-commit-helper-workspace commit-workbench">
      <article class="surface-card commit-builder">
        <div class="field-stack">
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
                :class="{
                  'segment__item--active': draft.style === option.value,
                }"
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
              <label class="field-label" for="git-commit-type"
                >Commit type</label
              >
              <span class="git-commit-helper-panel__assist">
                当前选择：{{ selectedTypeLabel }}。type 与 emoji
                会彼此收敛到兼容范围。
              </span>
            </div>

            <BaseSelect
              id="git-commit-type"
              label="Commit type"
              :model-value="selectedType"
              :options="typeSelectOptions"
              placeholder="请选择 commit type"
              @update:model-value="handleTypeChange"
            />
          </div>

          <div class="field-group git-commit-helper-panel__group">
            <label class="field-label" for="git-commit-scope"
              >Scope（可选）</label
            >
            <input
              id="git-commit-scope"
              ref="scopeInputRef"
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
              ref="descriptionInputRef"
              class="glass-input git-commit-helper-panel__textarea"
              :value="draft.description"
              placeholder="例如 新增首页布局"
              rows="5"
              @input="
                setDescription(($event.target as HTMLTextAreaElement).value)
              "
            ></textarea>
          </div>
        </div>
      </article>

      <article
        class="surface-card-strong git-commit-helper-result-board commit-preview"
      >
        <div class="commit-preview__header">
          <div>
            <span class="section-kicker">Live Output</span>
            <h2>实时结果</h2>
            <p>选择和输入变化后，结果卡会在这里同步刷新。</p>
          </div>
          <div class="commit-preview__current">
            <span>当前已选</span>
            <strong>
              {{ selectedEmojiDefinition?.emoji }}
              {{ selectedEmojiDefinition?.code }}
            </strong>
          </div>
        </div>

        <div class="commit-preview__cards">
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
                <strong>直接复制单行 `git commit -m`</strong>
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

      <ShortcutLegend
        eyebrow="Shortcut Map"
        title="页面快捷键"
        :items="shortcutItems"
      />
    </section>

    <section class="surface-card commit-browser">
      <div class="commit-browser__header">
        <div>
          <span class="section-kicker">Emoji Browser</span>
          <h2>Git emoji 目录</h2>
          <p>
            当前展示 {{ visibleEmojiCount }} /
            {{ totalEmojiCount }} 项。推荐区会根据 type 或 emoji 选择动态变化。
          </p>
        </div>
      </div>

      <div class="field-group git-commit-helper-panel__group">
        <label class="field-label" for="git-commit-emoji-search"
          >搜索 emoji</label
        >
        <input
          id="git-commit-emoji-search"
          ref="emojiSearchInputRef"
          class="glass-input"
          :value="emojiSearchQuery"
          placeholder="可搜 code、英文名、中文描述或 emoji"
          type="text"
          @input="
            setEmojiSearchQuery(($event.target as HTMLInputElement).value)
          "
        />
      </div>

      <div v-if="emojiSections.length" class="git-commit-helper-emoji-sections">
        <section
          v-for="section in emojiSections"
          :key="section.id"
          class="git-commit-helper-emoji-section"
          :data-emoji-section="section.id"
        >
          <div class="git-commit-helper-emoji-section__head">
            <div>
              <h3>{{ section.title }}</h3>
              <p>{{ section.description }}</p>
            </div>
            <span class="git-commit-helper-emoji-section__count">
              {{ section.items.length }}
            </span>
          </div>

          <div class="git-commit-helper-emoji-grid">
            <button
              v-for="item in section.items"
              :key="item.code"
              class="git-commit-helper-emoji-card"
              :class="{
                'git-commit-helper-emoji-card--active':
                  selectedEmojiCode === item.code,
                'git-commit-helper-emoji-card--recommended':
                  section.id === 'recommended',
              }"
              :data-emoji-code="item.code"
              :aria-pressed="selectedEmojiCode === item.code"
              type="button"
              @click="setEmoji(item.code)"
            >
              <div class="git-commit-helper-emoji-card__top">
                <span class="git-commit-helper-emoji-card__emoji">{{
                  item.emoji
                }}</span>
                <span
                  v-if="section.id === 'recommended'"
                  class="git-commit-helper-emoji-card__flag"
                >
                  推荐
                </span>
              </div>
              <span class="git-commit-helper-emoji-card__code">{{
                item.code
              }}</span>
              <span class="git-commit-helper-emoji-card__description">
                {{ item.description }}
              </span>
            </button>
          </div>
        </section>
      </div>

      <p v-else class="result-state">
        没有匹配到对应的 Git emoji，换个关键词试试，例如
        `bug`、`:sparkles:`、`可访问性`。
      </p>
    </section>
  </ShortcutScope>
</template>
