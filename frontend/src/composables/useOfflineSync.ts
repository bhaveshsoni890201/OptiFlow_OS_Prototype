import { computed } from 'vue'
import { useOfflineStore } from '../stores/offlineStore'

export function useOfflineSync(entityType: string, entityId?: string) {
  const offlineStore = useOfflineStore()

  const isPending = computed(() => {
    if (!entityId) return false
    return offlineStore.hasPending(entityType, entityId)
  })

  async function withSync<T>(
    action: string,
    entityId: string,
    payload: T,
    executeOnline: () => Promise<void>,
  ): Promise<void> {
    if (offlineStore.isOnline) {
      await executeOnline()
    } else {
      offlineStore.addToQueue({
        entityType,
        entityId,
        action,
        payload,
      })
    }
  }

  return {
    isPending,
    withSync,
  }
}
