<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useNotificationStore } from '../../stores/notificationStore'
import { useLoadingTimeout } from '../../composables/useLoadingTimeout'
import {
  BellIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  UserIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import OptSkeleton from '../../components/common/OptSkeleton.vue'
import type { Notification } from '../../types'
import { formatDateTime } from '../../utils/formatters'

const router = useRouter()
const { t } = useI18n()
const notificationStore = useNotificationStore()

const loading = ref(true)
const error = ref('')
const { timedOut, startTimeout, clearTimeout: clearLoadTimeout } = useLoadingTimeout(8000)

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'task', label: 'Tasks' },
  { id: 'rescue', label: 'Rescues' },
  { id: 'leave', label: 'Leave' },
  { id: 'ticket', label: 'Tickets' },
  { id: 'training', label: 'Training' },
  { id: 'system', label: 'System' },
]
const activeTab = ref('all')
const filteredNotifications = computed(() => {
  if (activeTab.value === 'all') return notificationStore.notifications
  return notificationStore.notifications.filter((n) => n.type === activeTab.value)
})

async function fetchNotifications() {
  loading.value = true
  error.value = ''
  startTimeout()
  try {
    await notificationStore.fetch()
    if (timedOut.value) throw new Error('Request timed out')
  } catch {
    error.value = timedOut.value ? 'Request timed out. Please try again.' : t('notificationsPage.loadError')
  }
  clearLoadTimeout()
  loading.value = false
}

onMounted(fetchNotifications)

const typeIconMap: Record<string, unknown> = {
  task: CheckCircleIcon,
  rescue: ExclamationCircleIcon,
  leave: UserIcon,
  ticket: UserIcon,
  system: InformationCircleIcon,
  training: CheckCircleIcon,
}

const typeColorMap: Record<string, string> = {
  task: 'text-success-600 bg-success-50',
  rescue: 'text-danger-600 bg-danger-50',
  leave: 'text-brand-600 bg-brand-50',
  ticket: 'text-brand-600 bg-brand-50',
  system: 'text-neutral-600 bg-neutral-100',
  training: 'text-info-600 bg-info-50',
}

function typeLabel(type: string): string {
  return t('notificationsPage.types.' + type)
}

function notificationRoute(n: Notification): string | null {
  if (n.link) return n.link
  return null
}

function goToNotification(n: Notification) {
  const route = notificationRoute(n)
  if (route) router.push(route)
}

function getTypeIcon(type: string) {
  const icon = typeIconMap[type]
  return icon || InformationCircleIcon
}

function markAsRead(id: string) {
  notificationStore.markRead(id)
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50 pb-24 lg:pb-8">
    <div class="sticky top-0 z-10 bg-white border-b border-neutral-200 px-4 py-3">
      <h1 class="text-h2 text-neutral-900 flex items-center gap-2">
        <BellIcon class="w-6 h-6 text-neutral-500" />
        {{ $t('notificationsPage.title') || 'Notifications' }}
      </h1>
    </div>

    <div class="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
      <div class="flex gap-1 overflow-x-auto pb-1 scrollbar-none" role="tablist" aria-label="Notification categories">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          role="tab"
          :aria-selected="activeTab === tab.id"
          class="px-4 py-2 text-button rounded-full whitespace-nowrap transition-colors"
          :class="
            activeTab === tab.id
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          "
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <template v-if="loading">
        <div class="space-y-3">
          <div v-for="i in 5" :key="i" class="card p-4">
            <OptSkeleton variant="rectangular" height="16px" class="mb-2" />
            <OptSkeleton variant="rectangular" width="60%" height="12px" />
          </div>
        </div>
      </template>

      <div v-else-if="error" role="alert" aria-live="polite" class="card p-8 text-center">
        <ExclamationTriangleIcon class="h-12 w-12 text-danger-400 mx-auto mb-3" />
        <p class="text-body-strong text-neutral-900 mb-1">{{ $t('notificationsPage.failedToLoad') || 'Failed to load notifications' }}</p>
        <p class="text-body text-neutral-500">{{ error }}</p>
        <button
          class="mt-3 px-5 py-2 bg-brand-600 text-white rounded-lg text-button hover:bg-brand-700 transition-colors"
          @click="fetchNotifications"
        >
          <ArrowPathIcon class="h-4 w-4 inline mr-1" /> {{ $t('common.retry') }}
        </button>
      </div>

      <div v-else-if="filteredNotifications.length === 0" class="card p-8 text-center">
        <BellIcon class="h-12 w-12 text-neutral-300 mx-auto mb-3" />
        <p class="text-body-strong text-neutral-500">{{ $t('notificationsPage.empty') || 'No notifications' }}</p>
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="notification in filteredNotifications"
          :key="notification.id"
          class="card p-4 flex items-start gap-3 cursor-pointer hover:shadow-md transition-shadow"
          :class="{ 'border-l-4 border-l-brand-500': !notification.read }"
          @click="goToNotification(notification)"
        >
          <div
            class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            :class="typeColorMap[notification.type] || 'text-neutral-600 bg-neutral-100'"
          >
            <component :is="getTypeIcon(notification.type)" class="w-5 h-5" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-body text-neutral-900 line-clamp-2" :class="{ 'font-semibold': !notification.read }">
              {{ notification.title }}
            </p>
            <p class="text-caption text-neutral-400 mt-1">{{ formatDateTime(notification.timestamp) }}</p>
          </div>
          <button
            v-if="!notification.read"
            class="p-1 text-neutral-400 hover:text-neutral-600 rounded shrink-0"
            :aria-label="$t('common.markRead') || 'Mark as read'"
            @click.stop="markAsRead(notification.id)"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>