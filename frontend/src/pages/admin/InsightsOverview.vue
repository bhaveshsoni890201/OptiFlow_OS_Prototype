<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  ArrowDownTrayIcon,
  FunnelIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/vue/24/outline'
import { useAdminStore } from '../../stores/adminStore'
import { useTaskStore } from '../../stores/taskStore'
import { useWorkflowStore } from '../../stores/workflowStore'
import { useRescueStore } from '../../stores/rescueStore'

const adminStore = useAdminStore()
const taskStore = useTaskStore()
const workflowStore = useWorkflowStore()
const rescueStore = useRescueStore()

const loading = ref(true)
const error = ref<string | null>(null)

const dateRange = ref('This Month')
const departmentFilter = ref('All Departments')

const tabs = ['Overview', 'Trends', 'Issues']
const activeTab = ref('Overview')

const kpis = computed(() => {
  const total = taskStore.allTasks.length
  const done = taskStore.allTasks.filter((t) => t.status === 'completed').length
  const rate = total > 0 ? ((done / total) * 100).toFixed(1) : '0'

  const onTimeTasks = taskStore.allTasks.filter(
    (t) => t.status === 'completed' && 'due_date' in t && t.due_date && new Date(t.due_date) >= new Date(new Date().setDate(new Date().getDate() - 7)),
  )
  const overdueCompleted = taskStore.allTasks.filter(
    (t) => t.status === 'completed' && 'due_date' in t && t.due_date && new Date(t.due_date) < new Date(),
  )
  const onTimeRate = overdueCompleted.length > 0
    ? ((onTimeTasks.length / (onTimeTasks.length + overdueCompleted.length)) * 100).toFixed(1)
    : (rate)

  const delays = rescueStore.records.filter((r) => r.delay_days > 0)
  const avgDelayHrs = delays.length > 0
    ? (delays.reduce((s, r) => s + r.delay_days * 8, 0) / delays.length).toFixed(1)
    : '0'

  const prevRescues = rescueStore.records.length
  const rescueChange = prevRescues > 0 ? `-${Math.min(prevRescues, 3)}` : '0'

  return [
    { label: 'Avg Completion Rate', value: `${rate}%`, change: rate !== '0' ? `+${rate}pp` : '0%', up: true },
    { label: 'Avg On-Time Rate', value: `${onTimeRate}%`, change: `${onTimeRate}%`, up: +onTimeRate >= 75 },
    { label: 'Total Rescues', value: `${rescueStore.records.length}`, change: rescueChange, up: true },
    { label: 'Avg Delay (hrs)', value: avgDelayHrs, change: avgDelayHrs, up: false },
  ]
})

const trends = computed(() => {
  const records = rescueStore.records
  const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6']
  const weeklyRescues = weeks.map((_, i) => {
    const start = i * 7
    const end = (i + 1) * 7
    return records.filter((r) => {
      const d = new Date(r.created_on)
      return d.getDate() > start && d.getDate() <= end
    }).length
  })
  const weeklyCompletion = weeks.map((_, i) => {
    const start = i * 7
    const end = (i + 1) * 7
    const weekTasks = taskStore.allTasks.filter((t) => {
      const d = new Date(t.due_date || t.created_on)
      return d.getDate() > start && d.getDate() <= end
    })
    const done = weekTasks.filter((t) => t.status === 'completed').length
    return weekTasks.length > 0 ? +((done / weekTasks.length) * 100).toFixed(1) : 0
  })
  return [
    { label: 'Task Volume', values: weeklyRescues.length > 0 ? weeklyRescues : [0, 0, 0, 0, 0, 0], color: 'bg-blue-500' },
    { label: 'Completion %', values: weeklyCompletion.some((v) => v > 0) ? weeklyCompletion : [0, 0, 0, 0, 0, 0], color: 'bg-green-500' },
  ]
})

const topDelayDepts = computed(() => {
  const deptMap = new Map<string, { total: number; count: number }>()
  rescueStore.records.forEach((r) => {
    const emp = adminStore.employees.find((e) => e.employee_id === r.employee_id)
    if (emp) {
      const curr = deptMap.get(emp.department) || { total: 0, count: 0 }
      curr.total += r.delay_days
      curr.count++
      deptMap.set(emp.department, curr)
    }
  })
  return Array.from(deptMap.entries())
    .map(([name, data]) => ({
      name,
      delayRate: data.count > 0 ? +(data.total / data.count).toFixed(1) : 0,
      trend: data.count > 1 ? `${data.total > data.count ? '+' : '-'}${(data.total / data.count).toFixed(1)}%` : '0%',
    }))
    .sort((a, b) => b.delayRate - a.delayRate)
    .slice(0, 4)
})

const topPerformers = computed(() => {
  const deptMap = new Map<string, { done: number; total: number; onTime: number }>()
  taskStore.allTasks.forEach((t) => {
    const emp = adminStore.employees.find((e) => e.employee_id === t.assigned_to)
    if (emp) {
      const curr = deptMap.get(emp.department) || { done: 0, total: 0, onTime: 0 }
      curr.total++
      if (t.status === 'completed') {
        curr.done++
        if ('due_date' in t && t.due_date && new Date(t.due_date) >= new Date()) {
          curr.onTime++
        }
      }
      deptMap.set(emp.department, curr)
    }
  })
  return Array.from(deptMap.entries())
    .map(([name, data]) => ({
      name,
      completion: data.total > 0 ? +((data.done / data.total) * 100).toFixed(1) : 0,
      onTime: data.done > 0 ? +((data.onTime / data.done) * 100).toFixed(1) : 0,
    }))
    .sort((a, b) => b.completion - a.completion)
    .slice(0, 4)
})

const topIssues = ref([
  { issue: 'Repeated delays in Assembly dept', impact: 'High' as const, count: 23 },
  { issue: 'No-activity flags in Warehouse', impact: 'High' as const, count: 7 },
  { issue: 'Attendance anomalies Night Shift', impact: 'Medium' as const, count: 12 },
  { issue: 'Training completion below threshold', impact: 'Medium' as const, count: 9 },
])

const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6']

const maxTrend = computed(() => Math.max(...trends.value.flatMap((t) => t.values)))

function barHeight(val: number) {
  return Math.max((val / maxTrend.value) * 100, 5)
}

async function loadInsights() {
  loading.value = true
  error.value = null
  try {
    await Promise.all([
      adminStore.fetchEmployees(),
      taskStore.fetchTasks(),
      workflowStore.fetchLeaveRequests(),
      rescueStore.fetchRecords(),
    ])
  } catch (e) {
    error.value = 'Failed to load insights data'
  } finally {
    loading.value = false
  }
}

onMounted(loadInsights)

const exportLoading = ref(false)
function handleExport(format: 'pdf' | 'csv') {
  exportLoading.value = true
  setTimeout(() => {
    exportLoading.value = false
  }, 1000)
}
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Insights</h1>
        <p class="text-sm text-gray-500 mt-1">Analytics & performance overview</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          :disabled="exportLoading"
          @click="handleExport('pdf')"
        >
          <ArrowDownTrayIcon class="h-4 w-4" />
          PDF
        </button>
        <button
          class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          :disabled="exportLoading"
          @click="handleExport('csv')"
        >
          <ArrowDownTrayIcon class="h-4 w-4" />
          CSV
        </button>
      </div>
    </div>

    <div
      v-if="error"
      class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
    >
      <ExclamationTriangleIcon class="h-5 w-5 text-red-500 shrink-0" />
      <p class="text-sm text-red-600 flex-1">{{ error }}</p>
      <button
        class="text-sm font-medium text-red-700 hover:text-red-800 underline"
        @click="loadInsights"
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
      <p class="mt-4 text-sm text-gray-500">Loading insights...</p>
    </div>

    <template v-else>
      <div class="flex flex-wrap items-center gap-3 mb-6">
        <div class="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
          <button
            v-for="tab in tabs"
            :key="tab"
            class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
            :class="
              activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
            "
            @click="activeTab = tab"
          >
            {{ tab }}
          </button>
        </div>
        <div class="flex items-center gap-2 ml-auto">
          <div class="relative">
            <select
              v-model="dateRange"
              class="appearance-none pl-3 pr-8 py-1.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>This Week</option>
              <option>This Month</option>
              <option>This Quarter</option>
              <option>This Year</option>
            </select>
            <ChevronDownIcon
              class="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none"
            />
          </div>
          <div class="relative">
            <select
              v-model="departmentFilter"
              class="appearance-none pl-3 pr-8 py-1.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>All Departments</option>
              <option>Warehouse</option>
              <option>Assembly</option>
              <option>Packing</option>
              <option>Shipping</option>
              <option>Quality</option>
            </select>
            <ChevronDownIcon
              class="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          v-for="kpi in kpis"
          :key="kpi.label"
          class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
        >
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ kpi.label }}</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ kpi.value }}</p>
          <span
            class="inline-flex items-center gap-0.5 text-xs font-medium mt-1"
            :class="kpi.up ? 'text-green-600' : 'text-red-600'"
          >
            <ArrowTrendingUpIcon v-if="kpi.up" class="h-3 w-3" />
            <ArrowTrendingDownIcon v-else class="h-3 w-3" />
            {{ kpi.change }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
          <h3 class="text-base font-semibold text-gray-900 mb-4">Trend Overview</h3>
          <div class="space-y-6">
            <div v-for="trend in trends" :key="trend.label">
              <p class="text-sm font-medium text-gray-700 mb-2">{{ trend.label }}</p>
              <div class="flex items-end gap-1.5 h-20">
                <div
                  v-for="(val, i) in trend.values"
                  :key="i"
                  class="flex-1 flex flex-col items-center"
                >
                  <div
                    :class="trend.color"
                    class="w-full rounded-t transition-all duration-500"
                    :style="{ height: barHeight(val) + '%' }"
                  />
                  <span class="text-[10px] text-gray-400 mt-1">{{ weeks[i] }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
          <h3 class="text-base font-semibold text-gray-900 mb-4">Top Issues</h3>
          <div v-if="topIssues.length" class="space-y-3">
            <div
              v-for="issue in topIssues"
              :key="issue.issue"
              class="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50"
            >
              <ExclamationTriangleIcon class="h-4 w-4 mt-0.5 text-red-500" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">{{ issue.issue }}</p>
                <div class="flex items-center gap-2 mt-0.5">
                  <span
                    class="text-xs font-medium px-1.5 py-0.5 rounded"
                    :class="
                      issue.impact === 'High'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    "
                    >{{ issue.impact }}</span
                  >
                  <span class="text-xs text-gray-500">{{ issue.count }} occurrences</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <CheckCircleIcon class="h-8 w-8 text-green-400 mx-auto" />
            <p class="text-sm text-gray-500 mt-2">No issues detected</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-semibold text-gray-900">Top Delay Departments</h3>
            <span class="text-xs text-gray-500">Delay rate %</span>
          </div>
          <div v-if="topDelayDepts.length" class="space-y-4">
            <div v-for="dept in topDelayDepts" :key="dept.name">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium text-gray-700">{{ dept.name }}</span>
                <span
                  class="text-xs font-medium"
                  :class="dept.trend.startsWith('+') ? 'text-red-600' : 'text-green-600'"
                  >{{ dept.delayRate }}% ({{ dept.trend }})</span
                >
              </div>
              <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="
                    dept.delayRate > 12
                      ? 'bg-red-500'
                      : dept.delayRate > 8
                        ? 'bg-amber-500'
                        : 'bg-green-500'
                  "
                  :style="{ width: dept.delayRate * 5 + '%' }"
                />
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-sm text-gray-500">No data</div>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-semibold text-gray-900">Top Performers</h3>
            <span class="text-xs text-gray-500">Completion / On-time</span>
          </div>
          <div class="space-y-4">
            <div v-for="dept in topPerformers" :key="dept.name">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium text-gray-700">{{ dept.name }}</span>
                <span class="text-xs text-gray-500"
                  >{{ dept.completion }}% / {{ dept.onTime }}%</span
                >
              </div>
              <div class="flex gap-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="bg-green-400 rounded-l-full transition-all duration-500"
                  :style="{ width: dept.completion + '%' }"
                />
                <div
                  class="bg-blue-400 rounded-r-full transition-all duration-500"
                  :style="{ width: dept.onTime + '%' }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

