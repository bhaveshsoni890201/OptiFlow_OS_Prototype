<script setup lang="ts">
import {
  ClipboardDocumentListIcon,
  InboxArrowDownIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  ChatBubbleLeftEllipsisIcon,
  ClockIcon,
  UserGroupIcon,
  AcademicCapIcon,
} from '@heroicons/vue/24/outline'

const props = withDefaults(
  defineProps<{
    type?: 'tasks' | 'data' | 'search' | 'error' | 'success' | 'leave' | 'comments' | 'attendance' | 'team' | 'training' | 'generic'
    title?: string
    description?: string
    actionLabel?: string
  }>(),
  {
    type: 'generic',
    title: 'No data available',
    description: 'There are no items to display at the moment.',
    actionLabel: '',
  },
)

const emit = defineEmits<{
  (e: 'action'): void
}>()

const iconMap: Record<string, any> = {
  tasks: ClipboardDocumentListIcon,
  data: InboxArrowDownIcon,
  search: MagnifyingGlassIcon,
  error: ExclamationTriangleIcon,
  success: CheckCircleIcon,
  leave: CalendarDaysIcon,
  comments: ChatBubbleLeftEllipsisIcon,
  attendance: ClockIcon,
  team: UserGroupIcon,
  training: AcademicCapIcon,
  generic: InboxArrowDownIcon,
}

const defaultTitles: Record<string, string> = {
  tasks: 'No tasks yet',
  data: 'No data found',
  search: 'No results found',
  leave: 'No leave requests',
  comments: 'No comments yet',
  attendance: 'No attendance records',
  team: 'No team members',
  training: 'No training assigned',
}

const defaultDescriptions: Record<string, string> = {
  tasks: 'Tasks will appear here once assigned.',
  search: 'Try adjusting your search or filters.',
  comments: 'Be the first to add a comment.',
  attendance: 'Check in to start tracking attendance.',
}
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
      <component
        :is="iconMap[type]"
        class="w-8 h-8 text-slate-400"
      />
    </div>
    <h3 class="text-base font-semibold text-slate-900 mb-1">
      {{ title || defaultTitles[type] || 'No data available' }}
    </h3>
    <p class="text-sm text-slate-500 max-w-sm mb-4">
      {{ description || defaultDescriptions[type] || '' }}
    </p>
    <button
      v-if="actionLabel"
      class="inline-flex items-center gap-2 px-4 h-10 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
      @click="emit('action')"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>