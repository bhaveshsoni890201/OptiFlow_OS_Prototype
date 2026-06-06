<script setup lang="ts">
import { computed } from 'vue'

export interface Tab {
  id: string
  label: string
  badge?: number
  disabled?: boolean
  icon?: string
}

const props = withDefaults(
  defineProps<{
    tabs: Tab[]
    modelValue: string
    variant?: 'underline' | 'pills'
    size?: 'sm' | 'md'
    lazy?: boolean
  }>(),
  {
    variant: 'underline',
    size: 'md',
    lazy: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [tab: Tab]
}>()

const activeIndex = computed(() => props.tabs.findIndex((t) => t.id === props.modelValue))

function select(tab: Tab) {
  if (tab.disabled || tab.id === props.modelValue) return
  emit('update:modelValue', tab.id)
  emit('change', tab)
}
</script>

<template>
  <div class="opt-tabs">
    <div
      :class="[
        'flex',
        variant === 'underline' ? 'border-b border-neutral-200 gap-0' : 'gap-1 p-1 bg-neutral-100 rounded-lg',
      ]"
      role="tablist"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        role="tab"
        :aria-selected="tab.id === modelValue"
        :aria-disabled="tab.disabled"
        :disabled="tab.disabled"
        :class="[
          'whitespace-nowrap transition-colors font-semibold',
          variant === 'underline' ? [
            size === 'sm' ? 'px-3 py-2 text-caption' : 'px-4 py-3 text-body',
            tab.id === modelValue
              ? 'text-brand-600 border-b-2 border-brand-600 -mb-px'
              : 'text-neutral-500 hover:text-neutral-700 hover:border-b-2 hover:border-neutral-300',
            tab.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
          ] : [
            size === 'sm' ? 'px-3 py-1.5 text-caption' : 'px-4 py-2 text-body',
            'rounded-md',
            tab.id === modelValue
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-700',
            tab.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
          ],
        ]"
        @click="select(tab)"
      >
        <span class="inline-flex items-center gap-2">
          {{ tab.label }}
          <span
            v-if="tab.badge != null && tab.badge > 0"
            class="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-caption font-semibold"
            :class="[
              tab.id === modelValue
                ? 'bg-brand-100 text-brand-700'
                : 'bg-neutral-200 text-neutral-600',
            ]"
          >
            {{ tab.badge > 99 ? '99+' : tab.badge }}
          </span>
        </span>
      </button>
    </div>

    <div class="pt-4">
      <template v-for="tab in tabs" :key="tab.id">
        <div
          v-if="tab.id === modelValue && (!lazy || (lazy && tab.id === modelValue))"
          v-show="tab.id === modelValue"
          role="tabpanel"
        >
          <slot :name="tab.id" />
          <slot v-if="!$slots[tab.id]" />
        </div>
      </template>
    </div>
  </div>
