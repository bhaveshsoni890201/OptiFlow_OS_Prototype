import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface QueuedMutation {
  id: string
  entityType: string
  entityId: string
  action: string
  payload: unknown
  timestamp: number
  retryCount: number
}

const STORAGE_KEY = 'optiflow-offline-queue'

export const useOfflineStore = defineStore('offline', () => {
  const isOnline = ref(navigator.onLine)

  function loadQueue(): QueuedMutation[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  const queue = ref<QueuedMutation[]>(loadQueue())

  const pendingCount = computed(() => queue.value.length)

  function persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue.value))
    } catch {
      // localStorage unavailable
    }
  }

  function addToQueue(mutation: {
    entityType: string
    entityId: string
    action: string
    payload: unknown
  }): void {
    queue.value.push({
      ...mutation,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retryCount: 0,
    })
    persist()
  }

  function removeFromQueue(id: string): void {
    queue.value = queue.value.filter((m) => m.id !== id)
    persist()
  }

  function getPendingForEntity(entityType: string, entityId: string): QueuedMutation | undefined {
    return queue.value.find((m) => m.entityType === entityType && m.entityId === entityId)
  }

  function hasPending(entityType: string, entityId: string): boolean {
    return queue.value.some((m) => m.entityType === entityType && m.entityId === entityId)
  }

  function clearQueue(): void {
    queue.value = []
    persist()
  }

  function handleOnline(): void {
    isOnline.value = true
  }

  function handleOffline(): void {
    isOnline.value = false
  }

  function startListening(): void {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  }

  function stopListening(): void {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }

  async function syncQueue(): Promise<void> {
    if (queue.value.length === 0) return
    for (const item of [...queue.value]) {
      try {
        // Route mutation to the appropriate service based on entityType
        const { default: client } = await import('../api/client')
        const entityEndpoints: Record<string, string> = {
          task: '/api/method/optiflow.api.tasks',
          leave: '/api/method/optiflow.api.leave',
          ticket: '/api/method/optiflow.api.tickets',
          attendance: '/api/method/optiflow.api.attendance',
        }
        const base = entityEndpoints[item.entityType]
        if (base) {
          await client.post(`${base}.${item.action}`, item.payload as any)
        }
        removeFromQueue(item.id)
      } catch {
        item.retryCount++
        persist()
      }
    }
  }

  // NOTE: startListening registers online/offline listeners at module scope.
  // Call stopListening() from the consuming app's unmount lifecycle to prevent leaks.
  // Pinia stores don't have built-in lifecycle hooks, so the parent should invoke
  // offlineStore.stopListening() when the app is destroyed.
  startListening()

  return {
    isOnline,
    queue,
    pendingCount,
    addToQueue,
    removeFromQueue,
    getPendingForEntity,
    hasPending,
    clearQueue,
    syncQueue,
    startListening,
    stopListening,
  }
})
