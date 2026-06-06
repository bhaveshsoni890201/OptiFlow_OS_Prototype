<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useStore } from '../../stores/useStore'
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  CalendarDaysIcon,
  BellAlertIcon,
  UserGroupIcon,
  ArrowPathIcon,
  XMarkIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  PlusIcon,
  TicketIcon,
  AcademicCapIcon,
  ChartBarIcon,
  BriefcaseIcon,
  SparklesIcon,
} from '@heroicons/vue/24/outline'
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/vue/24/solid'
import type { ChecklistItem, DelegationTask, Worklist, AttendanceLog, BuddyTransfer, LeaveRequest } from '../../types'
import { formatDateWithWeekday, formatTime, formatDateTime } from '../../utils/formatters'
import OptSkeleton from '../../components/common/OptSkeleton.vue'
import OptKpiCard from '../../components/common/OptKpiCard.vue'
import OptEmptyState from '../../components/common/OptEmptyState.vue'
import { useTaskStore } from '../../stores/taskStore'
import { useNotificationStore } from '../../stores/notificationStore'
import { getAttendanceLogs, getBuddyTransfers, getLeaveRequests, getWorklists } from '../../services'
import { useLoadingTimeout } from '../../composables/useLoadingTimeout'

const { timedOut, startTimeout, clearTimeout: clearLoadTimeout } = useLoadingTimeout(8000)

const router = useRouter()
const store = useStore()
const { t } = useI18n()
const taskStore = useTaskStore()
const notificationStore = useNotificationStore()

const attendanceLogs = ref<AttendanceLog[]>([])
const buddyTransfers = ref<BuddyTransfer[]>([])
const leaveRequests = ref<LeaveRequest[]>([])
const worklistData = ref<Worklist[]>([])

const currentEmployee = computed(() => store.user.employee)
const today = ref(new Date())
const now = computed(() => new Date())
const dateStr = computed(() => formatDateWithWeekday(today.value))
const isOnline = ref(true)
const error = ref('')
const loading = ref(true)
const completing = ref(new Set<string>())
const checkingIn = ref(false)
const pullRefreshing = ref(false)

const greeting = computed(() => {
  const h = now.value.getHours()
  if (h < 12) return t('home.greeting.morning')
  if (h < 17) return t('home.greeting.afternoon')
  return t('home.greeting.evening')
})

const todayStr = computed(() => today.value.toISOString().split('T')[0])

const attendance = computed(() =>
  currentEmployee.value
    ? attendanceLogs.value.find(
        (a) => a.employee_id === currentEmployee.value!.employee_id && a.date === todayStr.value,
      )
    : undefined,
)
const checkedIn = computed(() => !!attendance.value?.check_in)
const workMode = ref<'wfo' | 'wfh'>('wfo')

const empId = computed(() => currentEmployee.value?.employee_id ?? '')

const myDelegations = computed(() =>
  taskStore.delegationTasks.filter(
    (d) => d.assigned_to === empId.value && d.status !== 'completed',
  ),
)
const myChecklist = computed(() =>
  taskStore.checklistTasks.filter((c) => c.assigned_to === empId.value),
)
const myFMS = computed(() => taskStore.fmsTasks.filter((f) => f.assigned_to === empId.value))
const myWorklists = computed(() =>
  worklistData.value.filter((w) => w.assigned_to === empId.value),
)

const dueTasksCount = computed(() => {
  const due = [...myDelegations.value, ...myChecklist.value, ...myFMS.value].filter((t) => {
    if ('due_date' in t && t.due_date) {
      return new Date(t.due_date) <= today.value && t.status !== 'completed' && t.status !== 'reviewed'
    }
    return false
  })
  return due.length
})

const allMyTasks = computed(() => [
  ...myDelegations.value,
  ...myChecklist.value,
  ...myFMS.value,
])

const kpis = computed(() => ({
  dueToday:
    myDelegations.value.filter((d) => {
      const dd = new Date(d.due_date)
      return dd.toDateString() === today.value.toDateString() && d.status !== 'completed'
    }).length +
    myChecklist.value.filter((c) => {
      const dd = new Date(c.due_date)
      return dd.toDateString() === today.value.toDateString() && c.status !== 'completed'
    }).length +
    myFMS.value.filter((f) => {
      const dd = new Date(f.due_date)
      return dd.toDateString() === today.value.toDateString() && f.status !== 'completed'
    }).length,
  overdue: myDelegations.value.filter(
    (d) => new Date(d.due_date) < today.value && d.status !== 'completed',
  ).length,
  inProgress: allMyTasks.value.filter(
    (t) => t.status === 'in_progress',
  ).length,
  completed: allMyTasks.value.filter((t) => t.status === 'completed').length,
  completedToday: allMyTasks.value.filter(
    (t) => t.status === 'completed' && 'completed_on' in t && t.completed_on
      ? new Date(t.completed_on).toDateString() === today.value.toDateString()
      : false,
  ).length,
  attendanceStreak: (() => {
    const logs = attendanceLogs.value
      .filter((a) => a.employee_id === empId.value)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    let streak = 0
    for (const log of logs) {
      if (log.check_in) streak++
      else break
    }
    return streak
  })(),
  pendingApprovals: pendingLeaveCount.value,
}))

const pendingChecklist = computed(() =>
  myChecklist.value.filter((c) => c.status !== 'completed').slice(0, 5),
)
const pendingDelegations = computed(() =>
  myDelegations.value.filter((d) => d.status !== 'completed').slice(0, 3),
)

// Leave status widget
const myLeaveRequests = computed(() =>
  leaveRequests.value.filter((l) => l.employee_id === empId.value),
)
const pendingLeaveCount = computed(() =>
  myLeaveRequests.value.filter((l) => l.status === 'pending').length,
)
const approvedLeaveToday = computed(() =>
  myLeaveRequests.value.filter(
    (l) => l.status === 'approved' && todayStr.value >= l.start_date && todayStr.value <= l.end_date,
  ).length,
)

// Training progress widget
const trainingProgress = computed(() => {
  const total = taskStore.delegationTasks.filter((d) => d.assigned_to === empId.value && d.category === 'training').length
  const completed = taskStore.delegationTasks.filter(
    (d) => d.assigned_to === empId.value && d.category === 'training' && d.status === 'completed',
  ).length
  return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 }
})

// Productivity snapshot
const productivity = computed(() => {
  const allMyTasks = [
    ...taskStore.delegationTasks.filter((d) => d.assigned_to === empId.value),
    ...taskStore.checklistTasks.filter((c) => c.assigned_to === empId.value),
    ...taskStore.fmsTasks.filter((f) => f.assigned_to === empId.value),
  ]
  const total = allMyTasks.length
  const completedCount = allMyTasks.filter((t) => t.status === 'completed').length
  const onTime = allMyTasks.filter((t) => {
    if (t.status === 'completed' && 'due_date' in t && t.due_date) {
      const dd = new Date(t.due_date)
      const completedOn = 'completed_on' in t ? t.completed_on : null
      return completedOn ? new Date(completedOn) <= dd : true
    }
    return false
  }).length
  return {
    completionRate: total > 0 ? Math.round((completedCount / total) * 100) : 0,
    onTimeRate: completedCount > 0 ? Math.round((onTime / completedCount) * 100) : 100,
  }
})

const activeBuddyTransfer = computed(() => {
  const bt = buddyTransfers.value.find(
    (t) => t.buddy_owner === empId.value && !t.reverted,
  )
  if (!bt) return null
  const leave = leaveRequests.value.find((l) => l.id === bt.leave_request_id)
  return { transfer: bt, leave }
})

const captainAlerts = computed(() => notificationStore.notifications.filter((n) => !n.read).slice(0, 3))

async function handleCheckIn() {
  checkingIn.value = true
  await new Promise((r) => setTimeout(r, 800))
  checkingIn.value = false
}

async function handleCheckOut() {
  checkingIn.value = true
  await new Promise((r) => setTimeout(r, 800))
  checkingIn.value = false
}

async function handleMarkDone(item: ChecklistItem) {
  completing.value.add(item.id)
  await new Promise((r) => setTimeout(r, 400))
  item.status = 'completed'
  item.completed_on = new Date().toISOString()
  store.addToast({ type: 'success', message: `${item.title} ${t('home.markedDone')}`, duration: 3000 })
  await new Promise((r) => setTimeout(r, 1100))
  completing.value.delete(item.id)
}

async function handlePullRefresh() {
  pullRefreshing.value = true
  await new Promise((r) => setTimeout(r, 1000))
  pullRefreshing.value = false
}

function getPriorityColor(p: string) {
  const map: Record<string, string> = {
    low: 'bg-neutral-100 text-neutral-600',
    medium: 'bg-info-600/10 text-info-600',
    high: 'bg-warning-50 text-warning-500',
    critical: 'bg-danger-50 text-danger-600',
  }
  return map[p] || 'bg-neutral-100 text-neutral-600'
}

async function fetchDashboard() {
   error.value = ''
   loading.value = true
   startTimeout()
   try {
     const [attendanceData, btData, lvData, wlData] = await Promise.all([
       getAttendanceLogs(),
       getBuddyTransfers(),
       getLeaveRequests(),
       getWorklists(),
     ])
     attendanceLogs.value = attendanceData
     buddyTransfers.value = btData
     leaveRequests.value = lvData
     worklistData.value = wlData
     await Promise.all([
       taskStore.fetchTasks(),
       notificationStore.fetch(),
     ])
     if (timedOut.value) throw new Error('Request timed out')
   } catch {
    error.value = t('home.loadError')
    if (timedOut.value) error.value = t('home.timedOut')
  }
  clearLoadTimeout()
  loading.value = false
}

onMounted(fetchDashboard)

const allDone = computed(
  () => pendingChecklist.value.length === 0 && pendingDelegations.value.length === 0,
)
const noWorklist = computed(
  () => myChecklist.value.filter((c) => c.status !== 'completed').length === 0 && myDelegations.value.length === 0 && myFMS.value.length === 0,
)
</script>

<template>
  <!-- Pull to refresh -->
  <div v-if="pullRefreshing" class="flex items-center justify-center py-3">
    <ArrowPathIcon class="w-5 h-5 text-brand-600 animate-spin" />
    <span class="ml-2 text-caption text-neutral-500">{{ $t('home.refreshing') }}</span>
  </div>

  <!-- Error banner -->
  <div
    v-if="error"
    class="mb-4 px-4 py-3 bg-danger-50 border border-danger-200 rounded-lg flex items-start gap-3"
    role="alert" aria-live="polite"
  >
    <ExclamationTriangleIcon class="w-5 h-5 text-danger-600 shrink-0 mt-0.5" />
    <p class="text-body text-danger-700 flex-1">{{ error }}</p>
    <div class="flex items-center gap-2 shrink-0">
      <button
        class="px-3 py-1.5 bg-danger-600 text-white rounded-lg text-caption font-semibold hover:bg-danger-700 transition-colors"
        @click="fetchDashboard"
      >
        {{ $t('common.retry') }}
      </button>
      <button
        class="text-danger-500 hover:text-danger-700 min-h-touch min-w-touch"
        @click="error = ''"
        aria-label="Dismiss error"
      >
        <XMarkIcon class="w-4 h-4" />
      </button>
    </div>
  </div>

  <!-- Loading state -->
  <template v-if="loading">
    <div class="space-y-4" aria-live="polite">
      <OptSkeleton variant="rectangular" width="75%" height="32px" />
      <OptSkeleton variant="rectangular" height="64px" />
      <div class="grid grid-cols-2 gap-3">
        <OptSkeleton variant="rectangular" height="96px" />
        <OptSkeleton variant="rectangular" height="96px" />
        <OptSkeleton variant="rectangular" height="96px" />
        <OptSkeleton variant="rectangular" height="96px" />
      </div>
      <OptSkeleton variant="rectangular" height="80px" />
      <OptSkeleton variant="rectangular" height="80px" />
    </div>
  </template>

  <template v-else>
    <!-- Offline indicator -->
    <div
      v-if="!isOnline"
      class="mb-3 px-4 py-2 bg-warning-50 border border-warning-200 rounded-lg flex items-center gap-2"
    >
      <ExclamationTriangleIcon class="w-4 h-4 text-warning-500" />
      <span class="text-caption text-warning-700">{{ $t('common.offlineMessage') }}</span>
    </div>

    <!-- Greeting header -->
    <div class="mb-4">
      <h1 class="text-h1 text-neutral-900">
        {{ greeting }}, {{ currentEmployee?.name?.split(' ')[0] || 'User' }}
      </h1>
      <p class="text-body text-neutral-500 mt-1 flex items-center gap-2">
        <CalendarDaysIcon class="w-4 h-4" />
        {{ dateStr }}
      </p>
      <p class="text-body-strong text-brand-600 mt-1">{{ $t('home.tasksDueToday', { count: dueTasksCount }) }}</p>
    </div>

    <!-- Row 1: Attendance + Leave status (side by side on sm+) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
      <!-- Attendance strip -->
      <div class="card p-4 flex items-center justify-between">
        <div v-if="!checkedIn" class="flex items-center gap-3 flex-1">
          <div class="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
            <ArrowRightOnRectangleIcon class="w-5 h-5" />
          </div>
          <div>
            <p class="text-body-strong text-neutral-900">{{ $t('home.checkIn.notCheckedIn') }}</p>
            <p class="text-caption text-neutral-500">{{ $t('home.checkIn.tapToStart') }}</p>
          </div>
        </div>
        <div v-else class="flex items-center gap-3 flex-1">
          <div class="w-10 h-10 rounded-full bg-success-50 text-success-600 flex items-center justify-center">
            <CheckCircleIcon class="w-5 h-5" />
          </div>
          <div>
            <p class="text-body-strong text-neutral-900">{{ $t('home.checkIn.checkedInAt') }} {{ attendance?.check_in }}</p>
            <p v-if="attendance?.late_minutes && attendance.late_minutes > 0" class="text-caption text-danger-600">
              {{ $t('home.checkIn.lateBy', { minutes: attendance.late_minutes }) }}
            </p>
            <p v-else class="text-caption text-success-600">{{ $t('home.checkIn.onTime') }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div v-if="!checkedIn" class="flex items-center bg-neutral-100 rounded-lg p-0.5">
            <button class="px-3 py-1.5 text-caption rounded-md transition-colors min-h-touch" :class="workMode === 'wfo' ? 'bg-white shadow-sm text-neutral-900 font-semibold' : 'text-neutral-500'" @click="workMode = 'wfo'">{{ $t('home.wfo') }}</button>
            <button class="px-3 py-1.5 text-caption rounded-md transition-colors min-h-touch" :class="workMode === 'wfh' ? 'bg-white shadow-sm text-neutral-900 font-semibold' : 'text-neutral-500'" @click="workMode = 'wfh'">{{ $t('home.wfh') }}</button>
          </div>
          <button class="h-9 px-4 rounded-lg text-button transition-colors min-h-touch" :class="checkedIn ? 'bg-danger-50 text-danger-600 hover:bg-danger-100' : 'bg-brand-600 text-white hover:bg-brand-700'" :disabled="checkingIn" @click="checkedIn ? handleCheckOut() : handleCheckIn()">
            {{ checkingIn ? $t('common.pleaseWait') : checkedIn ? $t('home.checkOutBtn') : $t('home.checkInBtn') }}
          </button>
        </div>
      </div>

      <!-- Leave status mini-widget -->
      <div class="card p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
          <BriefcaseIcon class="w-5 h-5" />
        </div>
        <div class="flex-1">
          <p class="text-body-strong text-neutral-900">{{ $t('home.leaveStatus.title') }}</p>
          <p class="text-caption text-neutral-500">
            <template v-if="pendingLeaveCount > 0">{{ $t('home.leaveStatus.pending', { count: pendingLeaveCount }) }}</template>
            <template v-else-if="approvedLeaveToday > 0">{{ $t('home.leaveStatus.onLeaveToday') }}</template>
            <template v-else>{{ $t('home.leaveStatus.noLeave') }}</template>
          </p>
        </div>
        <button class="text-caption text-brand-600 font-semibold whitespace-nowrap min-h-touch" @click="router.push('/doer/leave')">{{ $t('common.seeAll') }}</button>
      </div>
    </div>

    <!-- Row 2: Quick Actions bar -->
    <div class="card p-3 mb-4">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button class="flex flex-col items-center gap-1 py-3 px-2 rounded-lg hover:bg-brand-50 transition-colors min-h-touch" @click="router.push('/doer/tasks/create')">
          <PlusIcon class="w-5 h-5 text-brand-600" />
          <span class="text-caption font-medium text-neutral-700">{{ $t('home.quickActions.createTask') }}</span>
        </button>
        <button class="flex flex-col items-center gap-1 py-3 px-2 rounded-lg hover:bg-brand-50 transition-colors min-h-touch" @click="router.push('/doer/leave')">
          <CalendarDaysIcon class="w-5 h-5 text-brand-600" />
          <span class="text-caption font-medium text-neutral-700">{{ $t('home.quickActions.applyLeave') }}</span>
        </button>
        <button class="flex flex-col items-center gap-1 py-3 px-2 rounded-lg hover:bg-brand-50 transition-colors min-h-touch" @click="router.push('/doer/tickets')">
          <TicketIcon class="w-5 h-5 text-brand-600" />
          <span class="text-caption font-medium text-neutral-700">{{ $t('home.quickActions.raiseTicket') }}</span>
        </button>
        <button class="flex flex-col items-center gap-1 py-3 px-2 rounded-lg hover:bg-brand-50 transition-colors min-h-touch" @click="router.push('/doer/training')">
          <AcademicCapIcon class="w-5 h-5 text-brand-600" />
          <span class="text-caption font-medium text-neutral-700">{{ $t('home.quickActions.startTraining') }}</span>
        </button>
      </div>
    </div>

    <!-- Row 3: KPI tiles + Training progress + Productivity snapshot -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
      <!-- Extended KPI tiles (2 cols, spans full on mobile) -->
      <div class="grid grid-cols-2 gap-3">
        <OptKpiCard :title="$t('home.taskStatus.dueToday')" :value="kpis.dueToday" color="brand" @click="router.push('/doer/tasks')" />
        <OptKpiCard :title="$t('home.taskStatus.overdue')" :value="kpis.overdue" color="danger" @click="router.push('/doer/tasks')" />
        <OptKpiCard :title="$t('home.taskStatus.inProgress')" :value="kpis.inProgress" color="info" @click="router.push('/doer/tasks')" />
        <OptKpiCard :title="$t('home.taskStatus.completed')" :value="kpis.completed" color="success" @click="router.push('/doer/tasks')" />
        <OptKpiCard title="Completed Today" :value="kpis.completedToday" color="success" @click="router.push('/doer/tasks')" />
        <OptKpiCard title="Pending Approvals" :value="kpis.pendingApprovals" color="warning" @click="router.push('/doer/approvals')" />
      </div>

      <!-- Productivity snapshot + Training progress -->
      <div class="space-y-3">
        <!-- Training progress -->
        <div class="card p-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-body-strong text-neutral-900 flex items-center gap-2">
              <AcademicCapIcon class="w-4 h-4 text-brand-600" />
              {{ $t('home.trainingProgress.title') }}
            </h3>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex-1">
              <div class="w-full bg-neutral-100 rounded-full h-2">
                <div class="bg-brand-600 h-2 rounded-full transition-all" :style="{ width: trainingProgress.percent + '%' }" />
              </div>
            </div>
            <span class="text-caption font-semibold text-neutral-700 whitespace-nowrap">{{ trainingProgress.completed }}/{{ trainingProgress.total }}</span>
          </div>
        </div>

        <!-- Productivity snapshot -->
        <div class="card p-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-body-strong text-neutral-900 flex items-center gap-2">
              <ChartBarIcon class="w-4 h-5 text-brand-600" />
              {{ $t('home.productivity.title') }}
            </h3>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex-1 text-center">
              <p class="text-h2 text-brand-600">{{ productivity.completionRate }}%</p>
              <p class="text-caption text-neutral-500">{{ $t('home.productivity.completionRate') }}</p>
            </div>
            <div class="w-px h-10 bg-neutral-200" />
            <div class="flex-1 text-center">
              <p class="text-h2 text-success-600">{{ productivity.onTimeRate }}%</p>
              <p class="text-caption text-neutral-500">{{ $t('home.productivity.onTimeRate') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- All-done celebration -->
    <div
      v-if="allDone && !loading && !noWorklist"
      class="card p-6 mb-5 text-center bg-gradient-to-br from-success-50 to-brand-50 border-success-100"
    >
      <CheckCircleSolidIcon class="w-12 h-12 text-success-600 mx-auto mb-2" />
      <h3 class="text-h3 text-neutral-900">{{ $t('home.allCaughtUp.heading') }}</h3>
      <p class="text-body text-neutral-500 mt-1">{{ $t('home.allCaughtUp.message') }}</p>
      <button class="mt-3 px-5 py-2 bg-brand-600 text-white rounded-lg text-button hover:bg-brand-700 transition-colors" @click="router.push('/doer/tasks')">
        {{ $t('home.allCaughtUp.viewTasks') }}
      </button>
    </div>

    <!-- No worklist state -->
    <div
      v-if="noWorklist"
      class="card p-8 mb-5 text-center bg-gradient-to-br from-neutral-50 to-brand-50 border-brand-100"
    >
      <ClipboardDocumentCheckIcon class="w-14 h-14 text-neutral-300 mx-auto mb-3" />
      <h3 class="text-h3 text-neutral-900">{{ $t('home.noTasks') }}</h3>
      <p class="text-body text-neutral-500 mt-1">{{ $t('home.noTasksMessage') }}</p>
    </div>

    <!-- Due Checklist Tasks -->
    <section class="mb-5">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-h2 text-neutral-900 flex items-center gap-2">
          <ClipboardDocumentCheckIcon class="w-5 h-5 text-brand-600" />
          {{ $t('home.dueChecklist.title') }}
        </h2>
        <button class="text-caption text-brand-600 font-semibold min-h-touch" @click="router.push('/doer/tasks')">{{ $t('common.seeAll') }}</button>
      </div>
      <OptEmptyState v-if="pendingChecklist.length === 0" type="tasks" :title="$t('home.dueChecklist.allDone')" :description="$t('home.dueChecklist.allDoneMessage')" />
      <div v-else class="space-y-2">
        <div v-for="item in pendingChecklist" :key="item.id" :class="['card p-3 flex items-center gap-3', completing.has(item.id) ? 'animate-fade-out-down' : '']">
          <button class="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors min-h-touch min-w-touch" :class="completing.has(item.id) ? 'animate-check-pop bg-success-600 border-success-600 text-white' : item.status === 'completed' ? 'bg-success-600 border-success-600 text-white' : 'border-neutral-300 hover:border-brand-600'" @click="handleMarkDone(item)">
            <CheckCircleSolidIcon v-if="item.status === 'completed' || completing.has(item.id)" class="w-4 h-4" />
          </button>
          <div class="flex-1 min-w-0">
            <p class="text-body-strong text-neutral-900 truncate">{{ item.title }}</p>
            <p class="text-caption text-neutral-500 flex items-center gap-1"><ClockIcon class="w-3 h-3" /> {{ $t('home.dueTime', { time: formatTime(item.due_date) }) }}</p>
          </div>
          <span class="chip text-caption font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 shrink-0">{{ item.frequency }}</span>
        </div>
      </div>
    </section>

    <!-- Pending Delegations -->
    <section class="mb-5">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-h2 text-neutral-900 flex items-center gap-2">
          <DocumentTextIcon class="w-5 h-5 text-brand-600" />
          {{ $t('home.pendingDelegations.title') }}
        </h2>
        <button class="text-caption text-brand-600 font-semibold min-h-touch" @click="router.push('/doer/tasks')">{{ $t('common.seeAll') }}</button>
      </div>
      <OptEmptyState v-if="pendingDelegations.length === 0" type="tasks" :title="$t('home.pendingDelegations.allDelegated')" :description="$t('home.pendingDelegations.nonePending')" />
      <div v-else class="space-y-2">
        <div v-for="task in pendingDelegations" :key="task.id" class="card p-4 hover:shadow-card-hover transition-shadow cursor-pointer" @click="router.push(`/doer/tasks/${task.id}`)">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <p class="text-body-strong text-neutral-900 truncate">{{ task.title }}</p>
              <p class="text-caption text-neutral-500 mt-1">{{ $t('home.dueTime', { time: formatDateTime(task.due_date) }) }}</p>
            </div>
            <span class="px-2 py-0.5 rounded-full text-caption font-medium shrink-0" :class="getPriorityColor(task.priority)">{{ task.priority }}</span>
          </div>
          <div class="flex items-center gap-2 mt-2">
            <span class="px-2 py-0.5 rounded-full text-caption font-medium bg-brand-50 text-brand-600">{{ task.status.replace('_', ' ') }}</span>
            <span v-if="task.reminder_count > 0" class="text-caption text-warning-500 flex items-center gap-1"><BellAlertIcon class="w-3 h-3" /> {{ $t('home.reminderCount', { count: task.reminder_count }) }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- FMS Workflow items -->
    <section class="mb-5">
      <h2 class="text-h2 text-neutral-900 mb-3">{{ $t('home.fmsWorkflow.title') }}</h2>
      <OptEmptyState v-if="myFMS.length === 0" type="tasks" :title="$t('home.fmsWorkflow.noItems')" :description="$t('home.fmsWorkflow.allUpToDate')" />
      <div v-else class="space-y-2">
        <div v-for="task in myFMS" :key="task.id" class="card p-4 border-l-4 border-l-brand-500">
          <p class="text-body-strong text-neutral-900">{{ task.title }}</p>
          <p class="text-caption text-neutral-500 mt-1">{{ task.workflow }} · {{ task.stage }}</p>
        </div>
      </div>
    </section>

    <!-- Alerts from Captain -->
    <section class="mb-5">
      <h2 class="text-h2 text-neutral-900 flex items-center gap-2 mb-3">
        <BellAlertIcon class="w-5 h-5 text-warning-500" />
        {{ $t('home.alertsReminders.title') }}
      </h2>
      <OptEmptyState v-if="captainAlerts.length === 0" type="data" :title="$t('home.alertsReminders.allClear')" :description="$t('home.alertsReminders.noAlerts')" />
      <div v-else class="space-y-2">
        <div v-for="n in captainAlerts" :key="n.id" class="card p-3 flex items-start gap-3">
          <ExclamationTriangleIcon class="w-5 h-5 text-warning-500 shrink-0 mt-0.5" />
          <div>
            <p class="text-body-strong text-neutral-900">{{ n.title }}</p>
            <p class="text-caption text-neutral-500">{{ n.context }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Buddy tasks -->
    <section v-if="activeBuddyTransfer" class="mb-5">
      <div class="card p-4 border-l-4 border-l-info-600 bg-gradient-to-r from-info-50/50 to-white">
        <div class="flex items-center gap-2 mb-2">
          <UserGroupIcon class="w-5 h-5 text-info-600" />
          <h3 class="text-h3 text-neutral-900">{{ $t('home.coveringFor', { name: activeBuddyTransfer.leave?.employee_name || 'a teammate' }) }}</h3>
        </div>
        <p class="text-body text-neutral-600">{{ activeBuddyTransfer.transfer.task_reference }}</p>
        <p class="text-caption text-neutral-500 mt-1">{{ activeBuddyTransfer.leave?.start_date }} – {{ activeBuddyTransfer.leave?.end_date }}</p>
      </div>
    </section>
  </template>
</template>