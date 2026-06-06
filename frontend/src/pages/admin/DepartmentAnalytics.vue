<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/vue/24/outline'
import { getDepartments } from '../../services'
import { useAdminStore } from '../../stores/adminStore'
import { useTaskStore } from '../../stores/taskStore'
import { useRescueStore } from '../../stores/rescueStore'

const adminStore = useAdminStore()
const taskStore = useTaskStore()
const rescueStore = useRescueStore()

const loading = ref(true)
const error = ref<string | null>(null)
const selectedDept = ref('All')
const expandedDept = ref<string | null>(null)

const sortField = ref<string>('delayRate')
const sortDir = ref<'asc' | 'desc'>('asc')

interface Department {
  name: string
  delayRate: number
  completionRate: number
  activeUsers: number
  rescues: number
  attendance: number
}

const departments = ref<Department[]>([])

interface DepartmentEmployees {
  [key: string]: { name: string; role: string; delayRate: number; completion: number }[]
}

const deptEmployees = ref<DepartmentEmployees>({})

const filtered = computed(() => {
  if (selectedDept.value === 'All') return departments.value
  return departments.value.filter((d) => d.name === selectedDept.value)
})

const sortedDepts = computed(() => {
  const arr = [...filtered.value]
  const field = sortField.value as keyof Department
  arr.sort((a, b) => {
    const aVal = a[field] as number
    const bVal = b[field] as number
    return sortDir.value === 'desc' ? bVal - aVal : aVal - bVal
  })
  return arr
})

const deptNames = computed(() => departments.value.map((d) => d.name))

const maxDelay = computed(() => Math.max(...departments.value.map((d) => d.delayRate)))
const maxCompletion = computed(() => 100)

function toggleSort(field: string) {
  if (sortField.value === field) {
    sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc'
  } else {
    sortField.value = field
    sortDir.value = 'asc'
  }
}

function sortIcon(field: string) {
  if (sortField.value !== field) return 'opacity-0'
  return sortDir.value === 'desc' ? 'opacity-100' : 'opacity-100'
}

function toggleExpandDept(name: string) {
  expandedDept.value = expandedDept.value === name ? null : name
}

async function loadDepartments() {
  loading.value = true
  error.value = null
  try {
    await Promise.all([
      adminStore.fetchEmployees(),
      taskStore.fetchTasks(),
      rescueStore.fetchRecords(),
    ])
    const data = await getDepartments()
    departments.value = data.map((d) => {
      const deptEmps = adminStore.employees.filter((e) => e.department === d.name)
      const deptTasks = taskStore.allTasks.filter((t) =>
        deptEmps.some((e) => e.employee_id === t.assigned_to),
      )
      const done = deptTasks.filter((t) => t.status === 'completed').length
      const deptRescues = rescueStore.records.filter((r) =>
        deptEmps.some((e) => e.employee_id === r.employee_id),
      )
      const totalDelay = deptRescues.reduce((s, r) => s + r.delay_days, 0)
      return {
        name: d.name,
        delayRate: deptRescues.length > 0 ? +(totalDelay / deptRescues.length).toFixed(1) : 0,
        completionRate: deptTasks.length > 0 ? +((done / deptTasks.length) * 100).toFixed(1) : 0,
        activeUsers: deptEmps.filter((e) => e.status === 'active').length,
        rescues: deptRescues.length,
        attendance: deptEmps.length > 0 ? 92 : 0,
      }
    })
  } catch (e) {
    error.value = 'Failed to load department data'
  } finally {
    loading.value = false
  }
}

onMounted(loadDepartments)
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Department Analytics</h1>
        <p class="text-sm text-gray-500 mt-1">Cross-department performance comparison</p>
      </div>
      <div class="relative">
        <select
          v-model="selectedDept"
          class="appearance-none pl-3 pr-8 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option>All</option>
          <option v-for="name in deptNames" :key="name" :value="name">{{ name }}</option>
        </select>
        <ChevronDownIcon
          class="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none"
        />
      </div>
    </div>

    <div
      v-if="error"
      class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between"
    >
      <span class="text-sm text-red-600">{{ error }}</span>
      <button
        class="text-sm font-medium text-red-700 hover:text-red-800 underline"
        @click="loadDepartments"
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
      <p class="mt-4 text-sm text-gray-500">Loading department data...</p>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
          <h3 class="text-sm font-semibold text-gray-900 mb-4">Delay Rate by Department</h3>
          <div class="flex items-end gap-2 h-40">
            <div
              v-for="dept in departments"
              :key="dept.name"
              class="flex-1 flex flex-col items-center"
            >
              <span class="text-xs font-medium text-gray-700 mb-1">{{ dept.delayRate }}%</span>
              <div
                class="w-full rounded-t transition-all duration-500"
                :class="
                  dept.delayRate > 12
                    ? 'bg-red-500'
                    : dept.delayRate > 7
                      ? 'bg-amber-500'
                      : 'bg-green-500'
                "
                :style="{ height: (dept.delayRate / maxDelay) * 100 + '%' }"
              />
              <span class="text-[10px] text-gray-500 mt-1 truncate w-full text-center">{{
                dept.name
              }}</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
          <h3 class="text-sm font-semibold text-gray-900 mb-4">Completion Rate by Department</h3>
          <div class="flex items-end gap-2 h-40">
            <div
              v-for="dept in departments"
              :key="dept.name"
              class="flex-1 flex flex-col items-center"
            >
              <span class="text-xs font-medium text-gray-700 mb-1">{{ dept.completionRate }}%</span>
              <div
                class="w-full rounded-t transition-all duration-500 bg-green-400"
                :style="{ height: (dept.completionRate / maxCompletion) * 100 + '%' }"
              />
              <span class="text-[10px] text-gray-500 mt-1 truncate w-full text-center">{{
                dept.name
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50">
                <th
                  class="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Department
                </th>
                <th
                  class="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                  @click="toggleSort('delayRate')"
                >
                  <span class="inline-flex items-center gap-1"
                    >Delay Rate <ChevronUpIcon :class="['h-3 w-3', sortIcon('delayRate')]"
                  /></span>
                </th>
                <th
                  class="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                  @click="toggleSort('completionRate')"
                >
                  <span class="inline-flex items-center gap-1"
                    >Completion <ChevronUpIcon :class="['h-3 w-3', sortIcon('completionRate')]"
                  /></span>
                </th>
                <th
                  class="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                  @click="toggleSort('activeUsers')"
                >
                  <span class="inline-flex items-center gap-1"
                    >Active <ChevronUpIcon :class="['h-3 w-3', sortIcon('activeUsers')]"
                  /></span>
                </th>
                <th
                  class="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                  @click="toggleSort('rescues')"
                >
                  <span class="inline-flex items-center gap-1"
                    >Rescues <ChevronUpIcon :class="['h-3 w-3', sortIcon('rescues')]"
                  /></span>
                </th>
                <th
                  class="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                  @click="toggleSort('attendance')"
                >
                  <span class="inline-flex items-center gap-1"
                    >Attendance <ChevronUpIcon :class="['h-3 w-3', sortIcon('attendance')]"
                  /></span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="dept in sortedDepts" :key="dept.name">
                <td class="px-4 py-3">
                  <button
                    class="flex items-center gap-2 font-medium text-gray-900 hover:text-blue-600 transition-colors"
                    @click="toggleExpandDept(dept.name)"
                  >
                    {{ dept.name }}
                    <ChevronDownIcon
                      class="h-3.5 w-3.5 text-gray-400 transition-transform"
                      :class="expandedDept === dept.name ? 'rotate-180' : ''"
                    />
                  </button>
                </td>
                <td class="px-4 py-3 text-center">
                  <span
                    class="text-xs font-medium px-1.5 py-0.5 rounded"
                    :class="
                      dept.delayRate > 12
                        ? 'bg-red-100 text-red-700'
                        : dept.delayRate > 7
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                    "
                    >{{ dept.delayRate }}%</span
                  >
                </td>
                <td class="px-4 py-3 text-center">
                  <div class="inline-flex items-center gap-1.5">
                    <div class="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        class="h-full bg-green-500 rounded-full"
                        :style="{ width: dept.completionRate + '%' }"
                      />
                    </div>
                    <span class="text-xs text-gray-600">{{ dept.completionRate }}%</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-center text-sm text-gray-700">{{ dept.activeUsers }}</td>
                <td class="px-4 py-3 text-center text-sm text-gray-700">{{ dept.rescues }}</td>
                <td class="px-4 py-3 text-center text-sm">
                  <span
                    :class="
                      dept.attendance >= 95
                        ? 'text-green-600'
                        : dept.attendance >= 90
                          ? 'text-amber-600'
                          : 'text-red-600'
                    "
                  >
                    {{ dept.attendance }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div
        v-if="expandedDept && deptEmployees[expandedDept]"
        class="mt-4 bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-semibold text-gray-900">{{ expandedDept }} Employees</h3>
          <span class="text-xs text-gray-500"
            >{{ deptEmployees[expandedDept].length }} members</span
          >
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50">
                <th class="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th class="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th class="text-center px-4 py-2 text-xs font-medium text-gray-500 uppercase">
                  Delay %
                </th>
                <th class="text-center px-4 py-2 text-xs font-medium text-gray-500 uppercase">
                  Completion %
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="emp in deptEmployees[expandedDept]"
                :key="emp.name"
                class="hover:bg-gray-50"
              >
                <td class="px-4 py-2.5 font-medium text-gray-900">{{ emp.name }}</td>
                <td class="px-4 py-2.5 text-gray-600">{{ emp.role }}</td>
                <td class="px-4 py-2.5 text-center">
                  <span
                    class="text-xs font-medium"
                    :class="emp.delayRate > 10 ? 'text-red-600' : 'text-amber-600'"
                    >{{ emp.delayRate }}%</span
                  >
                </td>
                <td class="px-4 py-2.5 text-center">
                  <span
                    class="text-xs font-medium"
                    :class="emp.completion >= 90 ? 'text-green-600' : 'text-amber-600'"
                    >{{ emp.completion }}%</span
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="!departments.length && !loading" class="text-center py-20">
        <UserGroupIcon class="h-12 w-12 text-gray-300 mx-auto" />
        <p class="mt-4 text-sm text-gray-500">No department data available</p>
      </div>
    </template>
  </div>
</template>

