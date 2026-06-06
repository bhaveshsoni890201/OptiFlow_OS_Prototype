<script setup lang="ts">
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

defineProps<{
  loading?: boolean
  error?: string | null
  empty?: boolean
  emptyText?: string
  loadingText?: string
  errorText?: string
}>()

const emit = defineEmits<{
  (e: 'retry'): void
}>()
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center py-20">
    <div class="flex flex-col items-center gap-3">
      <div class="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      <span class="text-sm text-slate-500">{{ loadingText || 'Loading...' }}</span>
    </div>
  </div>
  <div v-else-if="error" class="flex items-center justify-center min-h-[40vh]">
    <div class="text-center max-w-sm">
      <ExclamationTriangleIcon class="w-12 h-12 text-red-400 mx-auto mb-3" />
      <p class="text-sm font-medium text-red-600">{{ errorText || error }}</p>
      <button
        class="mt-4 inline-flex items-center gap-2 px-4 h-10 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        @click="emit('retry')"
      >
        Retry
      </button>
    </div>
  </div>
  <div v-else-if="empty" class="flex items-center justify-center py-16">
    <div class="text-center max-w-sm">
      <ExclamationTriangleIcon class="w-10 h-10 text-slate-300 mx-auto mb-3" />
      <p class="text-sm text-slate-500">{{ emptyText || 'No data available' }}</p>
    </div>
  </div>
  <slot v-else />
</template>