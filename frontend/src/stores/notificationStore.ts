
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Notification } from '../types'
import { getNotifications, markNotificationRead as markReadSvc, markAllNotificationsRead } from '../services'
import { logger } from '../utils/logger'
import { subscribe, connectSSE } from '../services/realtimeService'
export const useNotificationStore = defineStore('notifications', () => {
const notifications = ref<Notification[]>([])
const loading = ref(false)
const error = ref('')
const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)

let subscribed = false
let unsubscribe: (() => void) | null = null

function subscribeToRealtime(): void {
  if (subscribed) return
  subscribed = true
  connectSSE()
  unsubscribe = subscribe('notification', (data: any) => {
    if (data?.id && data?.title) {
      notifications.value.unshift({
        id: data.id,
        type: data.type || 'system',
        title: data.title,
        context: data.context || '',
        timestamp: data.timestamp || new Date().toISOString(),
        read: false,
        link: data.link || '',
      })
    }
  })
}

function cleanup(): void {
  if (unsubscribe) {
    unsubscribe()
    unsubscribe = null
  }
}

subscribeToRealtime()
async function fetch(): Promise<void> {
loading.value = true
error.value = ''
try {
notifications.value = await getNotifications()
} catch (e) {
error.value = 'Failed to load notifications'
logger.error('NotificationStore', 'Failed to fetch notifications', e)
} finally {
loading.value = false
}
}
async function markRead(id: string): Promise<void> {
try {
await markReadSvc(id)
const n = notifications.value.find((n) => n.id === id)
if (n) n.read = true
} catch (e) {
  logger.error('NotificationStore', 'Failed to mark notification as read', e)
}
}
async function markAllRead(): Promise<void> {
try {
await markAllNotificationsRead()
notifications.value.forEach((n) => {
      n.read = true
    })
} catch (e) {
  logger.error('NotificationStore', 'Failed to mark all notifications as read', e)
}
}
function addNotification(n: { type: string; message: string }): void {
const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    notifications.value.unshift({
      id,
      type: 'system' as const,
      title: n.message,
      context: n.type,
      timestamp: new Date().toISOString(),
      read: false,
      link: '',
    })
}
return {
notifications,
loading,
error,
unreadCount,
fetch,
markRead,
markAllRead,
addNotification,
subscribeToRealtime,
cleanup,
}
})
