<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/20/solid'

const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    placeholder?: string
    disabled?: boolean
    error?: string
    min?: string
    max?: string
  }>(),
  {
    placeholder: 'Select date...',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const viewDate = ref(new Date())
const pickerRef = ref<HTMLDivElement>()

const year = computed(() => viewDate.value.getFullYear())
const month = computed(() => viewDate.value.getMonth())

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const daysInMonth = computed(() => new Date(year.value, month.value + 1, 0).getDate())
const firstDayOfMonth = computed(() => new Date(year.value, month.value, 1).getDay())

const calendarDays = computed(() => {
  const days: (number | null)[] = []
  for (let i = 0; i < firstDayOfMonth.value; i++) days.push(null)
  for (let i = 1; i <= daysInMonth.value; i++) days.push(i)
  return days
})

function prevMonth() {
  viewDate.value = new Date(year.value, month.value - 1, 1)
}
function nextMonth() {
  viewDate.value = new Date(year.value, month.value + 1, 1)
}

function selectDay(day: number | null) {
  if (day === null || props.disabled) return
  const d = new Date(year.value, month.value, day)
  const formatted = d.toISOString().split('T')[0]
  if (props.min && formatted < props.min) return
  if (props.max && formatted > props.max) return
  emit('update:modelValue', formatted)
  isOpen.value = false
}

function onClickOutside(e: MouseEvent) {
  if (pickerRef.value && !pickerRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

import { watch } from 'vue'
watch(isOpen, (open) => {
  if (open) {
    document.addEventListener('click', onClickOutside, true)
  } else {
    document.removeEventListener('click', onClickOutside, true)
  }
})
</script>

<template>
  <div ref="pickerRef" class="opt-datepicker relative">
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
        error ? 'border-danger-500' : 'border-gray-300 dark:border-neutral-600',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400',
      ]"
      @click="isOpen = !isOpen"
    >
      <span
        :class="[
          modelValue
            ? 'text-gray-900 dark:text-neutral-100'
            : 'text-gray-400 dark:text-neutral-500',
        ]"
      >
        {{
          modelValue
            ? new Date(modelValue).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : placeholder
        }}
      </span>
      <ChevronDownIcon class="h-4 w-4 text-gray-400" :class="[isOpen ? 'rotate-180' : '']" />
    </button>
    <div
      v-if="isOpen"
      class="absolute z-50 mt-1 w-72 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 rounded-lg shadow-elevated p-4"
    >
      <div class="flex items-center justify-between mb-3">
        <button
          type="button"
          class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700"
          aria-label="Previous month"
          @click="prevMonth"
        >
          <ChevronLeftIcon class="h-5 w-5 text-gray-600 dark:text-neutral-300" />
        </button>
        <span class="text-body font-semibold text-gray-900 dark:text-neutral-100"
          >{{ monthNames[month] }} {{ year }}</span
        >
        <button
          type="button"
          class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700"
          aria-label="Next month"
          @click="nextMonth"
        >
          <ChevronRightIcon class="h-5 w-5 text-gray-600 dark:text-neutral-300" />
        </button>
      </div>
      <div class="grid grid-cols-7 gap-1 text-center">
        <div
          v-for="d in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']"
          :key="d"
          class="text-caption text-gray-400 dark:text-neutral-500 py-1"
        >
          {{ d }}
        </div>
        <button
          v-for="(day, i) in calendarDays"
          :key="i"
          :disabled="day === null"
          type="button"
          class="text-body rounded-lg py-1.5 transition-colors"
          :class="[
            day === null ? 'invisible' : '',
            modelValue &&
            day &&
            new Date(modelValue).getDate() === day &&
            new Date(modelValue).getMonth() === month &&
            new Date(modelValue).getFullYear() === year
              ? 'bg-brand-600 text-white'
              : 'text-gray-700 dark:text-neutral-300 hover:bg-brand-50 dark:hover:bg-brand-900/20',
          ]"
          @click="selectDay(day)"
        >
          {{ day }}
        </button>
      </div>
    </div>
    <p v-if="error" class="mt-1 text-caption text-danger-500">{{ error }}</p>
  </div>
</template>
