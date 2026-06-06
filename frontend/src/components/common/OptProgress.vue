<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    value: number
    max?: number
    size?: 'sm' | 'md' | 'lg'
    variant?: 'brand' | 'success' | 'warning' | 'danger'
    showLabel?: boolean
    label?: string
  }>(),
  {
    max: 100,
    size: 'md',
    variant: 'brand',
    showLabel: false,
  },
)

const percent = computed(() => Math.min(100, Math.max(0, (props.value / props.max) * 100)))
const heightMap = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }
const colorMap = {
  brand: 'bg-brand-600',
  success: 'bg-success-600',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
}
</script>

<template>
  <div class="w-full">
    <div v-if="showLabel && label" class="flex items-center justify-between mb-1">
      <span class="text-caption font-semibold text-gray-700 dark:text-neutral-300">{{
        label
      }}</span>
      <span class="text-caption text-gray-500 dark:text-neutral-400"
        >{{ Math.round(percent) }}%</span
      >
    </div>
    <div
      class="w-full bg-gray-200 dark:bg-neutral-700 rounded-full overflow-hidden"
      :class="[heightMap[size]]"
    >
      <div
        class="rounded-full transition-all duration-500 ease-out"
        :class="[heightMap[size], colorMap[variant]]"
        :style="{ width: `${percent}%` }"
      ></div>
    </div>
  </div>
</template>
