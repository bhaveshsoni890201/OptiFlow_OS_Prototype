<script setup lang="ts">
import { ref } from 'vue'
import {
  XMarkIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
} from '@heroicons/vue/20/solid'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    type?: 'info' | 'success' | 'warning' | 'error'
    message: string
    dismissible?: boolean
  }>(),
  {
    type: 'info',
    dismissible: true,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const iconMap = {
  info: InformationCircleIcon,
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  error: ExclamationCircleIcon,
}
const colorMap = {
  info: 'bg-info-600/10 text-info-600 border-info-600/20',
  success: 'bg-success-50 text-success-600 border-success-600/20',
  warning: 'bg-warning-50 text-warning-500 border-warning-500/20',
  error: 'bg-danger-50 text-danger-600 border-danger-600/20',
}
const Icon = iconMap[props.type]

function dismiss() {
  emit('update:modelValue', false)
}
</script>

<template>
  <Transition name="banner">
    <div
      v-if="modelValue"
      class="flex items-start gap-3 px-4 py-3 border rounded-lg text-body"
      :class="[colorMap[type]]"
    >
      <Icon class="h-5 w-5 shrink-0 mt-0.5" />
      <span class="flex-1">{{ message }}</span>
      <button
        v-if="dismissible"
        class="p-1.5 rounded hover:opacity-70"
        aria-label="Dismiss"
        @click="dismiss"
      >
        <XMarkIcon class="h-5 w-5" />
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.banner-enter-active,
.banner-leave-active {
  transition: all 0.3s ease;
}
.banner-enter-from,
.banner-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
