<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useNotificationStore } from '../../stores/notificationStore'
import { useLoadingTimeout } from '../../composables/useLoadingTimeout'
import { usePagination } from '../../composables/usePagination'
import OptPagination from '../../components/common/OptPagination.vue'
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
import OptEmptyState from '../../components/common/OptEmptyState.vue'

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

const {
  paginated: paginatedNotifs,
  totalPages: notifTotalPages,
  currentPage: notifCurrentPage,
  totalItems: notifTotalItems,
  goTo: notifGoTo,
} = usePagination(filteredNotifications, 20)

watch(filteredNotifications, () => notifGoTo(1))

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

function notificationLink(n: Notification): string | null {
  if (!n.link) return null
  const routeMap: Record<string, string> = {
    task: '/doer/tasks',
    rescue: '/doer/tasks',
    leave: '/doer/leave',
    ticket: '/doer/tickets',
    training: '/doer/training',
  }
  return routeMap[n.type] || null
}

function goToNotification(n: Notification) {
  notificationStore.markRead(n.id)
  const link = notificationLink(n)
  if (link) router.push(link)
}

function handleMarkRead(id: string, event: MouseEvent) {
  event.stopPropagation()
  notificationStore.markRead(id)
}

function handleMarkAllRead() {
  notificationStore.markAllRead()
}
</script>

<template>
  <div class="flex items-center justify-between">
    <h1 class="text-h2 text-neutral-900">{{ $t('notificationsPage.notifications') }}</h1>
    <button
      v-if="notificationStore.unreadCount > 0"
      class="text-caption text-brand-600 hover:text-brand-700 font-semibold min-h-touch"
      @click="handleMarkAllRead"
    >
      {{ $t('notificationsPage.markAllRead') }}
    </button>
  </div>

  <!-- Loading state -->
  <div v-if="loading" class="space-y-3" aria-live="polite">
    <OptSkeleton variant="rectangular" height="72px" />
    <OptSkeleton variant="rectangular" height="72px" />
    <OptSkeleton variant="rectangular" height="72px" />
    <OptSkeleton variant="rectangular" height="72px" />
  </div>

  <!-- Error state -->
  <div v-else-if="error" class="bg-white rounded-lg shadow-card p-8 text-center" role="alert" aria-live="polite">
    <ExclamationTriangleIcon class="h-12 w-12 text-danger-400 mx-auto mb-3" />
    <p class="text-body-strong text-neutral-900 mb-1">{{ $t('notificationsPage.failedToLoad') }}</p>
    <p class="text-body text-neutral-500">{{ error }}</p>
    <div class="flex items-center justify-center gap-2 mt-4">
      <button
        class="px-5 py-2 bg-brand-600 text-white rounded-lg text-button hover:bg-brand-700 transition-colors"
        @click="fetchNotifications"
      >
        {{ $t('common.retry') }}
      </button>
      <button
        class="px-5 py-2 text-neutral-600 border border-neutral-300 rounded-lg text-button hover:bg-neutral-50 transition-colors"
        @click="error = ''"
      >
        {{ $t('common.dismiss') }}
      </button>
    </div>
  </div>

  <!-- Content -->
  <div v-else>
    <!-- Tabs -->
    <div class="flex overflow-x-auto gap-1 sm:gap-2 -mx-4 sm:mx-0 px-4 sm:px-0 pb-1 scrollbar-none">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="flex-shrink-0 px-3.5 py-2 rounded-lg text-button transition-colors whitespace-nowrap"
        :class="
          activeTab === tab.id
            ? 'bg-brand-600 text-white'
            : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
        "
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <OptEmptyState
      v-if="filteredNotifications.length === 0"
      type="data"
      :title="$t('notificationsPage.empty')"
      :description="$t('notificationsPage.emptyMessage')"
      :action-label="$t('notificationsPage.goToDashboard')"
      @action="router.push('/doer')"
    />

    <!-- List -->
    <div v-else class="space-y-2">
      <div
        v-for="item in paginatedNotifs"
        :key="item.id"
        class="bg-white rounded-lg shadow-card p-4 cursor-pointer transition-all hover:shadow-card-hover active:scale-[0.99] flex items-start gap-3"
        :class="!item.read ? 'border-l-4 border-l-brand-600' : ''"
        @click="goToNotification(item)"
      >
        <div
          class="flex items-center justify-center w-9 h-9 rounded-full shrink-0 mt-0.5"
          :class="typeColorMap[item.type] || 'bg-neutral-100 text-neutral-500'"
        >
          <component :is="typeIconMap[item.type] || BellIcon" class="w-5 h-5" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="text-body-strong text-neutral-900" :class="{ 'font-semibold': !item.read }">
                {{ item.title }}
              </p>
              <p class="text-caption text-neutral-500 mt-0.5">{{ typeLabel(item.type) }}</p>
            </div>
            <span class="text-caption text-neutral-400 shrink-0 whitespace-nowrap">{{ formatDateTime(item.timestamp) }}</span>
          </div>
          <p class="text-body text-neutral-600 mt-1.5 line-clamp-2">{{ item.context }}</p>
          <div class="flex items-center gap-3 mt-2">
            <button
              v-if="!item.read"
              class="text-caption text-brand-600 hover:text-brand-700 font-semibold"
              @click="handleMarkRead(item.id, $event)"
            >
              {{ $t('notificationsPage.markRead') }}
            </button>
            <span
              v-if="notificationLink(item)"
              class="text-caption text-brand-600 flex items-center gap-1"
            >
              {{ $t('notificationsPage.viewDetails') }}
            </span>
          </div>
        </div>
        <div v-if="!item.read" class="w-2 h-2 rounded-full bg-brand-600 shrink-0 mt-2"></div>
      </div>
    </div>
    <OptPagination
      :current-page="notifCurrentPage"
      :total-pages="notifTotalPages"
      :total-items="notifTotalItems"
      :page-size="20"
      @page-change="notifCurrentPage = $event"
    />
  </div>
</template>