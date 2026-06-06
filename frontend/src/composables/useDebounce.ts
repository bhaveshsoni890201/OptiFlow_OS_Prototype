import { ref, watch, type Ref } from 'vue'

export function useDebounce<T>(
  initialValue: T,
  delay = 300,
): { value: Ref<T>; debouncedValue: Ref<T> } {
  const value = ref(initialValue) as Ref<T>
  const debouncedValue = ref(initialValue) as Ref<T>
  let timeout: ReturnType<typeof setTimeout> | null = null

  watch(value, (newValue) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
  })

  return { value, debouncedValue }
}
