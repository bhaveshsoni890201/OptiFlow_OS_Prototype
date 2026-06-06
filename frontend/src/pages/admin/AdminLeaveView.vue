<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  CalendarDaysIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowsRightLeftIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'
import { useWorkflowStore } from '../../stores/workflowStore'
import { useAdminStore } from '../../stores/adminStore'
import { usePagination } from '../../composables/usePagination'
import OptTable from '../../components/common/OptTable.vue'
import OptFilterBar from '../../components/common/OptFilterBar.vue'
import type { Column } from '../../components/common/OptTable.vue'
import type { FilterConfig } from '../../components/common/OptFilterBar.vue'
import OptEmptyState from '../../components/common/OptEmptyState.vue'

const workflowStore = useWorkflowStore()
const adminStore = useAdminStore()

const loading = ref(true)
const error = ref<string | null>(null)

const filterDept = ref('')
const filterStatus = ref('')
const departments = ['All', 'Management', 'Weaving', 'Quality Control', 'Inventory', 'Finishing']

const filteredRequests = computed(() => {
  return workflowStore.leaveRequests.filter((r) => {
    if (filterStatus.value && r.status !== filterStatus.value) return false
    return true
  })
})

const {
  paginated: paginatedRequests,
  totalPages: requestsTotalPages,
  currentPage: requestsCurrentPage,
  totalItems: requestsTotalItems,
  goTo: requestsGoTo,
} = usePagination(filteredRequests, 20)

watch(filteredRequests, () => requestsGoTo(1))

const leaveColumns: Column[] = [
  { key: 'employee_name', label: 'Employee' },
  { key: 'leave_type', label: 'Type' },
  { key: 'start_date', label: 'Dates', render: (row) => `${row.start_date} — ${row.end_date}` },
  { key: 'total_days', label: 'Days' },
  { key: 'buddy_name', label: 'Buddy' },
  { key: 'status', label: 'Status' },
]

const filterConfig: FilterConfig[] = [
  {
    key: 'status',
    label: 'All Status',
    type: 'select',
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
      { value: 'escalated', label: 'Escalated' },
    ],
  },
]

const filterModel = ref<Record<string, any>>({
  status: '',
})

watch(filterModel, (val) => {
  filterStatus.value = val.status || ''
}, { deep: true })

const escalatedCount = computed(() =>
  workflowStore.leaveRequests.filter((r) => r.status === 'escalated').length,
)

const balances = computed(() => {
  const empRequests = workflowStore.leaveRequests
  return adminStore.employees
    .filter((e) => e.status === 'active')
    .map((e) => {
      const empLeaves = empRequests.filter((r) => r.employee_id === e.employee_id && r.status === 'approved')
      const sick = empLeaves.filter((r) => r.leave_type === 'sick').length
      const casual = empLeaves.filter((r) => r.leave_type === 'casual').length
      const annual = empLeaves.filter((r) => r.leave_type === 'annual').length
      return {
        employee_id: e.employee_id,
        employee_name: e.name,
        sick: Math.max(10 - sick, 0),
        casual: Math.max(6 - casual, 0),
        annual: Math.max(12 - annual, 0),
      }
    })
})

const activeTransfers = computed(() =>
  workflowStore.buddyTransfers.filter((t) => !t.reverted),
)
const pendingReverts = computed(() =>
  workflowStore.buddyTransfers.filter((t) => t.reverted),
)

// Calendar heat map for June 2026
const today = new Date()
const year = today.getFullYear()
const month = today.getMonth()
const daysInMonth = new Date(year, month + 1, 0).getDate()
const calendarDays = computed(() => {
  const days: { date: number; count: number; dayName: string }[] = []
  const monthStr = String(month + 1).padStart(2, '0')
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${monthStr}-${String(d).padStart(2, '0')}`
    const count = workflowStore.leaveRequests.filter(
      (r) => dateStr >= r.start_date && dateStr <= r.end_date && r.status !== 'rejected',
    ).length
    const dayName = new Date(year, month, d).toLocaleDateString('en', { weekday: 'short' })
    days.push({ date: d, count, dayName })
  }
  return days
})

function getHeatColor(count: number): string {
  if (count === 0) return 'bg-slate-50 text-slate-400'
  if (count <= 1) return 'bg-blue-100 text-blue-700'
  if (count <= 2) return 'bg-blue-200 text-blue-800'
  if (count <= 3) return 'bg-amber-200 text-amber-800'
  return 'bg-red-200 text-red-800'
}

async function changeStatus(reqId: string, newStatus: 'approved' | 'rejected') {
  if (newStatus === 'approved') {
    await workflowStore.approveLeave(reqId)
  } else {
    await workflowStore.rejectLeave(reqId, 'Rejected by admin')
  }
}

async function loadLeaveData() {
  loading.value = true
  error.value = null
  try {
    await Promise.all([
      workflowStore.fetchLeaveRequests(),
      adminStore.fetchEmployees(),
    ])
    await workflowStore.checkAutoEscalate()
  } catch (e) {
    error.value = 'Failed to load leave data'
  } finally {
    loading.value = false
  }
}

onMounted(loadLeaveData)

const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
  escalated: 'bg-orange-50 text-orange-700 border-orange-200',
  archived: 'bg-slate-50 text-slate-400 border-slate-200',
}

const statusIcons: Record<string, any> = {
  pending: ClockIcon,
  approved: CheckCircleIcon,
  rejected: XCircleIcon,
  escalated: ExclamationTriangleIcon,
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
    </div>

    <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
      <span class="text-sm text-red-600">{{ error }}</span>
      <button
        class="text-sm font-medium text-red-700 hover:text-red-800 underline"
        @click="loadLeaveData"
      >
        Retry
      </button>
    </div>

    <template v-else>
    <div class="flex items-center justify-between">
      <h1 class="text-xl sm:text-2xl font-bold text-slate-900">Leave Management</h1>
      <span v-if="escalatedCount > 0" class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
        <ExclamationTriangleIcon class="w-3.5 h-3.5" /> {{ escalatedCount }} escalated
      </span>
    </div>

    <!-- Leave Calendar Heat -->
    <div class="bg-white rounded-xl border border-slate-200 p-5">
      <h2 class="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <CalendarDaysIcon class="w-4 h-4 text-slate-400" />
        Leave Calendar —
        {{ new Date().toLocaleDateString('en', { month: 'long', year: 'numeric' }) }}
      </h2>
      <div class="grid grid-cols-7 gap-1.5">
        <div
          v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
          :key="day"
          class="text-center text-xs font-semibold text-slate-400 py-1"
        >
          {{ day }}
        </div>
        <div
          v-for="d in calendarDays"
          :key="d.date"
          class="text-center py-2 rounded-lg text-sm font-medium transition-colors"
          :class="getHeatColor(d.count)"
          :title="`${d.dayName} ${d.date}: ${d.count} on leave`"
        >
          <span class="block">{{ d.date }}</span>
          <span v-if="d.count > 0" class="block text-xs mt-0.5 opacity-70">{{ d.count }} away</span>
        </div>
      </div>
    </div>

    <!-- All Requests -->
    <div class="bg-white rounded-xl border border-slate-200 p-5">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 class="text-sm font-semibold text-slate-900">All Leave Requests</h2>
        <OptFilterBar
          :filters="filterConfig"
          v-model="filterModel"
          compact
        />
      </div>
      <OptTable
        :columns="leaveColumns"
        :rows="paginatedRequests"
        :paginated="true"
        :page-size="20"
        :current-page="requestsCurrentPage"
        :total-items="requestsTotalItems"
        empty-message="No leave requests found"
        compact
        @update:current-page="requestsCurrentPage = $event"
      >
        <template #cell-status="{ row }">
          <span
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
            :class="statusColors[row.status]"
          >
            <component :is="statusIcons[row.status]" class="w-3 h-3" />
            {{ row.status.charAt(0).toUpperCase() + row.status.slice(1) }}
          </span>
        </template>
        <template #actions="{ row }">
          <div v-if="row.status === 'pending' || row.status === 'escalated'" class="flex items-center justify-end gap-1">
            <button
              class="p-1.5 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md"
              title="Approve"
              @click="changeStatus(row.id, 'approved')"
            >
              <CheckCircleIcon class="w-4 h-4" />
            </button>
            <button
              class="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md"
              title="Reject"
              @click="changeStatus(row.id, 'rejected')"
            >
              <XCircleIcon class="w-4 h-4" />
            </button>
          </div>
          <span v-else class="text-xs text-slate-400">—</span>
        </template>
      </OptTable>
    </div>

    <!-- Balances & Buddy Transfer -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Leave Balances -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h2 class="text-sm font-semibold text-slate-900 mb-4">Leave Balances</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-slate-50 text-left">
                <th class="px-3 py-2 font-semibold text-xs text-slate-500 uppercase">Employee</th>
                <th class="px-3 py-2 font-semibold text-xs text-slate-500 uppercase text-center">
                  Sick
                </th>
                <th class="px-3 py-2 font-semibold text-xs text-slate-500 uppercase text-center">
                  Casual
                </th>
                <th class="px-3 py-2 font-semibold text-xs text-slate-500 uppercase text-center">
                  Annual
                </th>
                <th class="px-3 py-2 font-semibold text-xs text-slate-500 uppercase text-center">
                  Total
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="b in balances" :key="b.employee_id" class="hover:bg-slate-50">
                <td class="px-3 py-2.5 font-medium text-slate-800">{{ b.employee_name }}</td>
                <td class="px-3 py-2.5 text-center text-slate-600">{{ b.sick }}</td>
                <td class="px-3 py-2.5 text-center text-slate-600">{{ b.casual }}</td>
                <td class="px-3 py-2.5 text-center text-slate-600">{{ b.annual }}</td>
                <td class="px-3 py-2.5 text-center font-medium text-slate-800">
                  {{ b.sick + b.casual + b.annual }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Buddy Transfer Monitor -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h2 class="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <ArrowsRightLeftIcon class="w-4 h-4 text-slate-400" />
          Buddy Transfer Status
        </h2>

        <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Active Transfers
        </h3>
        <OptEmptyState v-if="activeTransfers.length === 0" type="leave" title="No active transfers" description="There are no buddy transfers in progress." />
        <div
          v-for="bt in activeTransfers"
          :key="bt.id"
          class="flex items-center justify-between p-3 bg-blue-50 rounded-lg mb-2"
        >
          <div>
            <p class="text-sm font-medium text-slate-800">{{ bt.employee }} → {{ bt.buddy }}</p>
            <p class="text-xs text-slate-500">{{ bt.start }} — {{ bt.end }}</p>
          </div>
          <span
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
          >
            <ArrowPathIcon class="w-3 h-3" /> Active
          </span>
        </div>

        <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4">
          Pending Reverts
        </h3>
        <OptEmptyState v-if="pendingReverts.length === 0" type="leave" title="No pending reverts" description="No reverts are awaiting review." />
        <div
          v-for="bt in pendingReverts"
          :key="bt.id"
          class="flex items-center justify-between p-3 bg-amber-50 rounded-lg mb-2"
        >
          <div>
            <p class="text-sm font-medium text-slate-800">{{ bt.employee }} → {{ bt.buddy }}</p>
            <p class="text-xs text-slate-500">{{ bt.start }} — {{ bt.end }}</p>
          </div>
          <span
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700"
          >
            <ClockIcon class="w-3 h-3" /> Pending
          </span>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

