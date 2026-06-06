<script setup lang="ts">
import { computed } from 'vue'
import * as HeroIcons from '@heroicons/vue/24/outline'

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant
    size?: ButtonSize
    loading?: boolean
    disabled?: boolean
    icon?: string
    fullWidth?: boolean
    type?: 'button' | 'submit'
  }>(),
  {
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
    icon: undefined,
    fullWidth: false,
    type: 'button',
  },
)

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const isDisabled = computed(() => props.loading || props.disabled)

const iconComponent = computed(() => {
  if (!props.icon) return null
  const pascal =
    props.icon
      .split('-')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join('') + 'Icon'
  return (HeroIcons as Record<string, any>)[pascal] || null
})

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2',
  secondary:
    'bg-white text-brand-600 border border-brand-600 hover:bg-brand-50 focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2',
  tertiary:
    'bg-brand-50 text-brand-600 hover:bg-brand-100 focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2',
  ghost:
    'text-neutral-600 hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2',
  danger:
    'bg-danger-600 text-white hover:bg-danger-700 focus-visible:ring-2 focus-visible:ring-danger-600 focus-visible:ring-offset-2',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-button gap-1.5',
  md: 'h-10 px-4 text-button gap-2',
  lg: 'h-12 px-6 text-button gap-2',
}

const iconSizes: Record<ButtonSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-5 h-5',
}
</script>

<template>
  <button
    :type="type"
    :disabled="isDisabled"
    :class="[
      'inline-flex items-center justify-center rounded-md font-semibold transition-colors duration-150 min-h-touch min-w-touch',
      variantClasses[variant],
      sizeClasses[size],
      fullWidth ? 'w-full' : '',
      isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    ]"
    :aria-disabled="isDisabled"
    :aria-busy="loading"
    @click="
      (e: MouseEvent) => {
        if (!isDisabled) emit('click', e)
      }
    "
  >
    <svg
      v-if="loading"
      class="animate-spin"
      :class="iconSizes[size]"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
    <component
      :is="iconComponent"
      v-else-if="iconComponent"
      :class="iconSizes[size]"
      aria-hidden="true"
    />
    <slot />
  </button>
</template>
