<script setup lang="ts">
import { computed } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/solid'
import * as HeroIcons from '@heroicons/vue/24/solid'

type ChipVariant =
  | 'pending'
  | 'in-progress'
  | 'blocked'
  | 'escalated'
  | 'completed'
  | 'reviewed'
  | 'default'
type ChipSize = 'sm' | 'md'

const props = withDefaults(
  defineProps<{
    variant?: ChipVariant
    size?: ChipSize
    removable?: boolean
    icon?: string
  }>(),
  {
    variant: 'default',
    size: 'sm',
    removable: false,
    icon: undefined,
  },
)

const emit = defineEmits<{
  remove: []
}>()

const iconComponent = computed(() => {
  if (!props.icon) return null
  const pascal =
    props.icon
      .split('-')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join('') + 'Icon'
  return (HeroIcons as Record<string, any>)[pascal] || null
})

const variantClasses: Record<ChipVariant, string> = {
  pending: 'bg-neutral-100 text-neutral-600',
  'in-progress': 'bg-info-600/10 text-info-600',
  blocked: 'bg-warning-50 text-warning-500',
  escalated: 'bg-danger-50 text-danger-600',
  completed: 'bg-success-50 text-success-600',
  reviewed: 'bg-brand-50 text-brand-600',
  default: 'bg-neutral-100 text-neutral-600',
}

const sizeClasses: Record<ChipSize, string> = {
  sm: 'text-caption px-2 py-0.5 gap-1',
  md: 'text-body px-3 py-1 gap-1.5',
}

const iconSizes: Record<ChipSize, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center rounded-full font-medium',
      variantClasses[variant],
      sizeClasses[size],
    ]"
  >
    <component
      :is="iconComponent"
      v-if="iconComponent"
      :class="iconSizes[size]"
      aria-hidden="true"
    />
    <slot />
    <button
      v-if="removable"
      type="button"
      class="flex items-center justify-center rounded-full hover:bg-black/10 transition-colors -mr-0.5"
      :class="size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'"
      :aria-label="'Remove'"
      @click="emit('remove')"
    >
      <XMarkIcon :class="iconSizes[size]" aria-hidden="true" />
    </button>
  </span>
</template>
