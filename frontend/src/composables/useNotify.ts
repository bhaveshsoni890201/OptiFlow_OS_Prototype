import { useNotificationStore } from '../stores/notificationStore'

export function useNotify() {
  const store = useNotificationStore()

  return {
    success(message: string) {
      store.addNotification({ type: 'success', message })
    },
    error(message: string) {
      store.addNotification({ type: 'error', message })
    },
    warning(message: string) {
      store.addNotification({ type: 'warning', message })
    },
    info(message: string) {
      store.addNotification({ type: 'info', message })
    },
  }
}
