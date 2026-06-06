import { ref } from 'vue'

const API_HEALTH_URL = '/api/health'
const CHECK_INTERVAL = 60_000

export interface HealthStatus {
  healthy: boolean
  lastChecked: string | null
  error: string | null
}

const status = ref<HealthStatus>({
  healthy: true,
  lastChecked: null,
  error: null,
})

let timer: ReturnType<typeof setInterval> | null = null

async function checkHealth(): Promise<void> {
  try {
    const res = await fetch(API_HEALTH_URL, { method: 'GET', signal: AbortSignal.timeout(5000) })
    status.value = {
      healthy: res.ok,
      lastChecked: new Date().toISOString(),
      error: res.ok ? null : `HTTP ${res.status}`,
    }
  } catch (err) {
    status.value = {
      healthy: false,
      lastChecked: new Date().toISOString(),
      error: err instanceof Error ? err.message : 'Network error',
    }
  }
}

export function useHealthCheck() {
  function start() {
    checkHealth()
    timer = setInterval(checkHealth, CHECK_INTERVAL)
  }

  function stop() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  return { status, start, stop, checkNow: checkHealth }
}
