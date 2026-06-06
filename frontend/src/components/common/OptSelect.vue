<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ChevronDownIcon, XMarkIcon } from '@heroicons/vue/20/solid'

const props = withDefaults(
  defineProps<{
    modelValue: string
    options: { value: string; label: string }[]
    label?: string
    placeholder?: string
    disabled?: boolean
    clearable?: boolean
    error?: string
    hint?: string
  }>(),
  {
    placeholder: 'Select...',
    clearable: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const inputRef = ref<HTMLDivElement>()

const displayLabel = computed(() => {
  const opt = props.options.find((o) => o.value === props.modelValue)
  return opt?.label || ''
})

function toggle() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

function select(value: string) {
  emit('update:modelValue', value)
  isOpen.value = false
}

function clear() {
  emit('update:modelValue', '')
  isOpen.value = false
}

function onClickOutside(e: MouseEvent) {
  if (inputRef.value && !inputRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

if (typeof window !== 'undefined') {
  watch(isOpen, (open) => {
    if (open) {
      document.addEventListener('click', onClickOutside, true)
    } else {
      document.removeEventListener('click', onClickOutside, true)
    }
  })
}
</script>

<template>
  <div ref="inputRef" class="opt-select">
    <label
      v-if="label"
      class="block text-caption font-semibold text-gray-700 dark:text-neutral-300 mb-1"
      >{{ label }}</label
    >
    <button
      type="button"
      :disabled="disabled"
      class="w-full flex items-center justify-between px-3 py-2.5 border rounded-lg text-body bg-white dark:bg-neutral-800 transition-all duration-150"
      :class="[
        error
          ? 'border-danger-500 focus:ring-danger-500'
          : 'border-gray-300 dark:border-neutral-600 focus:ring-brand-600',
        disabled
          ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-neutral-900'
          : 'cursor-pointer hover:border-gray-400',
        isOpen ? 'ring-2 ring-brand-600 border-brand-600' : '',
      ]"
      @click="toggle"
    >
      <span
        :class="[
          displayLabel
            ? 'text-gray-900 dark:text-neutral-100'
            : 'text-gray-400 dark:text-neutral-500',
        ]"
      >
        {{ displayLabel || placeholder }}
      </span>
      <div class="flex items-center gap-1">
        <button
          v-if="clearable && modelValue"
          type="button"
          class="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-neutral-700"
          aria-label="Clear selection"
          @click.stop="clear"
        >
          <XMarkIcon class="h-4 w-4 text-gray-400" />
        </button>
        <ChevronDownIcon
          class="h-4 w-4 text-gray-400 transition-transform duration-200"
          :class="[isOpen ? 'rotate-180' : '']"
        />
      </div>
    </button>
    <div
      v-if="isOpen"
      class="absolute z-50 mt-1 w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 rounded-lg shadow-elevated max-h-48 overflow-y-auto"
    >
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        class="w-full text-left px-3 py-2.5 text-body hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
        :class="[
          modelValue === opt.value
            ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-semibold'
            : 'text-gray-700 dark:text-neutral-300',
        ]"
        @click="select(opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>
    <p v-if="error" class="mt-1 text-caption text-danger-500">{{ error }}</p>
    <p v-else-if="hint" class="mt-1 text-caption text-gray-400 dark:text-neutral-500">{{ hint }}</p>
  </div>
</template>
