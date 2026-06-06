<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  ListBulletIcon,
} from '@heroicons/vue/24/outline'
import type { Employee, Role } from '../../types'
import { useAdminStore } from '../../stores/adminStore'
import { useStore } from '../../stores/useStore'
import { getTrainingAssignments } from '../../services'
import OptEmptyState from '../../components/common/OptEmptyState.vue'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()

const loading = ref(true)
const error = ref<string | null>(null)
const saving = ref(false)
const editMode = ref(false)

const employeeId = computed(() => route.params.id as string)

const captains = computed(() =>
  adminStore.employees.filter((e) => e.roles.includes('captain') || e.roles.includes('admin')),
)
const departments = [
  'Management',
  'Weaving',
  'Quality Control',
  'Inventory',
  'Finishing',
  'HR',
  'Maintenance',
]
const roleOptions: Role[] = ['doer', 'captain', 'admin']

const employee = computed(
  () => adminStore.employees.find((e) => e.employee_id === employeeId.value) || null,
)

const editForm = ref({
  name: '',
  mobile: '',
  email: '',
  department: '',
  designation: '',
  reporting_captain: '',
  roles: [] as Role[],
  status: 'active' as 'active' | 'disabled',
})

const formErrors = ref<Record<string, string>>({})

const store = useStore()
const showTransferModal = ref(false)
const transferTarget = ref('')
const transferReason = ref('')
const showOffboardModal = ref(false)
const offboardConfirm = ref('')

const activityLog = ref([
  { action: 'Updated employee profile', timestamp: '2026-06-02T14:30:00+05:30' },
  { action: 'Changed role to Captain', timestamp: '2026-06-01T10:00:00+05:30' },
  { action: 'Employee created', timestamp: '2024-02-01T09:00:00+05:30' },
])

const recentTasks = ref([
  { id: 'DEL-0002', title: 'Thread inventory count', status: 'in_progress', due: '2026-06-05' },
  {
    id: 'CHK-0002',
    title: 'Temperature log for dyeing section',
    status: 'completed',
    due: '2026-06-03',
  },
])

const attendanceSummary = ref([
  { month: 'May 2026', present: 24, absent: 1, late: 2, leave: 3 },
  { month: 'Apr 2026', present: 26, absent: 0, late: 1, leave: 1 },
])

const leaveHistory = ref([
  { type: 'Annual Leave', days: 2, from: '2026-06-08', to: '2026-06-09', status: 'pending' },
  { type: 'Sick Leave', days: 1, from: '2026-04-15', to: '2026-04-15', status: 'approved' },
])

const trainingRecords = ref<{ title: string; type: string; status: string; deadline: string }[]>([])
const performanceReviews = ref<{ period: string; rating: number; notes: string }[]>([
  { period: 'Q1 2026', rating: 4, notes: 'Exceeds expectations in task completion' },
  { period: 'Q4 2025', rating: 3, notes: 'Met targets consistently' },
])

async function loadEmployee() {
  loading.value = true
  error.value = null
  try {
    await adminStore.fetchEmployees()
    try {
      const allTraining = await getTrainingAssignments()
      trainingRecords.value = allTraining
        .filter((t) => t.employee_id === employeeId.value)
        .map((t) => ({ title: t.title, type: t.type, status: t.status, deadline: t.deadline }))
    } catch {
      // training data unavailable
    }
  } catch (e) {
    error.value = 'Failed to load employee data'
  } finally {
    loading.value = false
  }
  if (employee.value) {
    editForm.value = {
      name: employee.value.name,
      mobile: employee.value.mobile,
      email: employee.value.email || '',
      department: employee.value.department,
      designation: employee.value.designation,
      reporting_captain: employee.value.reporting_captain,
      roles: [...employee.value.roles],
      status: employee.value.status,
    }
  }
}

onMounted(loadEmployee)

function toggleEdit() {
  if (editMode.value) {
    editMode.value = false
    if (employee.value) {
      editForm.value = {
        name: employee.value.name,
        mobile: employee.value.mobile,
        email: employee.value.email || '',
        department: employee.value.department,
        designation: employee.value.designation,
        reporting_captain: employee.value.reporting_captain,
        roles: [...employee.value.roles],
        status: employee.value.status,
      }
      formErrors.value = {}
    }
  } else {
    editMode.value = true
  }
}

function validateForm(): boolean {
  const errors: Record<string, string> = {}
  if (!editForm.value.name.trim()) errors.name = 'Name is required'
  const digits = editForm.value.mobile.replace(/\D/g, '')
  if (!digits) errors.mobile = 'Mobile is required'
  else if (digits.length !== 10) errors.mobile = 'Mobile must be 10 digits'
  if (!editForm.value.department) errors.department = 'Department is required'
  if (editForm.value.roles.length === 0) errors.roles = 'At least one role required'
  formErrors.value = errors
  return Object.keys(errors).length === 0
}

async function saveChanges() {
  if (!validateForm() || !employee.value) return
  saving.value = true
  error.value = null
  try {
    await adminStore.updateEmployee(employee.value.employee_id, {
      ...editForm.value,
      email: editForm.value.email || undefined,
    })
    editMode.value = false
  } catch (e) {
    error.value = 'Failed to save changes'
  } finally {
    saving.value = false
  }
}

function toggleRole(role: Role) {
  const idx = editForm.value.roles.indexOf(role)
  if (idx === -1) editForm.value.roles.push(role)
  else editForm.value.roles.splice(idx, 1)
}

const roleLabels: Record<Role, string> = { doer: 'Doer', captain: 'Captain', admin: 'Admin' }
const roleColors: Record<Role, string> = {
  doer: 'bg-blue-50 text-blue-700',
  captain: 'bg-purple-50 text-purple-700',
  admin: 'bg-amber-50 text-amber-700',
}

const statusColors: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-600',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-600',
  in_progress: 'bg-blue-50 text-blue-700',
  completed: 'bg-emerald-50 text-emerald-700',
}

function formatDateTime(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function requestTransfer() {
  if (!transferTarget.value || !employee.value) return
  saving.value = true
  try {
    await adminStore.updateEmployee(employee.value.employee_id, {
      reporting_captain: transferTarget.value,
    })
    showTransferModal.value = false
    transferTarget.value = ''
    transferReason.value = ''
    store.addToast({ type: 'success', message: 'Transfer submitted for admin approval', duration: 3000 })
  } catch (e) {
    error.value = 'Transfer failed'
  } finally {
    saving.value = false
  }
}

async function offboardEmployee() {
  if (!employee.value || offboardConfirm.value !== employee.value.employee_id) return
  saving.value = true
  try {
    await adminStore.updateEmployee(employee.value.employee_id, { status: 'offboarded' })
    showOffboardModal.value = false
    offboardConfirm.value = ''
    store.addToast({ type: 'success', message: `${employee.value.name} offboarded`, duration: 3000 })
    router.push('/admin/employees')
  } catch (e) {
    error.value = 'Offboarding failed'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="flex flex-col items-center gap-3">
        <div
          class="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"
        />
        <span class="text-sm text-slate-500">Loading employee details...</span>
      </div>
    </div>

    <div
      v-else-if="error"
      class="bg-white rounded-xl border border-red-200 p-12 text-center"
    >
      <ExclamationTriangleIcon class="w-14 h-14 text-red-300 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-slate-700 mb-1">Failed to load employee data</h3>
      <p class="text-sm text-slate-400 mb-4">{{ error }}</p>
      <button
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        @click="loadEmployee"
      >
        Retry
      </button>
    </div>

    <template v-else-if="!employee">
      <div class="text-center py-20">
        <ExclamationTriangleIcon class="w-14 h-14 text-slate-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-slate-700">Employee not found</h3>
        <p class="text-sm text-slate-400 mt-1">No employee matches ID {{ route.params.id }}</p>
        <button
          class="mt-4 text-sm text-blue-600 hover:underline"
          @click="router.push('/admin/employees')"
        >
          Back to Employees
        </button>
      </div>
    </template>

    <template v-else>
      <!-- Top bar -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="flex items-center gap-3">
          <button
            class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            @click="router.push('/admin/employees')"
          >
            <ArrowLeftIcon class="w-5 h-5" />
          </button>
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-slate-900">{{ employee.name }}</h1>
            <p class="text-sm text-slate-500">
              {{ employee.employee_id }} &middot; {{ employee.department }}
            </p>
          </div>
        </div>
        <button
          v-if="!editMode"
          class="inline-flex items-center gap-2 px-4 h-10 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          @click="toggleEdit"
        >
          <PencilSquareIcon class="w-4 h-4" />
          Edit
        </button>
        <div v-else class="flex items-center gap-2">
          <button
            class="px-4 h-10 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            @click="toggleEdit"
          >
            Cancel
          </button>
          <button
            :disabled="saving"
            class="inline-flex items-center gap-2 px-4 h-10 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            @click="saveChanges"
          >
            <CheckIcon v-if="!saving" class="w-4 h-4" />
            <div
              v-else
              class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
            />
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>

      <!-- Employee Detail Card -->
      <div class="bg-white rounded-xl border border-slate-200 p-6">
        <div class="flex flex-col sm:flex-row gap-6">
          <div
            class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-700 shrink-0"
          >
            {{
              employee.name
                .split(' ')
                .map((s) => s[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()
            }}
          </div>
          <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1"
                >Employee ID</label
              >
              <p class="text-sm font-mono text-slate-900">{{ employee.employee_id }}</p>
            </div>

            <!-- Name -->
            <div v-if="editMode">
              <label class="block text-sm font-medium text-slate-700 mb-1"
                >Name <span class="text-red-500">*</span></label
              >
              <input
                v-model="editForm.name"
                class="w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="formErrors.name ? 'border-red-400' : 'border-slate-300'"
              />
              <p v-if="formErrors.name" class="text-xs text-red-500 mt-1">{{ formErrors.name }}</p>
            </div>
            <div v-else>
              <label class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1"
                >Name</label
              >
              <p class="text-sm text-slate-900 font-medium">{{ employee.name }}</p>
            </div>

            <!-- Mobile -->
            <div v-if="editMode">
              <label class="block text-sm font-medium text-slate-700 mb-1"
                >Mobile <span class="text-red-500">*</span></label
              >
              <input
                v-model="editForm.mobile"
                type="tel"
                class="w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="formErrors.mobile ? 'border-red-400' : 'border-slate-300'"
              />
              <p v-if="formErrors.mobile" class="text-xs text-red-500 mt-1">
                {{ formErrors.mobile }}
              </p>
            </div>
            <div v-else>
              <label class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1"
                >Mobile</label
              >
              <p class="text-sm text-slate-900">{{ employee.mobile }}</p>
            </div>

            <!-- Email -->
            <div v-if="editMode">
              <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                v-model="editForm.email"
                type="email"
                class="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div v-else>
              <label class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1"
                >Email</label
              >
              <p class="text-sm text-slate-900">{{ employee.email || '—' }}</p>
            </div>

            <!-- Department -->
            <div v-if="editMode">
              <label class="block text-sm font-medium text-slate-700 mb-1"
                >Department <span class="text-red-500">*</span></label
              >
              <select
                v-model="editForm.department"
                class="w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                :class="formErrors.department ? 'border-red-400' : 'border-slate-300'"
              >
                <option v-for="d in departments" :key="d" :value="d">{{ d }}</option>
              </select>
              <p v-if="formErrors.department" class="text-xs text-red-500 mt-1">
                {{ formErrors.department }}
              </p>
            </div>
            <div v-else>
              <label class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1"
                >Department</label
              >
              <p class="text-sm text-slate-900">{{ employee.department }}</p>
            </div>

            <!-- Designation -->
            <div v-if="editMode">
              <label class="block text-sm font-medium text-slate-700 mb-1">Designation</label>
              <input
                v-model="editForm.designation"
                type="text"
                class="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div v-else>
              <label class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1"
                >Designation</label
              >
              <p class="text-sm text-slate-900">{{ employee.designation || '—' }}</p>
            </div>

            <!-- Reporting Captain -->
            <div v-if="editMode">
              <label class="block text-sm font-medium text-slate-700 mb-1">Reporting Captain</label>
              <select
                v-model="editForm.reporting_captain"
                class="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">None</option>
                <option v-for="c in captains" :key="c.employee_id" :value="c.employee_id">
                  {{ c.name }}
                </option>
              </select>
            </div>
            <div v-else>
              <label class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1"
                >Reporting Captain</label
              >
              <p class="text-sm text-slate-900">{{ employee.reporting_captain || '—' }}</p>
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1"
                >Created On</label
              >
              <p class="text-sm text-slate-900">{{ formatDateTime(employee.created_on) }}</p>
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1"
                >Last Active</label
              >
              <p class="text-sm text-slate-900">{{ formatDateTime(employee.last_active) }}</p>
            </div>

            <!-- Roles -->
            <div v-if="editMode">
              <label class="block text-sm font-medium text-slate-700 mb-1"
                >Role(s) <span class="text-red-500">*</span></label
              >
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="role in roleOptions"
                  :key="role"
                  class="px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors"
                  :class="
                    editForm.roles.includes(role)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-300'
                  "
                  @click="toggleRole(role)"
                >
                  {{ roleLabels[role] }}
                </button>
              </div>
              <p v-if="formErrors.roles" class="text-xs text-red-500 mt-1">
                {{ formErrors.roles }}
              </p>
            </div>
            <div v-else>
              <label class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1"
                >Role(s)</label
              >
              <div class="flex flex-wrap gap-1.5 mt-1">
                <span
                  v-for="role in employee.roles"
                  :key="role"
                  class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="roleColors[role]"
                  >{{ roleLabels[role] }}</span
                >
              </div>
            </div>

            <!-- Status -->
            <div v-if="editMode">
              <label class="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <div class="flex items-center gap-3">
                <button
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  :class="editForm.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'"
                  @click="editForm.status = editForm.status === 'active' ? 'disabled' : 'active'"
                >
                  <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    :class="editForm.status === 'active' ? 'translate-x-6' : 'translate-x-1'"
                  />
                </button>
                <span
                  class="text-sm font-medium"
                  :class="editForm.status === 'active' ? 'text-emerald-600' : 'text-slate-400'"
                  >{{ editForm.status === 'active' ? 'Active' : 'Disabled' }}</span
                >
              </div>
            </div>
            <div v-else>
              <label class="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1"
                >Status</label
              >
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-0.5"
                :class="
                  employee.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                "
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="employee.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'"
                />
                {{ employee.status === 'active' ? 'Active' : 'Disabled' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity Log -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h2 class="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <ClockIcon class="w-4 h-4 text-slate-400" />
          Activity Log
        </h2>
        <div class="space-y-3">
          <div
            v-for="(log, idx) in activityLog"
            :key="idx"
            class="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0"
          >
            <div class="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0" />
            <div class="flex-1 min-w-0">
              <p class="text-sm text-slate-800">{{ log.action }}</p>
              <p class="text-xs text-slate-400">{{ formatDateTime(log.timestamp) }}</p>
            </div>
          </div>
          <OptEmptyState v-if="activityLog.length === 0" type="data" title="No activity recorded" />
        </div>
      </div>

      <!-- Tasks / Attendance / Leave -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Recent Tasks -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h2 class="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <ListBulletIcon class="w-4 h-4 text-slate-400" />
            Recent Tasks
          </h2>
          <div class="space-y-3">
            <div
              v-for="task in recentTasks"
              :key="task.id"
              class="flex items-center justify-between"
            >
              <div class="min-w-0 flex-1">
                <p class="text-sm text-slate-800 truncate">{{ task.title }}</p>
                <p class="text-xs text-slate-400">{{ task.due }}</p>
              </div>
              <span
                class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium ml-2"
                :class="
                  task.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-blue-50 text-blue-700'
                "
              >
                {{ task.status === 'completed' ? 'Done' : 'Active' }}
              </span>
            </div>
            <OptEmptyState v-if="recentTasks.length === 0" type="tasks" title="No tasks assigned" />
          </div>
        </div>

        <!-- Attendance Summary -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h2 class="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <CalendarDaysIcon class="w-4 h-4 text-slate-400" />
            Attendance Summary
          </h2>
          <div class="space-y-3">
            <div v-for="row in attendanceSummary" :key="row.month" class="text-sm">
              <p class="font-medium text-slate-700 mb-1">{{ row.month }}</p>
              <div class="flex flex-wrap gap-2 text-xs">
                <span class="text-emerald-600">{{ row.present }} present</span>
                <span class="text-red-500">{{ row.absent }} absent</span>
                <span class="text-amber-500">{{ row.late }} late</span>
                <span class="text-blue-500">{{ row.leave }} leave</span>
              </div>
            </div>
            <OptEmptyState v-if="attendanceSummary.length === 0" type="attendance" title="No attendance data" />
          </div>
        </div>

        <!-- Leave History -->
        <div class="bg-white rounded-xl border border-slate-200 p-5">
          <h2 class="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <AcademicCapIcon class="w-4 h-4 text-slate-400" />
            Leave History
          </h2>
          <div class="space-y-3">
            <div
              v-for="leave in leaveHistory"
              :key="leave.from"
              class="flex items-center justify-between"
            >
              <div class="min-w-0 flex-1">
                <p class="text-sm text-slate-800 truncate">{{ leave.type }}</p>
                <p class="text-xs text-slate-400">
                  {{ leave.from }} &middot; {{ leave.days }} day(s)
                </p>
              </div>
              <span
                class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium ml-2"
                :class="statusColors[leave.status]"
              >
                {{ leave.status.charAt(0).toUpperCase() + leave.status.slice(1) }}
              </span>
            </div>
            <OptEmptyState v-if="leaveHistory.length === 0" type="leave" title="No leave history" />
          </div>
        </div>
      </div>

      <!-- Training Records -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h2 class="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <AcademicCapIcon class="w-4 h-4 text-slate-400" />
          Training Records
        </h2>
        <div class="space-y-3">
          <div
            v-for="t in trainingRecords"
            :key="t.title"
            class="flex items-center justify-between"
          >
            <div class="min-w-0 flex-1">
              <p class="text-sm text-slate-800 truncate">{{ t.title }}</p>
              <p class="text-xs text-slate-400">{{ t.type }} &middot; Due {{ t.deadline }}</p>
            </div>
            <span
              class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium ml-2"
              :class="statusColors[t.status]"
            >
              {{ t.status.replace('_', ' ') }}
            </span>
          </div>
            <OptEmptyState v-if="trainingRecords.length === 0" type="training" title="No training records" />
        </div>
      </div>

      <!-- Performance Reviews -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h2 class="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <ListBulletIcon class="w-4 h-4 text-slate-400" />
          Performance Reviews
        </h2>
        <div class="space-y-3">
          <div
            v-for="r in performanceReviews"
            :key="r.period"
            class="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0"
          >
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-slate-800">{{ r.period }}</p>
              <p class="text-xs text-slate-500 mt-0.5">{{ r.notes }}</p>
            </div>
            <div class="flex items-center gap-0.5 shrink-0">
              <span
                v-for="i in 5"
                :key="i"
                class="w-2.5 h-2.5 rounded-full"
                :class="i <= r.rating ? 'bg-amber-400' : 'bg-slate-200'"
              />
            </div>
          </div>
            <OptEmptyState v-if="performanceReviews.length === 0" type="data" title="No reviews yet" />
        </div>
      </div>

      <!-- Actions -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h2 class="text-sm font-semibold text-slate-900 mb-4">Actions</h2>
        <div class="flex flex-wrap gap-3">
          <button
            class="inline-flex items-center gap-2 px-4 h-10 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            @click="showTransferModal = true"
          >
            Transfer
          </button>
          <button
            class="inline-flex items-center gap-2 px-4 h-10 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            @click="showOffboardModal = true"
          >
            Offboard
          </button>
        </div>
      </div>

      <!-- Transfer Modal -->
      <Teleport to="body">
        <div
          v-if="showTransferModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          @click.self="showTransferModal = false"
        >
          <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 class="text-lg font-semibold text-slate-900 mb-4">Transfer Employee</h3>
            <p class="text-sm text-slate-500 mb-4">
              Reassign {{ employee?.name }} to a different captain.
            </p>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">New Captain</label>
                <select
                  v-model="transferTarget"
                  class="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select captain...</option>
                  <option v-for="c in captains" :key="c.employee_id" :value="c.employee_id">
                    {{ c.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Reason (optional)</label>
                <input
                  v-model="transferReason"
                  class="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Department restructuring"
                />
              </div>
            </div>
            <div class="flex items-center justify-end gap-3 mt-6">
              <button
                class="px-4 h-10 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                @click="showTransferModal = false"
              >
                Cancel
              </button>
              <button
                :disabled="!transferTarget || saving"
                class="px-4 h-10 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                @click="requestTransfer"
              >
                <template v-if="saving">Processing...</template>
                <template v-else>Confirm Transfer</template>
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Offboard Modal -->
      <Teleport to="body">
        <div
          v-if="showOffboardModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          @click.self="showOffboardModal = false"
        >
          <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 class="text-lg font-semibold text-slate-900 mb-2">Offboard Employee</h3>
            <p class="text-sm text-slate-500 mb-4">
              This will permanently deactivate {{ employee?.name }}. This action cannot be undone.
            </p>
            <p class="text-sm text-slate-700 mb-2">
              Type <strong>{{ employee?.employee_id }}</strong> to confirm:
            </p>
            <input
              v-model="offboardConfirm"
              class="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              :placeholder="employee?.employee_id"
            />
            <div class="flex items-center justify-end gap-3 mt-6">
              <button
                class="px-4 h-10 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                @click="showOffboardModal = false"
              >
                Cancel
              </button>
              <button
                :disabled="offboardConfirm !== employee?.employee_id || saving"
                class="px-4 h-10 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                @click="offboardEmployee"
              >
                <template v-if="saving">Processing...</template>
                <template v-else>Confirm Offboard</template>
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </template>
  </div>
</template>
