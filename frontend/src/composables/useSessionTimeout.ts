import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '../stores/useStore'

const TIMEOUT_MS = 30 * 60 * 1000
const WARNING_MS = 60_000

export function useSessionTimeout() {
  const store = useStore()
  const router = useRouter()
  const showWarning = ref(false)
  const countdown = ref(60)

  let activityTimer: ReturnType<typeof setTimeout> | null = null
  let countdownTimer: ReturnType<typeof setInterval> | null = null

  function resetTimer() {
    if (activityTimer) clearTimeout(activityTimer)
    activityTimer = setTimeout(onTimeout, TIMEOUT_MS)
  }

  function onTimeout() {
    showWarning.value = true
    countdown.value = Math.ceil(WARNING_MS / 1000)
    countdownTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(countdownTimer!)
        countdownTimer = null
        forceLogout()
      }
    }, 1000)
  }

  function extendSession() {
    showWarning.value = false
    if (countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
    resetTimer()
  }

  function forceLogout() {
    showWarning.value = false
    store.clearAuth()
    router.push('/login')
  }

  function onActivity() {
    if (!showWarning.value) resetTimer()
  }

  const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'wheel']

  function start() {
    resetTimer()
    events.forEach((evt) => document.addEventListener(evt, onActivity, { passive: true }))
  }

  function stop() {
    if (activityTimer) clearTimeout(activityTimer)
    if (countdownTimer) clearInterval(countdownTimer)
    events.forEach((evt) => document.removeEventListener(evt, onActivity))
  }

  onMounted(start)
  onUnmounted(stop)

  return { showWarning, countdown, extendSession, forceLogout }
}
