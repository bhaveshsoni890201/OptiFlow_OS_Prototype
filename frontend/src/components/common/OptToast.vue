<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/vue/24/solid'

type ToastType = 'success' | 'error' | 'warning' | 'info'

const props = withDefaults(
  defineProps<{
    type?: ToastType
    message: string
    duration?: number
  }>(),
  {
    type: 'info',
    duration: 3000,
  },
)

const emit = defineEmits<{
  close: []
}>()

const visible = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

const iconMap: Record<ToastType, any> = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
}

const styleMap: Record<ToastType, string> = {
  success: 'bg-success-50 border-success-600 text-success-600',
  error: 'bg-danger-50 border-danger-600 text-danger-600',
  warning: 'bg-warning-50 border-warning-500 text-warning-500',
  info: 'bg-brand-50 border-brand-600 text-brand-600',
}

function startTimer() {
  timer = setTimeout(() => {
    visible.value = false
    setTimeout(() => emit('close'), 200)
  }, props.duration)
}

function clearTimer() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

function handleClose() {
  clearTimer()
  visible.value = false
  setTimeout(() => emit('close'), 200)
}

onMounted(() => {
  visible.value = true
  startTimer()
})

onUnmounted(() => {
  clearTimer()
})
</script>

<template>
  <div
    role="alert"
    aria-live="polite"
    :class="[
      'fixed top-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0 z-[100] flex items-start gap-3 px-4 py-3 rounded-md border-l-4 shadow-elevated min-w-[320px] max-w-[420px] transition-all duration-200',
      styleMap[type],
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2',
    ]"
  >
    <component :is="iconMap[type]" class="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
    <p class="text-body flex-1 m-0">{{ message }}</p>
    <button
      type="button"
      class="shrink-0 opacity-60 hover:opacity-100 transition-opacity min-h-touch min-w-touch flex items-center justify-center -mr-1"
      :aria-label="'Dismiss notification'"
      @click="handleClose"
    >
      <XMarkIcon class="w-4 h-4" aria-hidden="true" />
    </button>
  </div>
</template>
