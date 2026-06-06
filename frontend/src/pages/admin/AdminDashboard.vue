<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  LightBulbIcon,
  UsersIcon,
  Cog6ToothIcon,
  ArrowRightIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import OptKpiCard from '../../components/common/OptKpiCard.vue'
import OptTable from '../../components/common/OptTable.vue'
import type { Column } from '../../components/common/OptTable.vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '../../stores/adminStore'
import { useRescueStore } from '../../stores/rescueStore'
import { useTaskStore } from '../../stores/taskStore'
import { useWorkflowStore } from '../../stores/workflowStore'

const router = useRouter()
const adminStore = useAdminStore()
const rescueStore = useRescueStore()
const taskStore = useTaskStore()
const workflowStore = useWorkflowStore()

const loading = ref(true)
const error = ref<string | null>(null)

const kpis = computed(() => {
  const total = adminStore.employees.length
  const activeRescues = rescueStore.activeRecords.length
  const totalTasks = taskStore.allTasks.length
  const completedTasks = taskStore.allTasks.filter((t) => t.status === 'completed').length
  const pendingLeave = workflowStore.leaveRequests.filter((r) => r.status === 'pending').length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return [
    {
      label: 'Employees',
      value: total,
      comparison: 'Active employees',
      color: total > 0 ? 'success' : 'warning',
      icon: 'user-group',
    },
    {
      label: 'Open Rescues',
      value: activeRescues,
      comparison: 'Requires attention',
      color: activeRescues > 0 ? 'danger' : 'success',
      icon: 'exclamation-triangle',
    },
    {
      label: 'Task Completion',
      value: `${completionRate}%`,
      comparison: 'Target: 80%',
      color: completionRate >= 80 ? 'success' : 'warning',
      icon: 'clock',
      target: 100,
    },
    {
      label: 'Pending Leave',
      value: pendingLeave,
      comparison: 'Awaiting review',
      color: pendingLeave > 0 ? 'warning' : 'success',
      icon: 'check-circle',
    },
  ]
})

const alertColumns: Column[] = [
  { key: 'severity', label: 'Severity' },
  { key: 'message', label: 'Message' },
  { key: 'time', label: 'Time' },
]

const chartData = computed(() => {
  const records = rescueStore.records
  const weeks = ['W1', 'W2', 'W3', 'W4']
  return weeks.map((week, i) => ({
    week,
    rescues: records.filter((r) => {
      const d = new Date(r.created_on)
      return d.getDate() > i * 7 && d.getDate() <= (i + 1) * 7
    }).length,
    delays: records.filter((r) => r.delay_days > 2).filter((r) => {
      const d = new Date(r.created_on)
      return d.getDate() > i * 7 && d.getDate() <= (i + 1) * 7
    }).length,
  }))
})

const maxHealth = computed(() =>
  Math.max(...chartData.value.flatMap((d) => [d.delays, d.rescues]), 1),
)
const chartHeight = 160

interface PendingApproval {
  id: number
  type: 'leave' | 'attendance' | 'ticket'
  label: string
  employee: string
  time: string
}
const pendingApprovals = ref<PendingApproval[]>([])

interface ExceptionAlert {
  id: number
  severity: 'high' | 'medium' | 'low'
  message: string
  time: string
}
const exceptionAlerts = ref<ExceptionAlert[]>([])

async function loadDashboard() {
  loading.value = true
  error.value = null
  try {
    await Promise.all([
      adminStore.fetchEmployees(),
      rescueStore.fetchRecords(),
      taskStore.fetchTasks(),
      workflowStore.fetchLeaveRequests(),
    ])
    pendingApprovals.value = workflowStore.leaveRequests
      .filter((r) => r.status === 'pending')
      .slice(0, 5)
      .map((r, i) => ({
        id: i + 1,
        type: 'leave' as const,
        label: `${r.leave_type} - ${r.total_days} days`,
        employee: r.employee_name,
        time: new Date(r.created_on).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      }))
    exceptionAlerts.value = rescueStore.records
      .filter((r) => r.delay_days >= 5)
      .slice(0, 5)
      .map((r, i) => ({
        id: i + 1,
        severity: r.delay_days >= 7 ? 'high' as const : 'medium' as const,
        message: `${r.employee_name}: ${r.task_title} (${r.delay_days}d overdue)`,
        time: new Date(r.last_activity).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      }))
  } catch {
    error.value = 'Failed to load dashboard data'
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)

interface DeptHealth {
  name: string
  delayRate: number
  completionRate: number
}
const departments = ref<DeptHealth[]>([
  { name: 'Warehouse', delayRate: 12, completionRate: 78 },
  { name: 'Packing', delayRate: 8, completionRate: 85 },
  { name: 'Shipping', delayRate: 6, completionRate: 91 },
  { name: 'Assembly', delayRate: 14, completionRate: 73 },
  { name: 'Quality', delayRate: 4, completionRate: 96 },
  { name: 'Dispatch', delayRate: 9, completionRate: 82 },
])

const quickLinks = [
  {
    label: 'Insights',
    icon: LightBulbIcon,
    route: '/admin/insights',
    color: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
  },
  {
    label: 'Employees',
    icon: UsersIcon,
    route: '/admin/employees',
    color: 'bg-green-50 text-green-700 hover:bg-green-100',
  },
  {
    label: 'Control Center',
    icon: Cog6ToothIcon,
    route: '/admin/control-center',
    color: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
  },
]

const approvalIcons: Record<string, any> = {
  leave: ClockIcon,
  attendance: XMarkIcon,
  ticket: ExclamationTriangleIcon,
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-sm text-gray-500 mt-1">Operational overview for today</p>
      </div>
      <div v-if="loading" class="flex items-center gap-2 text-sm text-gray-500">
        <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        Refreshing...
      </div>
    </div>

    <div
      v-if="error"
      class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
    >
      <ExclamationTriangleIcon class="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
      <div class="flex-1">
        <p class="text-sm font-medium text-red-800">Error loading dashboard</p>
        <p class="text-sm text-red-600 mt-1">{{ error }}</p>
      </div>
      <button
        class="text-sm font-medium text-red-700 hover:text-red-800 underline shrink-0"
        @click="loadDashboard"
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
      <p class="mt-4 text-sm text-gray-500">Loading dashboard data...</p>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <OptKpiCard
          v-for="kpi in kpis"
          :key="kpi.label"
          :title="kpi.label"
          :value="kpi.value"
          :comparison="kpi.comparison"
          :color="kpi.color"
          :icon="kpi.icon"
          :target="kpi.target"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div class="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
          <h3 class="text-base font-semibold text-gray-900 mb-4">Operational Health</h3>
          <p class="text-xs text-gray-500 mb-4">Delays & Rescues trend over last 6 weeks</p>
          <div class="relative" :style="{ height: chartHeight + 'px' }">
            <div class="flex items-end justify-between gap-2 h-full">
              <div
                v-for="(item, idx) in chartData"
                :key="idx"
                class="flex-1 flex flex-col items-center gap-1 h-full justify-end"
              >
                <div class="flex flex-col items-center gap-0.5 w-full">
                  <div
                    class="w-full bg-red-400 rounded-t transition-all duration-500"
                    :style="{ height: (item.delays / maxHealth) * (chartHeight - 30) + 'px' }"
                    :title="'Delays: ' + item.delays"
                  />
                  <div
                    class="w-full bg-amber-400 rounded-t transition-all duration-500"
                    :style="{ height: (item.rescues / maxHealth) * (chartHeight - 30) + 'px' }"
                    :title="'Rescues: ' + item.rescues"
                  />
                </div>
                <span class="text-xs text-gray-500 mt-1">{{ item.week }}</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-4 mt-4 text-xs text-gray-500">
            <span class="flex items-center gap-1"
              ><span class="h-2.5 w-2.5 rounded bg-red-400" /> Delays</span
            >
            <span class="flex items-center gap-1"
              ><span class="h-2.5 w-2.5 rounded bg-amber-400" /> Rescues</span
            >
          </div>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-semibold text-gray-900">Pending Approvals</h3>
            <span class="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{{
              pendingApprovals.length
            }}</span>
          </div>
          <ul v-if="pendingApprovals.length" class="space-y-3">
            <li
              v-for="item in pendingApprovals"
              :key="item.id"
              class="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <component
                :is="approvalIcons[item.type]"
                class="h-4 w-4 mt-0.5"
                :class="
                  item.type === 'leave'
                    ? 'text-blue-500'
                    : item.type === 'attendance'
                      ? 'text-amber-500'
                      : 'text-purple-500'
                "
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ item.label }}</p>
                <p class="text-xs text-gray-500">{{ item.employee }} &middot; {{ item.time }}</p>
              </div>
            </li>
          </ul>
          <div v-else class="text-center py-8">
            <CheckCircleIcon class="h-8 w-8 text-green-400 mx-auto" />
            <p class="text-sm text-gray-500 mt-2">All caught up</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
          <h3 class="text-base font-semibold text-gray-900 mb-4">Exception Alerts</h3>
          <OptTable
            :columns="alertColumns"
            :rows="exceptionAlerts"
            empty-message="No active exceptions"
            compact
          >
            <template #cell-severity="{ row }">
              <span
                class="text-xs font-medium px-1.5 py-0.5 rounded"
                :class="
                  row.severity === 'high'
                    ? 'bg-red-200 text-red-800'
                    : row.severity === 'medium'
                      ? 'bg-amber-200 text-amber-800'
                      : 'bg-blue-200 text-blue-800'
                "
              >{{ row.severity }}</span>
            </template>
          </OptTable>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-semibold text-gray-900">Department Health</h3>
            <span class="text-xs text-gray-500">Delay / Completion</span>
          </div>
          <div class="space-y-4">
            <div v-for="dept in departments" :key="dept.name">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium text-gray-700">{{ dept.name }}</span>
                <span class="text-xs text-gray-500"
                  >{{ dept.delayRate }}% / {{ dept.completionRate }}%</span
                >
              </div>
              <div class="flex gap-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="bg-red-400 rounded-l-full transition-all duration-500"
                  :style="{ width: dept.delayRate + '%' }"
                />
                <div
                  class="bg-green-400 rounded-r-full transition-all duration-500"
                  :style="{ width: dept.completionRate + '%' }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          v-for="link in quickLinks"
          :key="link.label"
          :class="[
            'flex items-center justify-between p-4 rounded-lg border border-gray-200 shadow-sm transition-all',
            link.color,
          ]"
          @click="router.push(link.route)"
        >
          <div class="flex items-center gap-3">
            <component :is="link.icon" class="h-5 w-5" />
            <span class="text-sm font-semibold">{{ link.label }}</span>
          </div>
          <ArrowRightIcon class="h-4 w-4" />
        </button>
      </div>
    </template>
  </div>
</template>
