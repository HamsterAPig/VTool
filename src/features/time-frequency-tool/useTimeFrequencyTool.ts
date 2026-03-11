import { computed, ref } from 'vue'

import {
  buildTimeFrequencyResult,
  FREQUENCY_UNITS,
  formatDisplayNumber,
  getUnitDimension,
  TIME_UNITS,
  type ConversionDimension,
  type SupportedUnit,
} from '@/features/time-frequency-tool/timeFrequency'

interface ResultState {
  mainDisplay: string
  mainDescription: string
  summary: string
  sourceDisplay: string
  copyValue: string
}

const DEFAULT_UNITS: Record<ConversionDimension, SupportedUnit> = {
  time: 'ms',
  frequency: 'Hz',
}

const EXAMPLE_VALUES: Record<ConversionDimension, string> = {
  time: '0.5',
  frequency: '50',
}

export function useTimeFrequencyTool() {
  const inputDimension = ref<ConversionDimension>('time')
  const inputValue = ref(EXAMPLE_VALUES.time)
  const inputUnit = ref<SupportedUnit>(DEFAULT_UNITS.time)
  const copyFeedback = ref('')

  const unitOptions = computed(() =>
    inputDimension.value === 'time' ? TIME_UNITS : FREQUENCY_UNITS,
  )

  const oppositeDimensionLabel = computed(() =>
    inputDimension.value === 'time' ? '频率' : '时间',
  )

  const result = computed(() => {
    if (!inputValue.value.trim()) {
      return {
        status: 'idle' as const,
        message:
          inputDimension.value === 'time'
            ? '请输入时间数值后再执行换算。'
            : '请输入频率数值后再执行换算。',
      }
    }

    try {
      const conversion = buildTimeFrequencyResult(
        inputValue.value,
        inputUnit.value,
      )
      const reciprocalGroup = conversion.reciprocalGroup

      let mainState: ResultState

      if (reciprocalGroup.status === 'success') {
        mainState = {
          mainDisplay: reciprocalGroup.preferred.display,
          mainDescription:
            conversion.sourceDimension === 'time'
              ? `根据 ${conversion.sourceDisplay} 的周期，自动换算为更易读的频率单位。`
              : `根据 ${conversion.sourceDisplay} 的频率，自动换算为更易读的时间单位。`,
          summary:
            conversion.sourceDimension === 'time'
              ? '已完成时间单位换算，并自动给出对应频率。'
              : '已完成频率单位换算，并自动给出对应时间。',
          sourceDisplay: conversion.sourceDisplay,
          copyValue: reciprocalGroup.preferred.display,
        }
      } else {
        mainState = {
          mainDisplay: conversion.sameDimensionGroup.preferred.display,
          mainDescription:
            conversion.sourceDimension === 'time'
              ? '当前仅完成时间单位换算；输入值不大于 0，无法计算对应频率。'
              : '当前仅完成频率单位换算；输入值不大于 0，无法计算对应时间。',
          summary:
            conversion.sourceDimension === 'time'
              ? '已完成时间单位换算。'
              : '已完成频率单位换算。',
          sourceDisplay: conversion.sourceDisplay,
          copyValue: conversion.sameDimensionGroup.preferred.display,
        }
      }

      return {
        status: 'success' as const,
        data: {
          ...conversion,
          mainState,
        },
      }
    } catch (error) {
      return {
        status: 'error' as const,
        message:
          error instanceof Error ? error.message : '换算失败，请检查输入内容。',
      }
    }
  })

  function setInputDimension(nextDimension: ConversionDimension) {
    if (nextDimension === inputDimension.value) {
      return
    }

    inputDimension.value = nextDimension
    inputUnit.value = DEFAULT_UNITS[nextDimension]
    inputValue.value = EXAMPLE_VALUES[nextDimension]
    copyFeedback.value = ''
  }

  function setInputUnit(unit: SupportedUnit) {
    if (getUnitDimension(unit) !== inputDimension.value) {
      return
    }

    inputUnit.value = unit
    copyFeedback.value = ''
  }

  function fillExample() {
    inputValue.value = EXAMPLE_VALUES[inputDimension.value]
    inputUnit.value = DEFAULT_UNITS[inputDimension.value]
    copyFeedback.value = ''
  }

  function clearInputs() {
    inputValue.value = ''
    copyFeedback.value = ''
  }

  function swapDimension() {
    const nextDimension: ConversionDimension =
      inputDimension.value === 'time' ? 'frequency' : 'time'

    if (result.value.status === 'success') {
      const reciprocalGroup = result.value.data.reciprocalGroup

      if (reciprocalGroup.status === 'success') {
        inputDimension.value = nextDimension
        inputUnit.value = reciprocalGroup.preferred.unit
        inputValue.value = formatDisplayNumber(reciprocalGroup.preferred.value)
        copyFeedback.value = ''
        return
      }
    }

    setInputDimension(nextDimension)
  }

  async function copyValue(value: string) {
    if (!value) {
      return
    }

    try {
      await navigator.clipboard.writeText(value)
      copyFeedback.value = `已复制：${value}`
    } catch {
      copyFeedback.value = '当前环境不支持复制，请手动复制结果。'
    }
  }

  return {
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
  }
}
