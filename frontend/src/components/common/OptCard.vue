<script setup lang="ts">
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import OptButton from './OptButton.vue'
import OptSpinner from './OptSpinner.vue'

type CardVariant = 'default' | 'bordered' | 'elevated'

const props = withDefaults(
  defineProps<{
    variant?: CardVariant
    loading?: boolean
    error?: string
    padding?: 'none' | 'sm' | 'md' | 'lg'
  }>(),
  {
    variant: 'default',
    loading: false,
    error: undefined,
    padding: 'md',
  },
)

const emit = defineEmits<{
  retry: []
}>()

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-white border border-neutral-200',
  bordered: 'bg-white border-2 border-neutral-200',
  elevated: 'bg-white border border-neutral-200 shadow-md',
}

const paddingClasses: Record<string, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
}
</script>

<template>
  <div :class="['rounded-lg', variantClasses[variant]]">
    <div v-if="loading" class="flex items-center justify-center py-12">
      <OptSpinner size="lg" />
    </div>

    <div
      v-else-if="error"
      class="flex flex-col items-center justify-center py-12 text-center"
    >
      <div class="w-12 h-12 rounded-full bg-danger-50 flex items-center justify-center mb-3">
        <ExclamationTriangleIcon class="w-6 h-6 text-danger-600" />
      </div>
      <p class="text-body-strong text-neutral-700 mb-1">Something went wrong</p>
      <p class="text-caption text-neutral-500 mb-3">{{ error }}</p>
      <OptButton variant="secondary" size="sm" @click="emit('retry')">
        Retry
      </OptButton>
    </div>

    <template v-else>
      <div v-if="$slots.header" :class="[paddingClasses[padding], 'border-b border-neutral-100']">
        <slot name="header" />
      </div>
      <div :class="[paddingClasses[padding]]">
        <slot />
      </div>
      <div v-if="$slots.footer" :class="[paddingClasses[padding], 'border-t border-neutral-100']">
        <slot name="footer" />
      </div>
    </template>
  </div>
</template>
