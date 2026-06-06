<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useStore } from '../../stores/useStore'
import { useLoadingTimeout } from '../../composables/useLoadingTimeout'
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  UserIcon,
  ClockIcon,
  BellAlertIcon,
  PaperClipIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ShieldExclamationIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from '@heroicons/vue/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/vue/24/solid'
import type { DelegationTask, ChecklistItem, FMSTask, Task, TaskStatus } from '../../types'
import OptSkeleton from '../../components/common/OptSkeleton.vue'
import { useTaskStore } from '../../stores/taskStore'
import OptChip from '../../components/common/OptChip.vue'
import { formatDateTime, formatDate } from '../../utils/formatters'
import OptEmptyState from '../../components/common/OptEmptyState.vue'

const route = useRoute()
const router = useRouter()
const store = useStore()
const { t } = useI18n()

const taskId = route.params.id as string
const loading = ref(true)
const commentText = ref('')
const showBlockFlow = ref(false)
const showBlockedReason = ref(false)
const blockedReason = ref('')
const showAllActivity = ref(false)

type ResolvedTask = DelegationTask | ChecklistItem | FMSTask
const task = ref<ResolvedTask | null>(null)

const isDelegation = computed(() => task.value?.type === 'delegation')
const isChecklist = computed(() => task.value?.type === 'checklist')
const isFMS = computed(() => task.value?.type === 'fms')

const statusSteps = computed(() => [
  { key: 'pending', label: t('taskDetail.statusLabels.pending') },
  { key: 'in_progress', label: t('taskDetail.statusLabels.inProgress') },
  { key: 'blocked', label: t('taskDetail.statusLabels.blocked') },
  { key: 'escalated', label: t('taskDetail.statusLabels.escalated') },
  { key: 'completed', label: t('taskDetail.statusLabels.completed') },
  { key: 'reviewed', label: t('taskDetail.statusLabels.reviewed') },
])

const currentStepIndex = computed(() => {
  if (!task.value) return 0
  return statusSteps.value.findIndex((s) => s.key === task.value!.status)
})

const canTransitionNext = computed(() => {
  if (!task.value) return false
  if (task.value.status === 'completed' || task.value.status === 'reviewed') return false
  return true
})

const nextStatusLabel = computed(() => {
  if (!task.value) return ''
  const map: Record<string, string> = {
    pending: t('taskDetail.nextAction.start'),
    in_progress: t('taskDetail.nextAction.complete'),
    blocked: t('taskDetail.nextAction.resume'),
    escalated: t('taskDetail.nextAction.markResolved'),
  }
  return map[task.value.status] || t('taskDetail.nextAction.next')
})

const nextStatus = computed((): TaskStatus => {
  if (!task.value) return 'completed'
  const flow: Record<string, TaskStatus> = {
    pending: 'in_progress',
    in_progress: 'completed',
    blocked: 'in_progress',
    escalated: 'completed',
  }
  return flow[task.value.status] || 'completed'
})

const assignedToName = computed(() => {
  if (!task.value) return ''
  return (task.value as DelegationTask).assigned_to || ''
})

const assignedByName = computed(() => {
  if (!task.value || !isDelegation.value) return ''
  return (task.value as DelegationTask).assigned_by || ''
})

const priorityColor = computed(() => {
  if (!task.value || !('priority' in task.value)) return ''
  const map: Record<string, string> = {
    low: 'bg-neutral-100 text-neutral-600',
    medium: 'bg-info-600/10 text-info-600',
    high: 'bg-warning-50 text-warning-500',
    critical: 'bg-danger-50 text-danger-600',
  }
  return map[(task.value as DelegationTask).priority] || ''
})

const getStatusVariant = (s: string) => {
  const map: Record<string, any> = {
    pending: 'pending' as const,
    in_progress: 'in-progress' as const,
    blocked: 'blocked' as const,
    escalated: 'escalated' as const,
    completed: 'completed' as const,
    reviewed: 'reviewed' as const,
  }
  return map[s] || ('default' as const)
}

const activityLog = computed(() => {
  const items: { icon: string; text: string; time: string }[] = []
  if (!task.value) return items
  items.push({
    icon: 'plus',
    text: t('taskDetail.activityTypes.taskCreated'),
    time: 'due_date' in task.value ? task.value.due_date : '',
  })
  if (task.value.status === 'in_progress')
    items.push({
      icon: 'play',
      text: t('taskDetail.activityTypes.workStarted'),
      time: (task.value as DelegationTask).last_activity || task.value.due_date,
    })
  if (
    task.value.status === 'completed' &&
    'completed_on' in task.value &&
    (task.value as ChecklistItem).completed_on
  ) {
    items.push({
      icon: 'check',
      text: t('taskDetail.activityTypes.taskCompleted'),
      time: (task.value as ChecklistItem).completed_on!,
    })
  }
  if ('reminder_count' in task.value && (task.value as DelegationTask).reminder_count > 0) {
    items.push({
      icon: 'bell',
      text: t('taskDetail.activityTypes.reminderSent', { count: (task.value as DelegationTask).reminder_count }),
      time: (task.value as DelegationTask).last_activity,
    })
  }
  items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  return items.slice(0, showAllActivity.value ? items.length : 3)
})

async function handleNextAction() {
  if (!task.value) return
  if (task.value.status === 'blocked' && !blockedReason.value) {
    showBlockedReason.value = true
    return
  }
  if (task.value.status === 'in_progress' && task.value.type === 'checklist') {
    completing.value = true
    await new Promise((r) => setTimeout(r, 400))
    ;(task.value as ChecklistItem).status = 'completed'
    ;(task.value as ChecklistItem).completed_on = new Date().toISOString()
  } else {
    task.value.status = nextStatus.value
  }
  store.addToast({
    type: 'success',
    message: t('taskDetail.activityTypes.taskMoved', { status: task.value.status.replace(/_/g, ' ') }),
    duration: 3000,
  })
  if (completing.value) {
    await new Promise((r) => setTimeout(r, 1100))
    completing.value = false
  }
}

function startBlockFlow() {
  showBlockFlow.value = true
}

function cancelBlock() {
  showBlockFlow.value = false
  blockedReason.value = ''
}

function confirmBlock() {
  if (!task.value || !blockedReason.value.trim()) return
  task.value.status = 'blocked'
  showBlockFlow.value = false
  store.addToast({ type: 'warning', message: t('taskDetail.markedBlocked'), duration: 3000 })
}

async function handleEscalate() {
  if (!task.value) return
  task.value.status = 'escalated'
  if ('escalation_level' in task.value) (task.value as DelegationTask).escalation_level += 1
  store.addToast({ type: 'warning', message: t('taskDetail.escalated'), duration: 3000 })
}

async function handleAddComment() {
  if (!commentText.value.trim()) return
  store.addToast({ type: 'success', message: t('taskDetail.activityTypes.commentAdded'), duration: 2000 })
  commentText.value = ''
}

function getActivityIcon(icon: string) {
  if (icon === 'check') return CheckCircleIcon
  if (icon === 'bell') return BellAlertIcon
  return ClockIcon
}

const taskStore = useTaskStore()
const error = ref('')
const completing = ref(false)

const { timedOut, startTimeout, clearTimeout: clearLoadTimeout } = useLoadingTimeout(8000)

async function fetchTaskDetail() {
  error.value = ''
  loading.value = true
  startTimeout()
  try {
    await taskStore.fetchTasks()
    if (timedOut.value) throw new Error('Request timed out')
    task.value = taskStore.allTasks.find((t) => t.id === taskId) || null
    if (!task.value) store.addToast({ type: 'error', message: t('taskDetail.notFound'), duration: 3000 })
  } catch {
    error.value = timedOut.value ? 'Request timed out. Please try again.' : t('taskDetail.loadError')
  }
  clearLoadTimeout()
  loading.value = false
}

onMounted(fetchTaskDetail)
</script>

<template>
  <div class="min-h-screen bg-neutral-50 pb-32 lg:pb-8">
    <!-- Sticky header -->
    <div
      class="sticky top-0 z-10 bg-white border-b border-neutral-200 px-4 py-3 flex items-center gap-3"
    >
      <button
        class="p-1 -ml-1 text-neutral-500 hover:text-neutral-700 rounded-md min-h-touch min-w-touch flex items-center justify-center"
        aria-label="Back"
        @click="router.back()"
      >
        <ArrowLeftIcon class="w-5 h-5" />
      </button>
      <h1 class="text-h3 text-neutral-900 truncate flex-1">{{ loading ? '...' : task?.title }}</h1>
    </div>

    <template v-if="loading">
      <div class="p-4 space-y-4">
        <OptSkeleton variant="rectangular" width="33%" height="24px" />
        <OptSkeleton variant="rectangular" height="16px" />
        <OptSkeleton variant="rectangular" width="75%" height="16px" />
        <OptSkeleton variant="rectangular" height="128px" />
      </div>
    </template>

    <div v-else-if="error" role="alert" aria-live="polite" class="card p-8 text-center">
      <ExclamationTriangleIcon class="h-12 w-12 text-danger-400 mx-auto mb-3" />
      <p class="text-body-strong text-neutral-900 mb-1">{{ $t('taskDetail.failedToLoad') }}</p>
      <p class="text-body text-neutral-500">{{ error }}</p>
      <button
        class="mt-3 px-5 py-2 bg-brand-600 text-white rounded-lg text-button hover:bg-brand-700 transition-colors"
        @click="fetchTaskDetail"
      >
        <ArrowPathIcon class="h-4 w-4 inline mr-1" /> {{ $t('common.retry') }}
      </button>
    </div>

    <template v-else-if="!task">
      <div class="empty-state">
        <ExclamationTriangleIcon class="empty-state-icon !text-danger-400" />
        <p class="empty-state-title">{{ $t('taskDetail.notFound') }}</p>
        <p class="empty-state-description">
          {{ $t('taskDetail.notFoundMessage') }}
        </p>
      </div>
    </template>

    <template v-else>
      <div class="p-4 space-y-5 max-w-content mx-auto">
        <!-- Badge row -->
        <div class="flex flex-wrap items-center gap-2">
          <OptChip :variant="getStatusVariant(task.status)" size="md">{{
            task.status.replace(/_/g, ' ')
          }}</OptChip>
          <span
            v-if="'priority' in task"
            class="px-2 py-1 rounded text-caption font-semibold"
            :class="priorityColor"
          >
            {{ (task as DelegationTask).priority }}
          </span>
          <span
            class="px-2 py-1 rounded-full text-caption font-semibold bg-brand-50 text-brand-600"
            >{{ task.type }}</span
          >
        </div>

        <!-- Status stepper -->
        <div class="card p-4">
          <p class="text-body-strong text-neutral-700 mb-3">{{ $t('taskDetail.progress') }}</p>
          <div class="flex items-start justify-between">
            <div
              v-for="(step, idx) in statusSteps"
              :key="step.key"
              class="flex flex-col items-center flex-1 min-w-0"
            >
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-caption font-bold border-2 shrink-0 transition-all"
                :class="
                  idx < currentStepIndex
                    ? 'bg-success-600 border-success-600 text-white'
                    : idx === currentStepIndex
                      ? 'bg-brand-600 border-brand-600 text-white'
                      : 'bg-white border-neutral-300 text-neutral-400'
                "
              >
                <CheckCircleSolid v-if="idx < currentStepIndex" class="w-4 h-4" />
                <span v-else>{{ idx + 1 }}</span>
              </div>
              <p
                class="text-overline text-center mt-1"
                :class="
                  idx <= currentStepIndex ? 'text-neutral-700 font-semibold' : 'text-neutral-400'
                "
              >
                {{ step.label }}
              </p>
            </div>
          </div>
        </div>

        <!-- Meta section -->
        <div class="card p-4 space-y-2">
          <div class="flex items-center gap-2 text-body text-neutral-600">
            <CalendarDaysIcon class="w-4 h-4 text-neutral-400 shrink-0" />
            <span class="text-body-strong text-neutral-700">{{ $t('taskDetail.due') }}</span>
            <span
              :class="
                new Date(task.due_date) < new Date() && task.status !== 'completed'
                  ? 'text-danger-600 font-semibold'
                  : ''
              "
            >
              {{ formatDate(task.due_date) }}
            </span>
          </div>
          <div
            v-if="'next_follow_up' in task && (task as DelegationTask).next_follow_up"
            class="flex items-center gap-2 text-body text-neutral-600"
          >
            <ClockIcon class="w-4 h-4 text-neutral-400 shrink-0" />
            <span class="text-body-strong text-neutral-700">{{ $t('taskDetail.followUp') }}</span>
            <span>{{ formatDate((task as DelegationTask).next_follow_up!) }}</span>
          </div>
          <div v-if="assignedToName" class="flex items-center gap-2 text-body text-neutral-600">
            <UserIcon class="w-4 h-4 text-neutral-400 shrink-0" />
            <span class="text-body-strong text-neutral-700">{{ $t('taskDetail.assignedTo') }}</span>
            <span>{{ assignedToName }}</span>
          </div>
          <div v-if="assignedByName" class="flex items-center gap-2 text-body text-neutral-600">
            <UserIcon class="w-4 h-4 text-neutral-400 shrink-0" />
            <span class="text-body-strong text-neutral-700">{{ $t('taskDetail.createdBy') }}</span>
            <span>{{ assignedByName }}</span>
          </div>
          <div
            v-if="'last_activity' in task"
            class="flex items-center gap-2 text-body text-neutral-600"
          >
            <ClockIcon class="w-4 h-4 text-neutral-400 shrink-0" />
            <span class="text-body-strong text-neutral-700">{{ $t('taskDetail.lastActivity') }}</span>
            <span>{{ formatDate((task as DelegationTask).last_activity) }}</span>
          </div>
          <div
            v-if="'reminder_count' in task && (task as DelegationTask).reminder_count > 0"
            class="flex items-center gap-2 text-body text-warning-600"
          >
            <BellAlertIcon class="w-4 h-4 shrink-0" />
            <span class="font-semibold">{{ $t('taskDetail.reminderCount', { count: (task as DelegationTask).reminder_count }) }}</span>
          </div>
          <!-- Checklist specific -->
          <template v-if="isChecklist">
            <div class="flex items-center gap-2 text-body text-neutral-600">
              <span class="text-body-strong text-neutral-700">{{ $t('taskDetail.frequency') }}</span>
              <span>{{ (task as ChecklistItem).frequency }}</span>
            </div>
            <div
              v-if="(task as ChecklistItem).next_due"
              class="flex items-center gap-2 text-body text-neutral-600"
            >
              <span class="text-body-strong text-neutral-700">{{ $t('taskDetail.nextDue') }}</span>
              <span>{{ formatDate((task as ChecklistItem).next_due!) }}</span>
            </div>
          </template>
          <!-- FMS specific -->
          <template v-if="isFMS">
            <div class="flex items-center gap-2 text-body text-neutral-600">
              <span class="text-body-strong text-neutral-700">{{ $t('taskDetail.workflow') }}</span>
              <span>{{ (task as FMSTask).workflow }}</span>
            </div>
            <div class="flex items-center gap-2 text-body text-neutral-600">
              <span class="text-body-strong text-neutral-700">{{ $t('taskDetail.stage') }}</span>
              <span>{{ (task as FMSTask).stage }}</span>
            </div>
            <div class="p-3 bg-brand-50 rounded-lg text-body text-brand-700">
              <span class="font-semibold">{{ $t('taskDetail.actionRequired') }} </span
              >{{ (task as FMSTask).action_required }}
            </div>
          </template>
        </div>

        <!-- Description -->
        <div v-if="task.description" class="card p-4">
          <div class="flex items-center gap-2 mb-2">
            <DocumentTextIcon class="w-4 h-4 text-neutral-400" />
            <p class="text-body-strong text-neutral-700">{{ $t('taskDetail.description') }}</p>
          </div>
          <p class="text-body text-neutral-600 whitespace-pre-wrap">{{ task.description }}</p>
          <button class="mt-2 text-caption text-brand-600 font-semibold min-h-touch">
            {{ $t('taskDetail.viewOriginal') }}
          </button>
        </div>

        <!-- Activity timeline -->
        <div class="card p-4">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <ClockIcon class="w-4 h-4 text-neutral-400" />
              <p class="text-body-strong text-neutral-700">{{ $t('taskDetail.activity') }}</p>
            </div>
            <button
              v-if="activityLog.length > 3"
              class="text-caption text-brand-600 font-semibold min-h-touch"
              @click="showAllActivity = !showAllActivity"
            >
              {{ showAllActivity ? $t('taskDetail.showLess') : $t('taskDetail.showAll') }}
            </button>
          </div>
          <div class="space-y-3">
            <div v-for="(log, idx) in activityLog" :key="idx" class="flex items-start gap-3">
              <div
                class="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center shrink-0"
              >
                <component :is="getActivityIcon(log.icon)" class="w-4 h-4 text-neutral-500" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-body text-neutral-700">{{ log.text }}</p>
                <p class="text-caption text-neutral-400">{{ formatDateTime(log.time) }}</p>
              </div>
            </div>
            <OptEmptyState v-if="activityLog.length === 0" type="tasks" :title="$t('taskDetail.noActivity')" />
          </div>
        </div>

        <!-- Comments -->
        <div class="card p-4">
          <div class="flex items-center gap-2 mb-3">
            <ChatBubbleLeftIcon class="w-4 h-4 text-neutral-400" />
            <p class="text-body-strong text-neutral-700">{{ $t('taskDetail.comments') }}</p>
          </div>
          <div class="flex gap-2">
            <input
              v-model="commentText"
              type="text"
              :placeholder="$t('taskDetail.addComment')"
              aria-label="Add a comment"
              class="flex-1 h-10 text-body bg-white border border-neutral-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 placeholder:text-neutral-400"
              @keyup.enter="handleAddComment"
            />
            <button
              class="h-10 px-4 bg-brand-600 text-white rounded-lg text-button font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50 min-h-touch"
              :disabled="!commentText.trim()"
              @click="handleAddComment"
            >
              {{ $t('taskDetail.send') }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Sticky bottom action bar -->
    <div
      v-if="task && !loading"
      class="fixed bottom-16 lg:bottom-0 left-0 right-0 z-20 bg-white border-t border-neutral-200 px-4 py-3" style="padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px))"
    >
      <div class="max-w-content mx-auto flex items-center gap-3">
        <button
          class="flex-1 h-12 bg-brand-600 text-white rounded-lg text-button font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50 min-h-touch"
          :class="completing ? 'animate-check-pop' : ''"
          :disabled="!canTransitionNext"
          @click="handleNextAction"
        >
          {{ completing ? $t('taskDetail.completing') : nextStatusLabel }}
        </button>
        <template v-if="showBlockFlow">
          <div class="flex-1 flex items-center gap-2">
            <input
              v-model="blockedReason"
              type="text"
              :placeholder="$t('taskDetail.blockedReason')"
              class="flex-1 h-12 text-body bg-white border border-warning-400 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-warning-500 placeholder:text-neutral-400"
              @keyup.enter="confirmBlock"
            />
            <button
              class="h-12 px-3 bg-warning-500 text-white rounded-lg text-button font-semibold hover:bg-warning-600 transition-colors min-h-touch"
              :disabled="!blockedReason.trim()"
              @click="confirmBlock"
            >
              {{ $t('taskDetail.confirm') }}
            </button>
            <button
              class="h-12 px-3 border border-neutral-300 text-neutral-700 rounded-lg text-button font-semibold hover:bg-neutral-50 transition-colors min-h-touch"
              @click="cancelBlock"
            >
              {{ $t('taskDetail.cancel') }}
            </button>
          </div>
        </template>
        <button
          v-else
          class="h-12 px-4 border border-neutral-300 text-neutral-700 rounded-lg text-button font-semibold hover:bg-neutral-50 transition-colors min-h-touch flex items-center gap-1.5"
          @click="startBlockFlow"
        >
          <ExclamationTriangleIcon class="w-4 h-4" />
          {{ $t('taskDetail.block') }}
        </button>
        <button
          class="h-12 px-4 border border-danger-200 text-danger-600 rounded-lg text-button font-semibold hover:bg-danger-50 transition-colors min-h-touch flex items-center gap-1.5"
          @click="handleEscalate"
        >
          <ShieldExclamationIcon class="w-4 h-4" />
          {{ $t('taskDetail.escalate') }}
        </button>
      </div>
    </div>
  </div>
</template>
