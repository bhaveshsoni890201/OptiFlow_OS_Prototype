<script setup lang="ts">
import { computed } from 'vue'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusIcon } from '@heroicons/vue/24/outline'
import * as HeroIcons from '@heroicons/vue/24/outline'
import OptSpinner from './OptSpinner.vue'

const props = withDefaults(
  defineProps<{
    title: string
    value: string | number
    trend?: number
    trendLabel?: string
    unit?: string
    icon?: string
    color?: string
    loading?: boolean
    error?: string
    target?: number
    comparison?: string
    sparkline?: number[]
  }>(),
  {
    trend: undefined,
    trendLabel: 'vs last period',
    unit: undefined,
    icon: undefined,
    color: 'brand',
    loading: false,
    error: undefined,
    target: undefined,
    comparison: undefined,
    sparkline: undefined,
  },
)

const emit = defineEmits<{
  click: []
}>()

const iconComponent = computed(() => {
  if (!props.icon) return null
  // Accept both string names and component references
  if (typeof props.icon === 'string') {
    const pascal = props.icon
      .split('-')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join('') + 'Icon'
    return (HeroIcons as Record<string, any>)[pascal] || null
  }
  return props.icon
})

const trendArrow = computed(() => {
  if (props.trend == null) return null
  if (props.trend > 0) return ArrowTrendingUpIcon
  if (props.trend < 0) return ArrowTrendingDownIcon
  return MinusIcon
})

const trendColor = computed(() => {
  if (props.trend == null) return ''
  if (props.trend > 0) return 'text-success-600'
  if (props.trend < 0) return 'text-danger-600'
  return 'text-neutral-400'
})

const targetPercent = computed(() => {
  if (props.target == null || typeof props.value !== 'number') return null
  return Math.min(Math.round((props.value / props.target) * 100), 100)
})

const colorClasses: Record<string, string> = {
  brand: 'text-brand-600 bg-brand-50',
  success: 'text-success-600 bg-success-50',
  warning: 'text-warning-500 bg-warning-50',
  danger: 'text-danger-600 bg-danger-50',
  info: 'text-info-600 bg-info-50',
  neutral: 'text-neutral-600 bg-neutral-100',
}
</script>

<template>
  <div
    :class="[
      'rounded-lg border border-neutral-200 bg-white p-4 sm:p-5 transition-shadow hover:shadow-sm',
      $attrs.onClick ? 'cursor-pointer' : '',
    ]"
    @click="emit('click')"
  >
    <div v-if="loading" class="flex items-center justify-center py-8">
      <OptSpinner />
    </div>

    <div
      v-else-if="error"
      class="flex flex-col items-center justify-center py-8 text-center"
    >
      <p class="text-caption text-danger-600">{{ error }}</p>
    </div>

    <template v-else>
      <div class="flex items-start justify-between mb-3">
        <p class="text-caption text-neutral-500 font-semibold tracking-wide uppercase">
          {{ title }}
        </p>
        <div
          v-if="iconComponent"
          :class="['w-9 h-9 rounded-lg flex items-center justify-center shrink-0', colorClasses[color] || colorClasses.brand]"
        >
          <component :is="iconComponent" class="w-5 h-5" aria-hidden="true" />
        </div>
      </div>

      <div class="flex items-baseline gap-2">
        <span class="text-display text-neutral-900 font-bold">
          {{ value }}<span v-if="unit" class="text-h3 text-neutral-500 ml-1">{{ unit }}</span>
        </span>
      </div>

      <div v-if="trend != null" class="flex items-center gap-1.5 mt-2">
        <component :is="trendArrow" :class="['w-4 h-4', trendColor]" aria-hidden="true" />
        <span :class="['text-caption font-semibold', trendColor]">
          {{ Math.abs(trend) }}%
        </span>
        <span class="text-caption text-neutral-400">{{ trendLabel }}</span>
      </div>

      <div
        v-if="comparison"
        class="text-caption text-neutral-400 mt-1"
      >
        {{ comparison }}
      </div>

      <div
        v-if="targetPercent != null"
        class="mt-3"
      >
        <div class="flex items-center justify-between text-caption text-neutral-500 mb-1">
          <span>{{ targetPercent }}% of target</span>
          <span>{{ value }} / {{ target }} {{ unit }}</span>
        </div>
        <div class="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <div
            :class="[
              'h-full rounded-full transition-all duration-500',
              targetPercent >= 80 ? 'bg-success-500' : targetPercent >= 50 ? 'bg-warning-500' : 'bg-danger-500',
            ]"
            :style="{ width: `${targetPercent}%` }"
          />
        </div>
      </div>

      <div
        v-if="sparkline && sparkline.length > 1"
        class="mt-3 h-8"
      >
        <svg
          class="w-full h-full"
          viewBox="0 0 100 32"
          preserveAspectRatio="none"
        >
          <polyline
            :points="sparkline.map((v, i) => `${(i / (sparkline.length - 1)) * 100},${32 - (v / Math.max(...sparkline)) * 28}`).join(' ')"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-brand-500"
          />
        </svg>
      </div>
    </template>
  </div>
</template>
