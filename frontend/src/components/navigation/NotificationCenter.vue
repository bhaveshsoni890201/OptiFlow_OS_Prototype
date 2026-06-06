<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  XMarkIcon,
  BellIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  UserIcon,
} from '@heroicons/vue/24/outline'

const props = withDefaults(
  defineProps<{
    open: boolean
  }>(),
  {
    open: false,
  },
)

const emit = defineEmits<{
  (e: 'close'): void
}>()

type Tab = 'all' | 'unread' | 'mentions' | 'tasks' | 'system'
const activeTab = ref<Tab>('all')

const tabs: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'mentions', label: 'Mentions' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'system', label: 'System' },
]

interface Notification {
  id: string
  type: 'task' | 'rescue' | 'leave' | 'approval' | 'system' | 'mention'
  title: string
  message: string
  time: string
  read: boolean
  avatar?: string
}

const notifications = ref<Notification[]>([
  {
    id: '1',
    type: 'task',
    title: 'Task Completed',
    message: 'Raj completed the weaving quality check task',
    time: '2m ago',
    read: false,
  },
  {
    id: '2',
    type: 'rescue',
    title: 'Rescue Needed',
    message: 'Loom #7 maintenance overdue by 2h',
    time: '5m ago',
    read: false,
  },
  {
    id: '3',
    type: 'mention',
    title: 'Mentioned by Priya',
    message: 'Priya mentioned you in the daily report thread',
    time: '10m ago',
    read: false,
  },
  {
    id: '4',
    type: 'leave',
    title: 'Leave Request',
    message: 'Vikram applied for sick leave tomorrow',
    time: '1h ago',
    read: true,
  },
  {
    id: '5',
    type: 'approval',
    title: 'Pending Approval',
    message: '2 ticket escalations need your review',
    time: '2h ago',
    read: true,
  },
  {
    id: '6',
    type: 'system',
    title: 'System Update',
    message: 'Shift schedule for next week is now available',
    time: '3h ago',
    read: true,
  },
  {
    id: '7',
    type: 'task',
    title: 'Task Assigned',
    message: 'New delegation task: audit yarn inventory',
    time: '4h ago',
    read: true,
  },
  {
    id: '8',
    type: 'system',
    title: 'Report Ready',
    message: 'Weekly productivity report is ready',
    time: '5h ago',
    read: true,
  },
])

const filteredNotifications = computed(() => {
  switch (activeTab.value) {
    case 'unread':
      return notifications.value.filter((n) => !n.read)
    case 'mentions':
      return notifications.value.filter((n) => n.type === 'mention')
    case 'tasks':
      return notifications.value.filter((n) => n.type === 'task')
    case 'system':
      return notifications.value.filter((n) => n.type === 'system')
    default:
      return notifications.value
  }
})

const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)

const typeIconMap: Record<string, unknown> = {
  task: CheckCircleIcon,
  rescue: ExclamationCircleIcon,
  leave: UserIcon,
  approval: CheckCircleIcon,
  system: InformationCircleIcon,
  mention: BellIcon,
}

const typeColorMap: Record<string, string> = {
  task: 'text-success-600 bg-success-50 dark:bg-success-900/20',
  rescue: 'text-danger-600 bg-danger-50 dark:bg-danger-900/20',
  leave: 'text-brand-600 bg-brand-50 dark:bg-brand-900/20',
  approval: 'text-info-600 bg-info-50 dark:bg-info-900/20',
  system: 'text-neutral-600 bg-neutral-100 dark:bg-neutral-800',
  mention: 'text-warning-500 bg-warning-50 dark:bg-warning-900/20',
}

function markRead(id: string) {
  const n = notifications.value.find((n) => n.id === id)
  if (n) n.read = true
}

function markAllRead() {
  notifications.value.forEach((n) => (n.read = true))
}

watch(
  () => props.open,
  (val) => {
    if (val) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <Transition name="notif">
      <div v-if="open" class="fixed inset-0 z-[70] flex md:justify-end">
        <div class="absolute inset-0 bg-black/30" @click="emit('close')"></div>
        <div
          class="relative w-full max-w-md bg-white dark:bg-neutral-800 h-full flex flex-col shadow-modal md:rounded-l-2xl"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 shrink-0"
          >
            <div class="flex items-center gap-2">
              <BellIcon class="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
              <h2 class="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Notifications
              </h2>
              <span
                v-if="unreadCount > 0"
                class="text-caption text-neutral-500 dark:text-neutral-400"
                >({{ unreadCount }})</span
              >
            </div>
            <div class="flex items-center gap-2">
              <button
                v-if="unreadCount > 0"
                type="button"
                class="text-caption text-brand-600 hover:text-brand-700 font-medium"
                @click="markAllRead"
              >
                Mark all read
              </button>
              <button
                type="button"
                class="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-400"
                @click="emit('close')"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Tabs -->
          <div
            class="flex gap-1 px-4 py-2 border-b border-neutral-200 dark:border-neutral-700 overflow-x-auto shrink-0"
          >
            <button
              v-for="tab in tabs"
              :key="tab.id"
              type="button"
              class="px-3 py-1.5 text-caption font-medium rounded-full whitespace-nowrap transition-colors"
              :class="
                activeTab === tab.id
                  ? 'bg-brand-600 text-white'
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              "
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- List -->
          <div class="flex-1 overflow-y-auto">
            <div
              v-if="filteredNotifications.length === 0"
              class="flex flex-col items-center justify-center py-16 text-neutral-400"
            >
              <BellIcon class="w-12 h-12 mb-2" />
              <p class="text-body">No notifications</p>
              <p class="text-caption text-neutral-500 mt-1">When updates arrive, they'll appear here.</p>
            </div>
            <div
              v-for="item in filteredNotifications"
              :key="item.id"
              class="flex items-start gap-3 px-4 py-3 border-b border-neutral-100 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors"
            >
              <div
                class="flex items-center justify-center w-9 h-9 rounded-full shrink-0"
                :class="typeColorMap[item.type]"
              >
                <component :is="typeIconMap[item.type]" class="w-5 h-5" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <p
                    class="text-body font-medium text-neutral-900 dark:text-neutral-100 truncate"
                    :class="{ 'font-semibold': !item.read }"
                  >
                    {{ item.title }}
                  </p>
                  <span class="text-caption text-neutral-400 shrink-0">{{ item.time }}</span>
                </div>
                <p class="text-caption text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2">
                  {{ item.message }}
                </p>
              </div>
              <div v-if="!item.read" class="w-2 h-2 rounded-full bg-brand-600 shrink-0 mt-2"></div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.notif-enter-active,
.notif-leave-active {
  transition: all 0.3s ease;
}
.notif-enter-from .bg-black,
.notif-leave-to .bg-black {
  opacity: 0;
}
.notif-enter-from > div:last-child {
  transform: translateX(100%);
}
.notif-leave-to > div:last-child {
  transform: translateX(100%);
}
</style>
