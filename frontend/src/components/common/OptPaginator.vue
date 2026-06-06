<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/20/solid'

const props = withDefaults(
  defineProps<{
    currentPage: number
    totalItems: number
    pageSize?: number
    maxVisible?: number
  }>(),
  {
    pageSize: 20,
    maxVisible: 7,
  },
)

const emit = defineEmits<{
  'update:currentPage': [page: number]
}>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.totalItems / props.pageSize)))

const pages = computed(() => {
  const total = totalPages.value
  const max = props.maxVisible
  const current = props.currentPage

  if (total <= max) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const half = Math.floor(max / 2)
  let start = current - half
  let end = current + half

  if (start < 1) {
    start = 1
    end = max
  }
  if (end > total) {
    end = total
    start = total - max + 1
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

const showStartEllipsis = computed(() => pages.value[0] > 1)
const showEndEllipsis = computed(() => pages.value[pages.value.length - 1] < totalPages.value)

function goTo(page: number) {
  if (page < 1 || page > totalPages.value || page === props.currentPage) return
  emit('update:currentPage', page)
}
</script>

<template>
  <nav v-if="totalPages > 1" class="inline-flex items-center gap-1" aria-label="Pagination">
    <button
      type="button"
      :disabled="currentPage === 1"
      class="inline-flex items-center justify-center w-8 h-8 rounded-md text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      :aria-label="'Previous page'"
      @click="goTo(currentPage - 1)"
    >
      <ChevronLeftIcon class="w-4 h-4" />
    </button>

    <button
      v-if="showStartEllipsis"
      type="button"
      class="inline-flex items-center justify-center w-8 h-8 rounded-md text-neutral-400 hover:bg-neutral-100 transition-colors text-caption"
      @click="goTo(1)"
    >
      1
    </button>
    <span
      v-if="showStartEllipsis"
      class="inline-flex items-center justify-center w-8 h-8 text-caption text-neutral-400"
    >
      ...
    </span>

    <button
      v-for="page in pages"
      :key="page"
      type="button"
      :class="[
        'inline-flex items-center justify-center w-8 h-8 rounded-md text-caption font-semibold transition-colors',
        page === currentPage
          ? 'bg-brand-600 text-white'
          : 'text-neutral-600 hover:bg-neutral-100',
      ]"
      :aria-label="'Page ' + page"
      :aria-current="page === currentPage ? 'page' : undefined"
      @click="goTo(page)"
    >
      {{ page }}
    </button>

    <span
      v-if="showEndEllipsis"
      class="inline-flex items-center justify-center w-8 h-8 text-caption text-neutral-400"
    >
      ...
    </span>
    <button
      v-if="showEndEllipsis"
      type="button"
      class="inline-flex items-center justify-center w-8 h-8 rounded-md text-neutral-400 hover:bg-neutral-100 transition-colors text-caption"
      @click="goTo(totalPages)"
    >
      {{ totalPages }}
    </button>

    <button
      type="button"
      :disabled="currentPage === totalPages"
      class="inline-flex items-center justify-center w-8 h-8 rounded-md text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      :aria-label="'Next page'"
      @click="goTo(currentPage + 1)"
    >
      <ChevronRightIcon class="w-4 h-4" />
    </button>
  </nav>
</template>
