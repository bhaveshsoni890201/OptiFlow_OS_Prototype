<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  BriefcaseIcon,
  ChartBarIcon,
} from '@heroicons/vue/24/outline'
import { useRouter } from 'vue-router'
import { useAdminStore } from '../../stores/adminStore'

const router = useRouter()
const adminStore = useAdminStore()
const loading = ref(true)
const error = ref<string | null>(null)

const searchQuery = ref('')
const selectedEmployeeIndex = ref(0)

const doers = computed(() =>
  adminStore.employees.filter((e) => e.roles.includes('doer')),
)

const filteredEmployees = computed(() => {
  const all = doers.value.map((e) => ({
    id: e.employee_id,
    name: e.name,
    role: e.designation || 'Doer',
    dept: e.department,
    avatar: e.name.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase(),
  }))
  if (!searchQuery.value.trim()) return all
  const q = searchQuery.value.toLowerCase()
  return all.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.dept.toLowerCase().includes(q) ||
      e.role.toLowerCase().includes(q),
  )
})

const selectedEmployee = computed(
  () => filteredEmployees.value[selectedEmployeeIndex.value] || filteredEmployees.value[0],
)

const metrics = ref({
  taskCompletion: 92,
  onTimePercent: 87,
  rescuesIncurred: 3,
  avgDelayHrs: 1.2,
  attendance: 96,
  trainingCompletion: 88,
  leaveTaken: 4,
  currentWorkload: 7,
})

const completionTrend = ref([78, 82, 85, 88, 90, 92])
const taskMix = ref([
  { label: 'Assembly', value: 45, color: 'bg-blue-500' },
  { label: 'Inspection', value: 25, color: 'bg-green-500' },
  { label: 'Packing', value: 18, color: 'bg-amber-500' },
  { label: 'Dispatch', value: 12, color: 'bg-purple-500' },
])
const delayHistory = ref([1.8, 2.1, 1.5, 1.2, 0.9, 1.2])
const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6']

const maxTrend = computed(() => Math.max(...completionTrend.value))
const maxDelay = computed(() => Math.max(...delayHistory.value))

interface TimelineEvent {
  id: number
  type: string
  message: string
  time: string
}
const timeline = ref<TimelineEvent[]>([
  {
    id: 1,
    type: 'completed',
    message: 'Completed worklist #342 - Assembly Line A',
    time: '2h ago',
  },
  { id: 2, type: 'rescue', message: 'Rescued task #128 from delayed queue', time: '4h ago' },
  { id: 3, type: 'training', message: 'Completed module: Safety Protocols v3', time: '1d ago' },
  { id: 4, type: 'flag', message: 'Late arrival flagged - 15min delay', time: '2d ago' },
  { id: 5, type: 'completed', message: 'Completed worklist #339 - QC Batch 12', time: '2d ago' },
  { id: 6, type: 'leave', message: 'Applied for leave on Apr 15-16', time: '3d ago' },
])

const timelineIcons: Record<string, any> = {
  completed: CheckCircleIcon,
  rescue: ClockIcon,
  training: AcademicCapIcon,
  flag: ExclamationTriangleIcon,
  leave: CalendarDaysIcon,
}

const timelineColors: Record<string, string> = {
  completed: 'text-green-500',
  rescue: 'text-amber-500',
  training: 'text-blue-500',
  flag: 'text-red-500',
  leave: 'text-purple-500',
}

const exportLoading = ref(false)
function handleExport() {
  exportLoading.value = true
  setTimeout(() => {
    exportLoading.value = false
  }, 1000)
}

function selectEmployee(index: number) {
  selectedEmployeeIndex.value = index
}

async function loadEmployeeData() {
  loading.value = true
  error.value = null
  try {
    await adminStore.fetchEmployees()
  } catch (e) {
    error.value = 'Failed to load employee data'
  } finally {
    loading.value = false
  }
}

onMounted(loadEmployeeData)
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Doer 360&deg;</h1>
        <p class="text-sm text-gray-500 mt-1">Detailed employee performance view</p>
      </div>
      <button
        class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        :disabled="exportLoading"
        @click="handleExport"
      >
        <ArrowDownTrayIcon class="h-4 w-4" />
        Export Report
      </button>
    </div>

    <div
      v-if="error"
      class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between"
    >
      <span class="text-sm text-red-600">{{ error }}</span>
      <button
        class="text-sm font-medium text-red-700 hover:text-red-800 underline"
        @click="loadEmployeeData"
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
      <p class="mt-4 text-sm text-gray-500">Loading employee data...</p>
    </div>

    <template v-else>
      <div class="relative mb-6">
        <MagnifyingGlassIcon
          class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search employees by name, role, or department..."
          class="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div class="p-3 border-b border-gray-100">
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ filteredEmployees.length }} found</p>
            </div>
            <ul
              v-if="filteredEmployees.length"
              class="divide-y divide-gray-100 max-h-80 overflow-y-auto"
            >
              <li
                v-for="(emp, idx) in filteredEmployees"
                :key="emp.id"
                class="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors"
                :class="
                  selectedEmployeeIndex === idx
                    ? 'bg-blue-50 border-l-2 border-l-blue-600'
                    : 'hover:bg-gray-50 border-l-2 border-l-transparent'
                "
                @click="selectEmployee(idx)"
              >
                <div
                  class="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600"
                >
                  {{ emp.avatar }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ emp.name }}</p>
                  <p class="text-xs text-gray-500 truncate">
                    {{ emp.role }} &middot; {{ emp.dept }}
                  </p>
                </div>
              </li>
            </ul>
            <div v-else class="p-6 text-center">
              <UserIcon class="h-8 w-8 text-gray-300 mx-auto" />
              <p class="text-sm text-gray-500 mt-2">No employees match your search</p>
            </div>
          </div>
        </div>

          <div v-if="selectedEmployee" class="lg:col-span-3 space-y-6">
          <div class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
            <div class="flex items-start gap-4">
              <div
                class="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-base font-bold text-blue-700"
              >
                {{ selectedEmployee.avatar }}
              </div>
              <div class="flex-1">
                <h2 class="text-lg font-bold text-gray-900">{{ selectedEmployee.name }}</h2>
                <p class="text-sm text-gray-500">
                  {{ selectedEmployee.role }} &middot; {{ selectedEmployee.dept }}
                </p>
                <div class="flex flex-wrap gap-2 mt-3">
                  <span
                    class="inline-flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded-full"
                  >
                    <CheckCircleIcon class="h-3 w-3" /> {{ metrics.taskCompletion }}% Completion
                  </span>
                  <span
                    class="inline-flex items-center gap-1 text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                  >
                    <BriefcaseIcon class="h-3 w-3" /> {{ metrics.currentWorkload }} tasks
                  </span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <p class="text-lg font-bold text-gray-900">{{ metrics.onTimePercent }}%</p>
                <p class="text-xs text-gray-500">On-Time</p>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <p class="text-lg font-bold text-gray-900">{{ metrics.rescuesIncurred }}</p>
                <p class="text-xs text-gray-500">Rescues</p>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <p class="text-lg font-bold text-gray-900">{{ metrics.avgDelayHrs }}h</p>
                <p class="text-xs text-gray-500">Avg Delay</p>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <p class="text-lg font-bold text-gray-900">{{ metrics.attendance }}%</p>
                <p class="text-xs text-gray-500">Attendance</p>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <p class="text-lg font-bold text-gray-900">{{ metrics.trainingCompletion }}%</p>
                <p class="text-xs text-gray-500">Training</p>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <p class="text-lg font-bold text-gray-900">{{ metrics.leaveTaken }}d</p>
                <p class="text-xs text-gray-500">Leave Taken</p>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <p class="text-lg font-bold text-gray-900">{{ metrics.currentWorkload }}</p>
                <p class="text-xs text-gray-500">Workload</p>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <p class="text-lg font-bold text-gray-900">{{ metrics.taskCompletion }}%</p>
                <p class="text-xs text-gray-500">Completion</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <h4 class="text-sm font-semibold text-gray-900 mb-3">Completion Trend</h4>
              <div class="flex items-end gap-1.5 h-24">
                <div
                  v-for="(val, i) in completionTrend"
                  :key="i"
                  class="flex-1 flex flex-col items-center"
                >
                  <div
                    class="w-full bg-green-400 rounded-t transition-all duration-500"
                    :style="{ height: (val / maxTrend) * 100 + '%' }"
                  />
                  <span class="text-[10px] text-gray-400 mt-1">{{ weeks[i] }}</span>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <h4 class="text-sm font-semibold text-gray-900 mb-3">Task Mix</h4>
              <div class="space-y-2">
                <div v-for="item in taskMix" :key="item.label" class="flex items-center gap-2">
                  <span :class="['h-2.5 w-2.5 rounded-full', item.color]" />
                  <span class="text-xs text-gray-600 flex-1">{{ item.label }}</span>
                  <span class="text-xs font-medium text-gray-900">{{ item.value }}%</span>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <h4 class="text-sm font-semibold text-gray-900 mb-3">Delay History</h4>
              <div class="flex items-end gap-1.5 h-24">
                <div
                  v-for="(val, i) in delayHistory"
                  :key="i"
                  class="flex-1 flex flex-col items-center"
                >
                  <div
                    class="w-full bg-red-400 rounded-t transition-all duration-500"
                    :style="{ height: (val / maxDelay) * 100 + '%' }"
                  />
                  <span class="text-[10px] text-gray-400 mt-1">{{ weeks[i] }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
            <h3 class="text-base font-semibold text-gray-900 mb-4">Activity Timeline</h3>
            <div v-if="timeline.length" class="relative pl-6 space-y-4">
              <div v-for="(event, idx) in timeline" :key="event.id" class="relative">
                <div
                  class="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full border-2 border-white shadow"
                  :class="timelineColors[event.type] + ' bg-white'"
                />
                <div
                  v-if="idx < timeline.length - 1"
                  class="absolute -left-[19px] top-3 bottom-0 w-px bg-gray-200"
                />
                <div class="flex items-start gap-2">
                  <p class="text-sm text-gray-900 flex-1">{{ event.message }}</p>
                  <span class="text-xs text-gray-400 whitespace-nowrap">{{ event.time }}</span>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-6 text-sm text-gray-500">No recent activity</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
