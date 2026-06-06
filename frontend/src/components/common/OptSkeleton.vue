<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'text' | 'circular' | 'rectangular'
    width?: string
    height?: string
    lines?: number
    rounded?: boolean
  }>(),
  {
    variant: 'text',
    lines: 3,
    rounded: false,
  },
)

const variantClass = { text: 'h-4 rounded', circular: 'rounded-full', rectangular: 'rounded-lg' }
</script>

<template>
  <div v-if="variant === 'text'" class="flex flex-col gap-2" :style="{ width: width || '100%' }">
    <div
      v-for="i in lines"
      :key="i"
      class="animate-pulse bg-gray-200 dark:bg-neutral-700"
      :class="[variantClass[variant]]"
      :style="{ width: i === lines ? '60%' : '100%' }"
    ></div>
  </div>
  <div
    v-else
    class="animate-pulse bg-gray-200 dark:bg-neutral-700"
    :class="[variantClass[variant]]"
    :style="{
      width: width || '40px',
      height: height || (variant === 'circular' ? '40px' : '100px'),
    }"
  ></div>
</template>
