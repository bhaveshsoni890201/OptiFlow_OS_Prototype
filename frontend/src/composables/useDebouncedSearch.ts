import { ref, watch } from 'vue'

export function useDebouncedSearch(delay = 300) {
  const immediate = ref('')
  const debounced = ref('')
  let timer: ReturnType<typeof setTimeout> | null = null

  watch(immediate, (val) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      debounced.value = val
    }, delay)
  })

  function clear() {
    immediate.value = ''
    debounced.value = ''
  }

  return { immediate, debounced, clear }
}
