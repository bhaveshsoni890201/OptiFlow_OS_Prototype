<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  BellAlertIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  ClockIcon,
  TicketIcon,
  ChevronRightIcon,
  PlusCircleIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from '@heroicons/vue/24/outline'
import OptKpiCard from '../../components/common/OptKpiCard.vue'
import OptCard from '../../components/common/OptCard.vue'
import { useRescueStore } from '../../stores/rescueStore'
import { useWorkflowStore } from '../../stores/workflowStore'
import { useTaskStore } from '../../stores/taskStore'
import { useAdminStore } from '../../stores/adminStore'
import { useStore } from '../../stores/useStore'
import { formatRelativeTime, formatDateShort } from '../../utils/formatters'

type AlertSeverity = 'critical' | 'warning' | 'info' | 'success'

interface AlertTile {
  id: string
  label: string
  value: string | number
  severity: AlertSeverity
  icon: any
}

interface RescueBreakdown {
  label: string
  count: number
  color: string
}

interface TeamMemberDisplay {
  name: string
  avatar: string
  taskLoad: number
  delaysCount: number
  lastActivity: string
}

interface QuickAction {
  id: string
  label: string
  icon: any
  description: string
  route: string
}

const router = useRouter()
const rootStore = useStore()
const rescueStore = useRescueStore()
const workflowStore = useWorkflowStore()
const taskStore = useTaskStore()
const adminStore = useAdminStore()

const loading = ref(true)
const error = ref<string | null>(null)

const currentDate = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})

const alertTiles = ref<AlertTile[]>([])
const rescueBreakdown = ref<RescueBreakdown[]>([])
const teamMembers = ref<TeamMemberDisplay[]>([])

const totalRescues = computed(() => rescueBreakdown.value.reduce((sum, r) => sum + r.count, 0))

const donutSegments = computed(() => {
  const total = totalRescues.value
  let offset = 0
  return rescueBreakdown.value.map((r) => {
    const percentage = total > 0 ? (r.count / total) * 100 : 0
    const circumference = 2 * Math.PI * 40
    const dashLength = (percentage / 100) * circumference
    const segment = {
      ...r,
      percentage: Math.round(percentage),
      dashLength,
      offset,
      circumference,
    }
    offset += dashLength - circumference
    return segment
  })
})

const reviewQueue = computed(() => taskStore.reviewQueue?.slice(0, 5) ?? [])

async function approveReview(task: any) {
  await taskStore.updateStatus(task.id, task.type === 'fms' ? 'fms' : 'delegation', 'reviewed')
  rootStore.addToast({ type: 'success', message: 'Task reviewed and approved', duration: 3000 })
}

async function rejectReview(task: any) {
  await taskStore.updateStatus(task.id, task.type === 'fms' ? 'fms' : 'delegation', 'in_progress')
  rootStore.addToast({ type: 'warning', message: 'Task sent back for revisions', duration: 3000 })
}

const quickActions = ref<QuickAction[]>([
  {
    id: 'create-worklist',
    label: 'Create Worklist',
    icon: PlusCircleIcon,
    description: 'Set up recurring tasks & checklists',
    route: '/captain/worklists',
  },
  {
    id: 'assign-training',
    label: 'Assign Training',
    icon: AcademicCapIcon,
    description: 'Assign training content to team',
    route: '/captain/training',
  },
  {
    id: 'review-approvals',
    label: 'Review Approvals',
    icon: CheckCircleIcon,
    description: 'Pending leave & attendance corrections',
    route: '/captain/approvals',
  },
])

function initials(name: string): string {
  return name.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase()
}

function getAlertBg(severity: AlertSeverity): string {
  const map: Record<AlertSeverity, string> = {
    critical: 'bg-red-50 border-red-200',
    warning: 'bg-amber-50 border-amber-200',
    info: 'bg-blue-50 border-blue-200',
    success: 'bg-emerald-50 border-emerald-200',
  }
  return map[severity]
}

function getAlertIconColor(severity: AlertSeverity): string {
  const map: Record<AlertSeverity, string> = {
    critical: 'text-red-600',
    warning: 'text-amber-600',
    info: 'text-blue-600',
    success: 'text-emerald-600',
  }
  return map[severity]
}

async function loadDashboard() {
  loading.value = true
  error.value = ''
  try {
    await Promise.all([
      taskStore.fetchTasks(),
      rescueStore.fetchRecords(),
      workflowStore.fetchLeaveRequests(),
      adminStore.fetchEmployees(),
    ])

    const activeRescues = rescueStore.activeRecords.length
    const criticalCount = rescueStore.records.filter((r) => r.severity === 'admin_escalation').length
    const pendingLeave = workflowStore.leaveRequests.filter((r) => r.status === 'pending').length
    const doers = adminStore.employees.filter((e) => e.roles.includes('doer'))
    const delayedDoers = doers.filter((d) =>
      rescueStore.records.some((r) => r.employee_id === d.employee_id && r.delay_days > 0),
    )

    alertTiles.value = [
      {
        id: 'rescue-queue',
        label: 'Active Rescues',
        value: activeRescues,
        severity: activeRescues > 5 ? 'critical' : 'warning',
        icon: BellAlertIcon,
      },
      {
        id: 'critical-delays',
        label: 'Critical Delays',
        value: criticalCount,
        severity: criticalCount > 0 ? 'critical' : 'info',
        icon: ExclamationTriangleIcon,
      },
      {
        id: 'no-activity',
        label: 'Doers with Delays',
        value: delayedDoers.length,
        severity: delayedDoers.length > 3 ? 'warning' : 'info',
        icon: UserGroupIcon,
      },
      {
        id: 'pending-leave',
        label: 'Pending Leave Approvals',
        value: pendingLeave,
        severity: pendingLeave > 0 ? 'warning' : 'success',
        icon: ClockIcon,
      },
      {
        id: 'team-size',
        label: 'Team Size',
        value: doers.length,
        severity: 'info',
        icon: TicketIcon,
      },
    ]

    const delegation = rescueStore.records.filter((r) => r.task_type === 'delegation').length
    const checklist = rescueStore.records.filter((r) => r.task_type === 'checklist').length
    const fms = rescueStore.records.filter((r) => r.task_type === 'fms').length
    rescueBreakdown.value = [
      { label: 'Delegation', count: delegation, color: '#EF4444' },
      { label: 'Checklist', count: checklist, color: '#F59E0B' },
      { label: 'FMS', count: fms, color: '#3B82F6' },
    ]

    teamMembers.value = doers.slice(0, 5).map((e) => {
      const empRescues = rescueStore.records.filter((r) => r.employee_id === e.employee_id)
      const maxDelay = empRescues.reduce((max, r) => Math.max(max, r.delay_days), 0)
      const dueTasks = [...taskStore.delegationTasks, ...taskStore.fmsTasks].filter(
        (t) => t.assigned_to === e.employee_id && t.status !== 'completed',
      )
      return {
        name: e.name,
        avatar: initials(e.name),
        taskLoad: dueTasks.length,
        delaysCount: empRescues.length,
        lastActivity: empRescues.length > 0
          ? formatRelativeTime(empRescues.sort((a, b) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime())[0].last_activity)
          : 'N/A',
      }
    })
  } catch {
    error.value = 'Failed to load dashboard data'
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
      <div class="flex flex-col items-center gap-3">
        <div
          class="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"
        />
        <span class="text-sm text-slate-500">Loading dashboard...</span>
      </div>
    </div>

    <div v-else-if="error" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <ExclamationTriangleIcon class="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p class="text-sm text-red-600 font-medium">{{ error }}</p>
        <button
          class="mt-3 text-sm text-blue-600 hover:underline"
          @click="loading = true; error = null; loadDashboard()"
        >
          Retry
        </button>
      </div>
    </div>

    <div v-else class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <!-- Header Band -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">{{ greeting }}, Captain</h1>
          <p class="text-sm text-slate-500 mt-1">Alpha Squad &middot; {{ currentDate }}</p>
        </div>
        <div class="flex items-center gap-3">
          <span
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
          >
            <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            On duty
          </span>
          <span class="text-sm text-slate-400">Team: 12 members</span>
        </div>
      </div>

      <!-- Alert Tiles -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <OptKpiCard
          v-for="alert in alertTiles"
          :key="alert.id"
          :title="alert.label"
          :value="alert.value"
          :color="alert.severity === 'critical' ? 'danger' : alert.severity === 'warning' ? 'warning' : alert.severity === 'info' ? 'info' : 'success'"
        />
      </div>

      <!-- Middle row: Rescue Summary + Team Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <!-- Rescue Summary -->
        <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-semibold text-slate-900">Rescue Summary</h2>
            <span class="text-xs text-slate-400">{{ totalRescues }} total</span>
          </div>
          <div class="flex flex-col sm:flex-row items-center gap-6">
            <!-- Donut Chart -->
            <div class="relative w-28 h-28 shrink-0">
              <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#F1F5F9" stroke-width="12" />
                <circle
                  v-for="seg in donutSegments"
                  :key="seg.label"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  :stroke="seg.color"
                  stroke-width="12"
                  stroke-linecap="round"
                  :stroke-dasharray="seg.circumference"
                  :stroke-dashoffset="seg.offset"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-lg font-bold text-slate-900">{{ totalRescues }}</span>
              </div>
            </div>
            <!-- Legend -->
            <div class="flex-1 space-y-2">
              <div
                v-for="item in rescueBreakdown"
                :key="item.label"
                class="flex items-center justify-between text-sm"
              >
                <span class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: item.color }" />
                  <span class="text-slate-600">{{ item.label }}</span>
                </span>
                <span class="font-medium text-slate-900">{{ item.count }}</span>
              </div>
            </div>
          </div>
          <button
            class="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            @click="router.push('/captain/rescue')"
          >
            Go to Rescue
            <ChevronRightIcon class="w-4 h-4" />
          </button>
        </div>

        <!-- Team Activity List -->
        <OptCard class="lg:col-span-3">
          <template #header>
            <div class="flex items-center justify-between w-full">
              <h2 class="text-sm font-semibold text-slate-900">Team Activity</h2>
              <button class="text-xs text-blue-600 hover:underline" @click="router.push('/captain/team')">View all</button>
            </div>
          </template>
          <div class="space-y-3">
              <div
                v-for="(member, idx) in teamMembers"
                :key="idx"
                class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div
                  class="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0"
                >
                  {{ member.avatar }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-slate-900 truncate">{{ member.name }}</p>
                  <p class="text-xs text-slate-400">
                    Tasks: {{ member.taskLoad }} &middot; Delays: {{ member.delaysCount }}
                  </p>
                </div>
                <span class="text-xs text-slate-400">{{ member.lastActivity }}</span>
              </div>
          </div>
        </OptCard>
      </div>

      <!-- Review Queue -->
      <div v-if="reviewQueue.length > 0" class="bg-white rounded-xl border border-slate-200 p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-semibold text-slate-900">Pending Review ({{ reviewQueue.length }})</h2>
          <span class="text-xs text-slate-400">Completed tasks awaiting approval</span>
        </div>
        <div class="space-y-2">
          <div
            v-for="task in reviewQueue"
            :key="task.id"
            class="flex items-center justify-between p-3 rounded-lg bg-slate-50"
          >
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-900 truncate">{{ task.title }}</p>
              <p class="text-xs text-slate-400">
                {{ task.type }} &middot; {{ 'assigned_to' in task ? task.assigned_to : '' }}
              </p>
            </div>
            <div class="flex items-center gap-2 shrink-0 ml-3">
              <button
                class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200 hover:bg-emerald-100 transition-colors"
                @click="approveReview(task)"
              >
                <CheckCircleIcon class="w-3.5 h-3.5" /> Approve
              </button>
              <button
                class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200 hover:bg-amber-100 transition-colors"
                @click="rejectReview(task)"
              >
                <ArrowPathIcon class="w-3.5 h-3.5" /> Revise
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          v-for="action in quickActions"
          :key="action.id"
          class="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 transition-all hover:shadow-md hover:border-blue-200 active:scale-[0.98] text-left"
        >
          <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <component :is="action.icon" class="w-5 h-5 text-blue-600" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-900">{{ action.label }}</p>
            <p class="text-xs text-slate-400 truncate">{{ action.description }}</p>
          </div>
          <ChevronRightIcon class="w-4 h-4 text-slate-300 shrink-0" />
        </button>
      </div>
    </div>
  </div>
</template>
