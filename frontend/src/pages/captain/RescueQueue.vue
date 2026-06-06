<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  UserGroupIcon,
  PaperAirplaneIcon,
  ArrowRightOnRectangleIcon,
  ShieldExclamationIcon,
} from '@heroicons/vue/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/vue/24/solid'
import { useRescueStore } from '../../stores/rescueStore'
import { useWorkflowStore } from '../../stores/workflowStore'
import { formatRelativeTime } from '../../utils/formatters'
import type { RescueRecord, TaskType } from '../../types'
import { usePagination } from '../../composables/usePagination'
import OptPagination from '../../components/common/OptPagination.vue'
import OptEmptyState from '../../components/common/OptEmptyState.vue'

const rescueStore = useRescueStore()
const workflowStore = useWorkflowStore()

const loading = ref(true)
const error = ref<string | null>(null)
const activeTab = ref<TaskType | 'all'>('all')
const searchQuery = ref('')
const sortBy = ref<'priority' | 'delay' | 'name'>('delay')
const remindingSet = ref<Set<string>>(new Set())

const severityColorMap: Record<string, string> = {
  soft: 'bg-slate-100 text-slate-700 border-slate-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  high_risk: 'bg-orange-50 text-orange-700 border-orange-200',
  admin_escalation: 'bg-red-50 text-red-700 border-red-200',
}
severityColorMap[''] = 'bg-slate-100 text-slate-400 border-slate-200'

const severityDotMap: Record<string, string> = {
  soft: 'bg-slate-400',
  warning: 'bg-amber-400',
  high_risk: 'bg-orange-500',
  admin_escalation: 'bg-red-500',
}
severityDotMap[''] = 'bg-slate-300'

const escalationLabels = ['Soft', 'Warning', 'High-Risk', 'Admin']
const escalationColors = [
  'bg-blue-100 text-blue-700',
  'bg-amber-100 text-amber-700',
  'bg-orange-100 text-orange-700',
  'bg-red-100 text-red-700',
]

const severityOrder: Record<string, number> = { soft: 0, warning: 1, high_risk: 2, admin_escalation: 3 }

const tabCounts = computed(() => {
  const all = rescueStore.records.length
  const delegation = rescueStore.records.filter((r) => r.task_type === 'delegation').length
  const checklist = rescueStore.records.filter((r) => r.task_type === 'checklist').length
  const fms = rescueStore.records.filter((r) => r.task_type === 'fms').length
  return { all, delegation, checklist, fms }
})

const filteredRecords = computed(() => {
  let records = rescueStore.records

  if (activeTab.value !== 'all') {
    records = records.filter((r) => r.task_type === activeTab.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    records = records.filter(
      (r) => r.employee_name.toLowerCase().includes(q) || r.task_title.toLowerCase().includes(q),
    )
  }

  const sortMap = {
    priority: () => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 }
      return [...records].sort((a, b) => order[a.priority] - order[b.priority])
    },
    delay: () => [...records].sort((a, b) => b.delay_days - a.delay_days),
    name: () => [...records].sort((a, b) => a.employee_name.localeCompare(b.employee_name)),
  }

  return sortMap[sortBy.value]()
})

const {
  paginated: paginatedRecords,
  totalPages: recordsTotalPages,
  currentPage: recordsCurrentPage,
  totalItems: recordsTotalItems,
  goTo: recordsGoTo,
} = usePagination(filteredRecords, 20)

watch(filteredRecords, () => recordsGoTo(1))

function initials(name: string): string {
  return name.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase()
}

async function handleRemind(record: RescueRecord) {
  remindingSet.value.add(record.id)
  await rescueStore.sendReminder(record.id)
  remindingSet.value.delete(record.id)
}

async function handleEscalate(record: RescueRecord) {
  await rescueStore.escalate(record.id)
}

async function handleResolve(record: RescueRecord) {
  await rescueStore.resolve(record.id)
}

const taskTypeColors: Record<string, string> = {
  delegation: 'bg-violet-50 text-violet-700 border-violet-200',
  checklist: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  fms: 'bg-blue-50 text-blue-700 border-blue-200',
}

async function loadQueue() {
  loading.value = true
  error.value = null
  try {
    workflowStore.checkAndGenerateRescues()
    await rescueStore.fetchRecords()
  } catch {
    error.value = 'Failed to load rescue queue.'
  } finally {
    loading.value = false
  }
}

onMounted(loadQueue)
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
      <div class="flex flex-col items-center gap-3">
        <div
          class="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"
        />
        <span class="text-sm text-slate-500">Loading rescue queue...</span>
      </div>
    </div>

    <div v-else-if="error" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <ExclamationTriangleIcon class="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p class="text-sm text-red-600 font-medium">{{ error }}</p>
        <button
          class="mt-3 text-sm text-blue-600 hover:underline"
          @click="loadQueue()"
        >
          Retry
        </button>
      </div>
    </div>

    <div v-else class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">Rescue</h1>
          <p class="text-sm text-slate-500">{{ rescueStore.records.length }} tasks need attention</p>
        </div>
      </div>

      <!-- Grouping Tabs -->
      <div class="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-xl">
        <button
          v-for="tab in ['all', 'delegation', 'checklist', 'fms']"
          :key="tab"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize"
          :class="
            activeTab === tab
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          "
          @click="activeTab = tab as any"
        >
          {{ tab === 'all' ? 'All' : tab }}
          <span class="ml-1.5 text-xs opacity-60"
            >({{ tabCounts[tab as keyof typeof tabCounts] }})</span
          >
        </button>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <MagnifyingGlassIcon
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by employee or task..."
            class="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <div class="flex gap-2">
          <div class="relative">
            <FunnelIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              v-model="sortBy"
              class="appearance-none pl-9 pr-8 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="delay">Delay: High → Low</option>
              <option value="priority">Priority</option>
              <option value="name">Name</option>
            </select>
            <ChevronDownIcon
              class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      <OptEmptyState v-if="filteredRecords.length === 0" type="tasks" title="No tasks need rescue right now" description="Everything is on track. Great leadership!" />

      <!-- Rescue Cards -->
      <div v-else class="space-y-3">
        <div
          v-for="record in paginatedRecords"
          :key="record.id"
          class="bg-white rounded-xl border border-slate-200 p-4 transition-all hover:shadow-md hover:border-slate-300"
        >
          <div class="flex items-start gap-4">
            <!-- Avatar -->
            <div
              class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700 shrink-0"
            >
              {{ initials(record.employee_name) }}
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <!-- Employee & Task -->
              <div class="space-y-1">
                <p class="text-sm font-semibold text-slate-900">{{ record.employee_name }}</p>
                <p class="text-sm text-slate-600 truncate">{{ record.task_title }}</p>
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border"
                  :class="taskTypeColors[record.task_type]"
                >
                  {{ record.task_type.charAt(0).toUpperCase() + record.task_type.slice(1) }}
                </span>
              </div>

              <!-- Delay -->
              <div class="flex flex-col items-start sm:items-center justify-center">
                <span
                  class="text-2xl font-bold"
                  :class="
                    record.delay_days >= 4
                      ? 'text-red-600'
                      : record.delay_days >= 2
                        ? 'text-amber-600'
                        : 'text-slate-600'
                  "
                >
                  {{ record.delay_days }}d
                </span>
                <span class="text-xs text-slate-400">delay</span>
              </div>

              <!-- Severity & Meta -->
              <div class="space-y-1.5">
                <span
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
                  :class="severityColorMap[record.severity ?? '']"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="severityDotMap[record.severity ?? '']" />
                  {{ (record.severity || 'unknown').replace('_', ' ') }}
                </span>
                <p class="text-xs text-slate-400">Last: {{ formatRelativeTime(record.last_activity) }}</p>
                <p class="text-xs text-slate-400">
                  {{ record.reminder_count }} reminder{{ record.reminder_count !== 1 ? 's' : '' }}
                </p>
                <span
                  v-if="record.carry_forward_risk"
                  class="inline-flex items-center gap-1 text-xs text-red-600 font-medium"
                >
                  <ExclamationTriangleIcon class="w-3.5 h-3.5" /> Carry-forward risk
                </span>
              </div>

              <!-- Escalation ladder -->
              <div class="flex flex-col items-start sm:items-end justify-center gap-1.5">
                <div class="flex items-center gap-1">
                  <span
                    v-for="level in 4"
                    :key="level"
                    class="w-2 h-2 rounded-full transition-colors"
                    :class="level - 1 <= (severityOrder[record.severity ?? ''] ?? 0) ? 'bg-red-500' : 'bg-slate-200'"
                  />
                </div>
                <span
                  class="text-xs font-medium px-2 py-0.5 rounded-full"
                  :class="escalationColors[(severityOrder[record.severity ?? ''] ?? 0)]"
                >
                  {{ escalationLabels[(severityOrder[record.severity ?? ''] ?? 0)] }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex sm:flex-col gap-1.5 shrink-0">
              <button
                :disabled="remindingSet.has(record.id)"
                class="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors disabled:opacity-50"
                title="Remind"
                @click="handleRemind(record)"
              >
                <ArrowPathIcon v-if="remindingSet.has(record.id)" class="w-4 h-4 animate-spin" />
                <PaperAirplaneIcon v-else class="w-4 h-4" />
              </button>
              <button
                class="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors"
                title="Reassign"
              >
                <UserGroupIcon class="w-4 h-4" />
              </button>
              <button
                class="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                title="Escalate"
                @click="handleEscalate(record)"
              >
                <ShieldExclamationIcon class="w-4 h-4" />
              </button>
              <button
                class="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                title="Resolve"
                @click="handleResolve(record)"
              >
                <CheckCircleIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <OptPagination
        :current-page="recordsCurrentPage"
        :total-pages="recordsTotalPages"
        :total-items="recordsTotalItems"
        :page-size="20"
        @page-change="recordsCurrentPage = $event"
      />
    </div>
  </div>
</template>
