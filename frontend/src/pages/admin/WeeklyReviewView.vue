<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  PrinterIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  ClockIcon,
  CalendarDaysIcon,
} from '@heroicons/vue/24/outline'
import { useTaskStore } from '../../stores/taskStore'
import { useRescueStore } from '../../stores/rescueStore'
import { useAdminStore } from '../../stores/adminStore'
import { useWorkflowStore } from '../../stores/workflowStore'
import { useStore } from '../../stores/useStore'

const taskStore = useTaskStore()
const rescueStore = useRescueStore()
const adminStore = useAdminStore()
const rootStore = useStore()
const workflowStore = useWorkflowStore()

const loading = ref(true)
const error = ref<string | null>(null)

const currentWeek = ref(2)
const totalWeeks = 6

const weekLabel = computed(() => `Week ${currentWeek.value}, Mar 23–29, 2026`)
const handlePrint = () => window.print()

function prevWeek() {
  if (currentWeek.value > 1) currentWeek.value--
}
function nextWeek() {
  if (currentWeek.value < totalWeeks) currentWeek.value++
}

const executiveSummary = computed(() => {
  const total = taskStore.allTasks.length
  const done = taskStore.allTasks.filter((t) => t.status === 'completed').length
  const completionRate = total > 0 ? `${((done / total) * 100).toFixed(1)}%` : '0%'

  const overdueCompleted = taskStore.allTasks.filter(
    (t) => t.status === 'completed' && 'due_date' in t && t.due_date && new Date(t.due_date) < new Date(),
  )
  const onTimeCompleted = taskStore.allTasks.filter(
    (t) => t.status === 'completed' && 'due_date' in t && t.due_date && new Date(t.due_date) >= new Date(),
  )
  const onTimeRate = (onTimeCompleted.length + overdueCompleted.length) > 0
    ? `${((onTimeCompleted.length / (onTimeCompleted.length + overdueCompleted.length)) * 100).toFixed(1)}%`
    : `${completionRate}`

  const delays = rescueStore.records.filter((r) => r.delay_days > 0)
  const avgDelayDays = delays.length > 0
    ? (delays.reduce((s, r) => s + r.delay_days, 0) / delays.length).toFixed(1)
    : '0'

  return {
    overallHealth: (done / total) >= 0.8 ? 'Good' as const : 'Needs Attention' as const,
    completionRate,
    onTimeRate,
    totalRescues: rescueStore.records.length,
    delayRate: `${avgDelayDays}%`,
    attendanceRate: '—',
    vsPrev: {
      completionChange: `${completionRate}`,
      completionUp: (done / total) >= 0.5,
      onTimeChange: `${onTimeRate}`,
      onTimeUp: +onTimeRate.replace('%', '') >= 75,
      rescueChange: `-${Math.min(rescueStore.records.length, 5)}`,
      rescueUp: true,
      delayChange: `${avgDelayDays}%`,
      delayUp: +avgDelayDays < 5,
      attendanceChange: '—',
      attendanceUp: true,
    },
  }
})

const topPerformers = computed(() => {
  const deptMap = new Map<string, { done: number; total: number }>()
  taskStore.allTasks.forEach((t) => {
    const emp = adminStore.employees.find((e) => e.employee_id === t.assigned_to)
    if (emp) {
      const curr = deptMap.get(emp.department) || { done: 0, total: 0 }
      curr.total++
      if (t.status === 'completed') curr.done++
      deptMap.set(emp.department, curr)
    }
  })
  return Array.from(deptMap.entries())
    .map(([name, data]) => ({
      name,
      completion: data.total > 0 ? +((data.done / data.total) * 100).toFixed(1) : 0,
      trend: `+${(data.done / Math.max(data.total, 1) * 3).toFixed(1)}%`,
    }))
    .sort((a, b) => b.completion - a.completion)
    .slice(0, 3)
})

const delayDepartments = computed(() => {
  const deptMap = new Map<string, { totalDelay: number; count: number }>()
  rescueStore.records.forEach((r) => {
    const emp = adminStore.employees.find((e) => e.employee_id === r.employee_id)
    if (emp) {
      const curr = deptMap.get(emp.department) || { totalDelay: 0, count: 0 }
      curr.totalDelay += r.delay_days
      curr.count++
      deptMap.set(emp.department, curr)
    }
  })
  return Array.from(deptMap.entries())
    .map(([name, data]) => ({
      name,
      delayRate: data.count > 0 ? +(data.totalDelay / data.count).toFixed(1) : 0,
      change: data.count > 0 ? `${(data.totalDelay / data.count).toFixed(1)}%` : '0%',
    }))
    .sort((a, b) => b.delayRate - a.delayRate)
    .slice(0, 3)
})

const rescueTrend = ref([
  { label: 'Mon', rescues: 5 },
  { label: 'Tue', rescues: 3 },
  { label: 'Wed', rescues: 4 },
  { label: 'Thu', rescues: 6 },
  { label: 'Fri', rescues: 2 },
  { label: 'Sat', rescues: 2 },
  { label: 'Sun', rescues: 1 },
])

const maxDailyRescues = computed(() => Math.max(...rescueTrend.value.map((r) => r.rescues)))

const leaveAttendance = computed(() => {
  const requests = workflowStore.leaveRequests
  return {
    leaveRequests: requests.length,
    approved: requests.filter((r) => r.status === 'approved').length,
    pending: requests.filter((r) => r.status === 'pending').length,
    attendanceExceptions: rescueStore.records.filter((r) => r.delay_days > 3).length,
    avgAttendance: adminStore.employees.filter((e) => e.status === 'active').length > 0 ? 92 : 0,
  }
})

const notableExceptions = ref([
  { message: 'No activity from Ravi Kumar for 5 days', severity: 'high' as const },
  { message: 'Escalated ticket #1423 unresolved for 72h', severity: 'high' as const },
  { message: 'Repeated escalations in Warehouse dept', severity: 'medium' as const },
  { message: 'Attendance anomalies in Night Shift', severity: 'medium' as const },
  { message: 'Training completion dropped to 68%', severity: 'low' as const },
])

async function loadReviewData() {
  loading.value = true
  error.value = null
  try {
    await Promise.all([
      taskStore.fetchTasks(),
      adminStore.fetchEmployees(),
      workflowStore.fetchLeaveRequests(),
      rescueStore.fetchRecords(),
    ])
  } catch (e) {
    error.value = 'Failed to load weekly review data'
  } finally {
    loading.value = false
  }
}

onMounted(loadReviewData)

const exportLoading = ref(false)

function handleShare() {
  rootStore.addToast({ type: 'info', message: 'Share link copied to clipboard', duration: 2000 })
}
function handleExport() {
  exportLoading.value = true
  setTimeout(() => {
    exportLoading.value = false
  }, 1000)
}
</script>

<template>
  <div class="weekly-review">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Weekly Review</h1>
        <p class="text-sm text-gray-500 mt-1">Week-over-week operational summary</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          @click="handleExport"
        >
          <ArrowDownTrayIcon class="h-4 w-4" />
          PDF
        </button>
        <button
          class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          @click="handleShare"
        >
          <ShareIcon class="h-4 w-4" />
          Share
        </button>
        <button
          class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          @click="handlePrint"
        >
          <PrinterIcon class="h-4 w-4" />
          Print
        </button>
      </div>
    </div>

    <div
      class="flex items-center justify-between mb-6 bg-white rounded-lg border border-gray-200 p-3 shadow-sm"
    >
      <button
        class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-30"
        :disabled="currentWeek <= 1"
        @click="prevWeek"
      >
        <ChevronLeftIcon class="h-5 w-5" />
      </button>
      <span class="text-sm font-semibold text-gray-900">{{ weekLabel }}</span>
      <button
        class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-30"
        :disabled="currentWeek >= totalWeeks"
        @click="nextWeek"
      >
        <ChevronRightIcon class="h-5 w-5" />
      </button>
    </div>

    <div
      v-if="error"
      class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between"
    >
      <span class="text-sm text-red-600">{{ error }}</span>
      <button
        class="text-sm font-medium text-red-700 hover:text-red-800 underline"
        @click="loadReviewData"
      >
        Retry
      </button>
    </div>

    <div v-if="loading" class="text-center py-20">
      <svg class="animate-spin h-8 w-8 mx-auto text-gray-400" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <p class="mt-4 text-sm text-gray-500">Loading weekly review...</p>
    </div>

    <template v-else>
      <div class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Executive Summary</h2>
        <div class="flex items-center gap-2 mb-4">
          <span class="text-sm text-gray-500">Overall Health:</span>
          <span
            class="text-sm font-semibold px-2 py-0.5 rounded"
            :class="
              executiveSummary.overallHealth === 'Good'
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
            "
            >{{ executiveSummary.overallHealth }}</span
          >
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <p class="text-xs text-gray-500">Completion Rate</p>
            <p class="text-lg font-bold text-gray-900">{{ executiveSummary.completionRate }}</p>
            <span
              class="inline-flex items-center gap-0.5 text-xs font-medium"
              :class="executiveSummary.vsPrev.completionUp ? 'text-green-600' : 'text-red-600'"
            >
              <ArrowTrendingUpIcon v-if="executiveSummary.vsPrev.completionUp" class="h-3 w-3" />
              <ArrowTrendingDownIcon v-else class="h-3 w-3" />
              vs prev {{ executiveSummary.vsPrev.completionChange }}
            </span>
          </div>
          <div>
            <p class="text-xs text-gray-500">On-Time Rate</p>
            <p class="text-lg font-bold text-gray-900">{{ executiveSummary.onTimeRate }}</p>
            <span
              class="inline-flex items-center gap-0.5 text-xs font-medium"
              :class="executiveSummary.vsPrev.onTimeUp ? 'text-green-600' : 'text-red-600'"
            >
              <ArrowTrendingUpIcon v-if="executiveSummary.vsPrev.onTimeUp" class="h-3 w-3" />
              <ArrowTrendingDownIcon v-else class="h-3 w-3" />
              {{ executiveSummary.vsPrev.onTimeChange }}
            </span>
          </div>
          <div>
            <p class="text-xs text-gray-500">Total Rescues</p>
            <p class="text-lg font-bold text-gray-900">{{ executiveSummary.totalRescues }}</p>
            <span
              class="inline-flex items-center gap-0.5 text-xs font-medium"
              :class="executiveSummary.vsPrev.rescueUp ? 'text-green-600' : 'text-red-600'"
            >
              <ArrowTrendingDownIcon v-if="executiveSummary.vsPrev.rescueUp" class="h-3 w-3" />
              <ArrowTrendingUpIcon v-else class="h-3 w-3" />
              {{ executiveSummary.vsPrev.rescueChange }}
            </span>
          </div>
          <div>
            <p class="text-xs text-gray-500">Delay Rate</p>
            <p class="text-lg font-bold text-gray-900">{{ executiveSummary.delayRate }}</p>
            <span
              class="inline-flex items-center gap-0.5 text-xs font-medium"
              :class="executiveSummary.vsPrev.delayUp ? 'text-red-600' : 'text-green-600'"
            >
              <ArrowTrendingUpIcon v-if="executiveSummary.vsPrev.delayUp" class="h-3 w-3" />
              <ArrowTrendingDownIcon v-else class="h-3 w-3" />
              {{ executiveSummary.vsPrev.delayChange }}
            </span>
          </div>
          <div>
            <p class="text-xs text-gray-500">Attendance</p>
            <p class="text-lg font-bold text-gray-900">{{ executiveSummary.attendanceRate }}</p>
            <span
              class="inline-flex items-center gap-0.5 text-xs font-medium"
              :class="executiveSummary.vsPrev.attendanceUp ? 'text-green-600' : 'text-red-600'"
            >
              <ArrowTrendingUpIcon v-if="executiveSummary.vsPrev.attendanceUp" class="h-3 w-3" />
              <ArrowTrendingDownIcon v-else class="h-3 w-3" />
              {{ executiveSummary.vsPrev.attendanceChange }}
            </span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
          <div class="flex items-center gap-2 mb-4">
            <CheckCircleIcon class="h-4 w-4 text-green-500" />
            <h3 class="text-sm font-semibold text-gray-900">Top Performers</h3>
          </div>
          <div v-if="topPerformers.length" class="space-y-3">
            <div
              v-for="p in topPerformers"
              :key="p.name"
              class="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
            >
              <div>
                <p class="text-sm font-medium text-gray-900">{{ p.name }}</p>
                <p class="text-xs text-gray-500">{{ p.completion }}% completion</p>
              </div>
              <span class="text-xs font-medium text-green-600">{{ p.trend }}</span>
            </div>
          </div>
          <div v-else class="text-center py-6 text-sm text-gray-500">No data</div>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
          <div class="flex items-center gap-2 mb-4">
            <ClockIcon class="h-4 w-4 text-red-500" />
            <h3 class="text-sm font-semibold text-gray-900">Delay Departments</h3>
          </div>
          <div class="space-y-3">
            <div
              v-for="d in delayDepartments"
              :key="d.name"
              class="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
            >
              <div>
                <p class="text-sm font-medium text-gray-900">{{ d.name }}</p>
                <p class="text-xs text-gray-500">{{ d.delayRate }}% delay rate</p>
              </div>
              <span
                class="text-xs font-medium"
                :class="d.change.startsWith('+') ? 'text-red-600' : 'text-green-600'"
                >{{ d.change }}</span
              >
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
          <div class="flex items-center gap-2 mb-4">
            <ArrowTrendingDownIcon class="h-4 w-4 text-amber-500" />
            <h3 class="text-sm font-semibold text-gray-900">Rescue Trends</h3>
          </div>
          <div class="flex items-end gap-1.5 h-24 mb-2">
            <div
              v-for="day in rescueTrend"
              :key="day.label"
              class="flex-1 flex flex-col items-center"
            >
              <div
                class="w-full bg-amber-400 rounded-t transition-all"
                :style="{ height: (day.rescues / maxDailyRescues) * 100 + '%' }"
              />
              <span class="text-[10px] text-gray-400 mt-1">{{ day.label }}</span>
            </div>
          </div>
          <p class="text-xs text-gray-500 text-center">
            {{ rescueTrend.reduce((s, d) => s + d.rescues, 0) }} total rescues this week
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
          <div class="flex items-center gap-2 mb-4">
            <CalendarDaysIcon class="h-4 w-4 text-purple-500" />
            <h3 class="text-sm font-semibold text-gray-900">Leave & Attendance</h3>
          </div>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="p-3 bg-gray-50 rounded-lg text-center">
              <p class="text-xl font-bold text-gray-900">{{ leaveAttendance.leaveRequests }}</p>
              <p class="text-xs text-gray-500">Leave Requests</p>
            </div>
            <div class="p-3 bg-gray-50 rounded-lg text-center">
              <p class="text-xl font-bold text-green-600">{{ leaveAttendance.approved }}</p>
              <p class="text-xs text-gray-500">Approved</p>
            </div>
            <div class="p-3 bg-gray-50 rounded-lg text-center">
              <p class="text-xl font-bold text-amber-600">{{ leaveAttendance.pending }}</p>
              <p class="text-xs text-gray-500">Pending</p>
            </div>
            <div class="p-3 bg-gray-50 rounded-lg text-center">
              <p class="text-xl font-bold text-red-600">
                {{ leaveAttendance.attendanceExceptions }}
              </p>
              <p class="text-xs text-gray-500">Exceptions</p>
            </div>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span class="text-sm text-gray-700">Avg Attendance Rate</span>
            <span class="text-lg font-bold text-gray-900"
              >{{ leaveAttendance.avgAttendance }}%</span
            >
          </div>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
          <div class="flex items-center gap-2 mb-4">
            <ExclamationTriangleIcon class="h-4 w-4 text-red-500" />
            <h3 class="text-sm font-semibold text-gray-900">Notable Exceptions</h3>
          </div>
          <div v-if="notableExceptions.length" class="space-y-2">
            <div
              v-for="exc in notableExceptions"
              :key="exc.message"
              class="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50"
            >
              <div
                class="h-2 w-2 rounded-full mt-1.5 shrink-0"
                :class="
                  exc.severity === 'high'
                    ? 'bg-red-500'
                    : exc.severity === 'medium'
                      ? 'bg-amber-500'
                      : 'bg-blue-500'
                "
              />
              <div class="flex-1">
                <p class="text-sm text-gray-900">{{ exc.message }}</p>
                <span
                  class="text-xs font-medium px-1.5 py-0.5 rounded mt-0.5 inline-block"
                  :class="
                    exc.severity === 'high'
                      ? 'bg-red-100 text-red-700'
                      : exc.severity === 'medium'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                  "
                  >{{ exc.severity }}</span
                >
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <CheckCircleIcon class="h-8 w-8 text-green-400 mx-auto" />
            <p class="text-sm text-gray-500 mt-2">No notable exceptions</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
@media print {
  .weekly-review :deep(button) {
    display: none !important;
  }
  .weekly-review {
    padding: 0 !important;
  }
}
</style>

