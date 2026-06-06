<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
}>()
</script>

<template>
  <div
    v-if="totalPages > 1"
    class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 mt-4"
  >
    <p class="text-xs text-slate-400">
      Showing {{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, totalItems) }} of {{ totalItems }}
    </p>
    <div class="flex items-center gap-1">
      <button
        :disabled="currentPage <= 1"
        class="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        @click="emit('page-change', currentPage - 1)"
      >
        <ChevronLeftIcon class="w-4 h-4" />
      </button>
      <button
        v-for="p in totalPages"
        :key="p"
        class="w-8 h-8 text-xs font-medium rounded-md transition-colors"
        :class="p === currentPage ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'"
        @click="emit('page-change', p)"
      >
        {{ p }}
      </button>
      <button
        :disabled="currentPage >= totalPages"
        class="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        @click="emit('page-change', currentPage + 1)"
      >
        <ChevronRightIcon class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
