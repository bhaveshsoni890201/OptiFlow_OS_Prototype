import { ref, onUnmounted } from 'vue'

export function useLoadingTimeout(timeoutMs = 10000) {
  const timedOut = ref(false)
  let timer: ReturnType<typeof setTimeout> | null = null

  function startTimeout() {
    timedOut.value = false
    timer = setTimeout(() => {
      timedOut.value = true
    }, timeoutMs)
  }

  function clearTimeout_() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  onUnmounted(clearTimeout_)

  return { timedOut, startTimeout, clearTimeout: clearTimeout_ }
}