import { ref, computed } from 'vue'

export function usePagination<T>(items: import('vue').ComputedRef<T[]> | import('vue').Ref<T[]>, pageSize = 20) {
  const currentPage = ref(1)

  const totalItems = computed(() => (Array.isArray(items.value) ? items.value.length : 0))
  const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / pageSize)))

  const paginated = computed<T[]>(() => {
    const list = Array.isArray(items.value) ? items.value : []
    const start = (currentPage.value - 1) * pageSize
    return list.slice(start, start + pageSize)
  })

  const hasPrev = computed(() => currentPage.value > 1)
  const hasNext = computed(() => currentPage.value < totalPages.value)

  function goTo(page: number) {
    currentPage.value = Math.max(1, Math.min(page, totalPages.value))
  }

  function next() {
    if (hasNext.value) currentPage.value++
  }

  function prev() {
    if (hasPrev.value) currentPage.value--
  }

  const pageNumbers = computed(() => {
    const pages: number[] = []
    const total = totalPages.value
    const current = currentPage.value
    let start = Math.max(1, current - 2)
    let end = Math.min(total, current + 2)
    if (end - start < 4) {
      if (start === 1) end = Math.min(total, start + 4)
      else start = Math.max(1, end - 4)
    }
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  })

  return {
    currentPage,
    totalItems,
    totalPages,
    paginated,
    hasPrev,
    hasNext,
    goTo,
    next,
    prev,
    pageNumbers,
    pageSize,
  }
}
