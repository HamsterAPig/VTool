import { computed, ref } from 'vue'

import {
  convertDateTimeToTimestamp,
  formatDateTimeInput,
  formatTimestampToDate,
  type DateToTimestampResult,
  type TimestampPrecision,
  type TimestampToDateResult,
} from '@/features/timestamp-tool/timestamp'

type TimestampMode = 'timestamp-to-date' | 'date-to-timestamp'

interface ResultState {
  summary: string
  values: Array<{
    key: string
    label: string
    value: string
  }>
}

function buildTimestampResult(result: TimestampToDateResult): ResultState {
  return {
    summary: '转换成功，已输出本地时间、ISO 时间和不同精度的时间戳。',
    values: [
      { key: 'locale', label: '本地时间', value: result.locale },
      { key: 'iso', label: 'ISO 时间', value: result.iso },
      { key: 'seconds', label: '秒级时间戳', value: result.seconds },
      {
        key: 'milliseconds',
        label: '毫秒级时间戳',
        value: result.milliseconds,
      },
    ],
  }
}

function buildDateResult(result: DateToTimestampResult): ResultState {
  return {
    summary: '转换成功，已输出 ISO 时间和秒、毫秒两种时间戳。',
    values: [
      { key: 'locale', label: '本地时间', value: result.locale },
      { key: 'iso', label: 'ISO 时间', value: result.iso },
      { key: 'seconds', label: '秒级时间戳', value: result.seconds },
      {
        key: 'milliseconds',
        label: '毫秒级时间戳',
        value: result.milliseconds,
      },
    ],
  }
}

export function useTimestampTool() {
  const mode = ref<TimestampMode>('timestamp-to-date')
  const precision = ref<TimestampPrecision>('auto')
  const timestampInput = ref(String(Math.trunc(Date.now() / 1000)))
  const datetimeInput = ref(formatDateTimeInput(new Date()))
  const copyFeedback = ref('')

  const result = computed(() => {
    try {
      if (mode.value === 'timestamp-to-date') {
        const value = timestampInput.value.trim()

        if (!value) {
          return {
            status: 'idle' as const,
            message: '请输入时间戳后再执行转换。',
          }
        }

        return {
          status: 'success' as const,
          data: buildTimestampResult(
            formatTimestampToDate(value, precision.value),
          ),
        }
      }

      if (!datetimeInput.value.trim()) {
        return {
          status: 'idle' as const,
          message: '请选择日期时间后再执行转换。',
        }
      }

      return {
        status: 'success' as const,
        data: buildDateResult(convertDateTimeToTimestamp(datetimeInput.value)),
      }
    } catch (error) {
      return {
        status: 'error' as const,
        message:
          error instanceof Error ? error.message : '转换失败，请检查输入内容。',
      }
    }
  })

  function clearInputs() {
    timestampInput.value = ''
    datetimeInput.value = ''
    copyFeedback.value = ''
  }

  function fillNow() {
    const now = new Date()

    timestampInput.value = String(Math.trunc(now.getTime() / 1000))
    datetimeInput.value = formatDateTimeInput(now)
    copyFeedback.value = ''
  }

  async function copyValue(value: string) {
    if (!value) {
      return
    }

    await navigator.clipboard.writeText(value)
    copyFeedback.value = `已复制：${value}`
  }

  return {
    copyFeedback,
    copyValue,
    clearInputs,
    datetimeInput,
    fillNow,
    mode,
    precision,
    result,
    timestampInput,
  }
}
