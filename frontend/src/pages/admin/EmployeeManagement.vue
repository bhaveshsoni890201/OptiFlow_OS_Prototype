<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  PlusIcon,
  PencilSquareIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'
import type { Employee, Role } from '../../types'
import { useAdminStore } from '../../stores/adminStore'
import { useWorkflowStore } from '../../stores/workflowStore'
import { usePagination } from '../../composables/usePagination'
import { useDebouncedSearch } from '../../composables/useDebouncedSearch'
import OptTable from '../../components/common/OptTable.vue'
import type { Column } from '../../components/common/OptTable.vue'
import OptFilterBar from '../../components/common/OptFilterBar.vue'
import type { FilterConfig } from '../../components/common/OptFilterBar.vue'
import OptModal from '../../components/common/OptModal.vue'

const router = useRouter()
const adminStore = useAdminStore()
const workflowStore = useWorkflowStore()

const employees = computed(() => adminStore.employees)

const captains = computed(() =>
  employees.value.filter((e) => e.roles.includes('captain') || e.roles.includes('admin')),
)

const { immediate: searchInput, debounced: searchQuery, clear: clearSearch } = useDebouncedSearch(300)
const filterDepartment = ref('')
const filterRole = ref('')
const filterStatus = ref('')
const showFilters = ref(false)
const loading = ref(false)
const loadError = ref<string | null>(null)

async function loadEmployees() {
  loading.value = true
  loadError.value = null
  try {
    await adminStore.fetchEmployees()
  } catch (e) {
    loadError.value = 'Failed to load employees'
  } finally {
    loading.value = false
  }
}

onMounted(loadEmployees)
const showAddModal = ref(false)
const showDisableDialog = ref(false)
const disableTarget = ref<Employee | null>(null)
const editEmployee = ref<Employee | null>(null)

const form = ref({
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
const showForm = ref<'add' | 'edit'>('add')

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

const filteredEmployees = computed(() => {
  return employees.value.filter((emp) => {
    const q = searchQuery.value.toLowerCase()
    if (
      q &&
      !emp.name.toLowerCase().includes(q) &&
      !emp.employee_id.toLowerCase().includes(q) &&
      !emp.mobile.includes(q)
    )
      return false
    if (filterDepartment.value && emp.department !== filterDepartment.value) return false
    if (filterRole.value && !emp.roles.includes(filterRole.value as Role)) return false
    if (filterStatus.value && emp.status !== filterStatus.value) return false
    return true
  })
})

const {
  paginated: paginatedEmployees,
  totalPages: empTotalPages,
  currentPage: empCurrentPage,
  totalItems: empTotalItems,
  goTo: empGoTo,
} = usePagination(filteredEmployees, 15)

watch(filteredEmployees, () => empGoTo(1))

const nextId = computed(() => {
  const nums = employees.value
    .map((e) => parseInt(e.employee_id.replace('EMP-', ''), 10))
    .filter((n) => !isNaN(n))
  const max = nums.length ? Math.max(...nums) : 0
  return `EMP-${String(max + 1).padStart(4, '0')}`
})

function openAddModal() {
  showForm.value = 'add'
  form.value = {
    name: '',
    mobile: '',
    email: '',
    department: '',
    designation: '',
    reporting_captain: '',
    roles: [],
    status: 'active',
  }
  formErrors.value = {}
  showAddModal.value = true
}

function openEditModal(emp: Employee) {
  showForm.value = 'edit'
  editEmployee.value = emp
  form.value = {
    name: emp.name,
    mobile: emp.mobile,
    email: emp.email || '',
    department: emp.department,
    designation: emp.designation,
    reporting_captain: emp.reporting_captain,
    roles: [...emp.roles],
    status: emp.status,
  }
  formErrors.value = {}
  showAddModal.value = true
}

function validateForm(): boolean {
  const errors: Record<string, string> = {}
  if (!form.value.name.trim()) errors.name = 'Name is required'
  const digits = form.value.mobile.replace(/\D/g, '')
  if (!digits) errors.mobile = 'Mobile is required'
  else if (digits.length !== 10) errors.mobile = 'Mobile must be 10 digits'
  if (!form.value.department) errors.department = 'Department is required'
  if (form.value.roles.length === 0) errors.roles = 'At least one role required'
  formErrors.value = errors
  return Object.keys(errors).length === 0
}

async function submitForm() {
  if (!validateForm()) return
  if (showForm.value === 'add') {
    await workflowStore.onboardEmployee({
      name: form.value.name,
      department: form.value.department,
      designation: form.value.designation,
      mobile: form.value.mobile,
      reporting_captain: form.value.reporting_captain,
    })
  } else if (editEmployee.value) {
    await adminStore.updateEmployee(editEmployee.value.employee_id, {
      name: form.value.name,
      mobile: form.value.mobile,
      email: form.value.email || undefined,
      department: form.value.department,
      designation: form.value.designation,
      reporting_captain: form.value.reporting_captain,
      roles: form.value.roles,
      status: form.value.status,
    })
  }
  showAddModal.value = false
  editEmployee.value = null
}

function confirmDisable(emp: Employee) {
  disableTarget.value = emp
  showDisableDialog.value = true
}

function executeDisable() {
  if (!disableTarget.value) return
  adminStore.updateEmployee(disableTarget.value.employee_id, { status: 'disabled' })
  showDisableDialog.value = false
  disableTarget.value = null
}

function enableEmployee(emp: Employee) {
  adminStore.updateEmployee(emp.employee_id, { status: 'active' })
}

function viewDetail(emp: Employee) {
  router.push(`/admin/employees/${emp.employee_id}`)
}

function toggleRole(role: Role) {
  const idx = form.value.roles.indexOf(role)
  if (idx === -1) form.value.roles.push(role)
  else form.value.roles.splice(idx, 1)
}

const tableColumns: Column[] = [
  { key: 'employee_id', label: 'Employee ID' },
  { key: 'name', label: 'Name' },
  { key: 'department', label: 'Department' },
  { key: 'designation', label: 'Designation' },
  { key: 'reporting_captain', label: 'Reporting Captain' },
  { key: 'roles', label: 'Role(s)' },
  { key: 'status', label: 'Status' },
  { key: 'last_active', label: 'Last Active', render: (row) => formatDate(row.last_active) },
]

const filterConfig: FilterConfig[] = [
  {
    key: 'search',
    label: 'Search',
    type: 'search',
    placeholder: 'Search by name, ID, or mobile...',
  },
  {
    key: 'department',
    label: 'Department',
    type: 'select',
    options: departments.map((d) => ({ value: d, label: d })),
  },
  {
    key: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { value: 'doer', label: 'Doer' },
      { value: 'captain', label: 'Captain' },
      { value: 'admin', label: 'Admin' },
    ],
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'disabled', label: 'Disabled' },
    ],
  },
]

const filterModel = ref<Record<string, any>>({
  search: '',
  department: '',
  role: '',
  status: '',
})

watch(filterModel, (val) => {
  searchInput.value = val.search || ''
  filterDepartment.value = val.department || ''
  filterRole.value = val.role || ''
  filterStatus.value = val.status || ''
}, { deep: true })

function clearFilters() {
  clearSearch()
  filterDepartment.value = ''
  filterRole.value = ''
  filterStatus.value = ''
  filterModel.value = { search: '', department: '', role: '', status: '' }
}

function formatDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const roleLabels: Record<Role, string> = { doer: 'Doer', captain: 'Captain', admin: 'Admin' }
const roleColors: Record<Role, string> = {
  doer: 'bg-blue-50 text-blue-700',
  captain: 'bg-purple-50 text-purple-700',
  admin: 'bg-amber-50 text-amber-700',
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900">Employee Management</h1>
        <p class="text-sm text-slate-500 mt-0.5">{{ employees.length }} total employees</p>
      </div>
      <button
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        @click="openAddModal"
      >
        <UserPlusIcon class="w-4 h-4" />
        Add Employee
      </button>
    </div>

    <!-- Search & Filters -->
    <OptFilterBar
      :filters="filterConfig"
      v-model="filterModel"
      @reset="clearFilters"
    />

    <!-- Table -->
    <OptTable
      :columns="tableColumns"
      :rows="paginatedEmployees"
      :loading="loading"
      :error="loadError"
      empty-message="No employees yet — add your first"
      :paginated="true"
      :page-size="15"
      :current-page="empCurrentPage"
      :total-items="empTotalItems"
      @row-click="viewDetail"
      @update:current-page="empCurrentPage = $event"
      @retry="loadEmployees"
    >
      <template #empty>
        <button
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          @click="openAddModal"
        >
          <PlusIcon class="w-4 h-4" />
          Add Employee
        </button>
      </template>
      <template #cell-name="{ row }">
        <div class="flex items-center gap-2.5">
          <div
            class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0"
          >
            {{
              row.name
                .split(' ')
                .map((s: string) => s[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()
            }}
          </div>
          <div>
            <p class="font-medium text-slate-900">{{ row.name }}</p>
            <p class="text-xs text-slate-400 sm:hidden">{{ row.department }}</p>
          </div>
        </div>
      </template>
      <template #cell-roles="{ row }">
        <div class="flex flex-wrap gap-1">
          <span
            v-for="role in row.roles"
            :key="role"
            class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
            :class="roleColors[role]"
          >
            {{ roleLabels[role] }}
          </span>
        </div>
      </template>
      <template #cell-status="{ row }">
        <span
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
          :class="
            row.status === 'active'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-slate-100 text-slate-500'
          "
        >
          <span
            class="w-1.5 h-1.5 rounded-full"
            :class="row.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'"
          />
          {{ row.status === 'active' ? 'Active' : 'Disabled' }}
        </span>
      </template>
      <template #actions="{ row }">
        <div class="flex items-center justify-end gap-1">
          <button
            class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Edit"
            @click.stop="openEditModal(row)"
          >
            <PencilSquareIcon class="w-4 h-4" />
          </button>
          <button
            v-if="row.status === 'active'"
            class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Disable"
            @click.stop="confirmDisable(row)"
          >
            <NoSymbolIcon class="w-4 h-4" />
          </button>
          <button
            v-else
            class="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
            title="Enable"
            @click.stop="enableEmployee(row)"
          >
            <CheckCircleIcon class="w-4 h-4" />
          </button>
        </div>
      </template>
    </OptTable>

    <!-- Add/Edit Modal -->
    <OptModal
      :open="showAddModal"
      :title="showForm === 'add' ? 'Add Employee' : 'Edit Employee'"
      size="lg"
      @close="showAddModal = false"
    >
      <div class="space-y-4">
        <!-- Auto ID -->
        <div v-if="showForm === 'add'">
          <label class="block text-sm font-medium text-slate-700 mb-1"
            >Employee ID (auto-generated)</label
          >
          <input
            :value="nextId"
            readonly
            class="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >Name <span class="text-red-500">*</span></label
            >
            <input
              v-model="form.name"
              type="text"
              class="w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="formErrors.name ? 'border-red-400 focus:ring-red-500' : 'border-slate-300'"
            />
            <p v-if="formErrors.name" class="text-xs text-red-500 mt-1">{{ formErrors.name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >Mobile <span class="text-red-500">*</span></label
            >
            <input
              v-model="form.mobile"
              type="tel"
              maxlength="15"
              class="w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="
                formErrors.mobile ? 'border-red-400 focus:ring-red-500' : 'border-slate-300'
              "
            />
            <p v-if="formErrors.mobile" class="text-xs text-red-500 mt-1">
              {{ formErrors.mobile }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              v-model="form.email"
              type="email"
              class="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >Department <span class="text-red-500">*</span></label
            >
            <select
              v-model="form.department"
              class="w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              :class="
                formErrors.department ? 'border-red-400 focus:ring-red-500' : 'border-slate-300'
              "
            >
              <option value="">Select department</option>
              <option v-for="d in departments" :key="d" :value="d">{{ d }}</option>
            </select>
            <p v-if="formErrors.department" class="text-xs text-red-500 mt-1">
              {{ formErrors.department }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Designation</label>
            <input
              v-model="form.designation"
              type="text"
              class="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Reporting Captain</label>
            <select
              v-model="form.reporting_captain"
              class="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">None (Self)</option>
              <option v-for="c in captains" :key="c.employee_id" :value="c.employee_id">
                {{ c.name }} ({{ c.employee_id }})
              </option>
            </select>
          </div>
        </div>

        <!-- Roles -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1"
            >Role(s) <span class="text-red-500">*</span></label
          >
          <div class="flex flex-wrap gap-2">
            <button
              v-for="role in roleOptions"
              :key="role"
              class="px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors"
              :class="
                form.roles.includes(role)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
              "
              @click="toggleRole(role)"
            >
              {{ roleLabels[role] }}
            </button>
          </div>
          <p v-if="formErrors.roles" class="text-xs text-red-500 mt-1">{{ formErrors.roles }}</p>
        </div>

        <!-- Status Toggle -->
        <div class="flex items-center gap-3">
          <span class="text-sm font-medium text-slate-700">Status</span>
          <button
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            :class="form.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'"
            @click="form.status = form.status === 'active' ? 'disabled' : 'active'"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              :class="form.status === 'active' ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
          <span
            class="text-sm"
            :class="form.status === 'active' ? 'text-emerald-600 font-medium' : 'text-slate-400'"
          >
            {{ form.status === 'active' ? 'Active' : 'Disabled' }}
          </span>
        </div>
      </div>
      <template #footer>
        <button
          class="px-4 h-10 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          @click="showAddModal = false"
        >
          Cancel
        </button>
        <button
          class="px-4 h-10 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          @click="submitForm"
        >
          {{ showForm === 'add' ? 'Add Employee' : 'Save Changes' }}
        </button>
      </template>
    </OptModal>

    <!-- Disable Confirmation Dialog -->
    <OptModal
      :open="showDisableDialog"
      variant="confirm"
      title="Disable Employee"
      confirm-label="Disable Employee"
      confirm-danger
      @confirm="executeDisable"
      @close="showDisableDialog = false"
      @cancel="showDisableDialog = false"
    >
      <p class="text-sm text-slate-500 mt-1">
        Are you sure you want to disable <strong>{{ disableTarget?.name }}</strong> ({{
          disableTarget?.employee_id
        }})?
      </p>
      <ul class="mt-3 space-y-1 text-sm text-slate-500">
        <li class="flex items-start gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
          Employee will lose access to the system
        </li>
        <li class="flex items-start gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
          Active tasks will remain but no new assignments
        </li>
        <li class="flex items-start gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
          Historical data will be preserved
        </li>
        <li class="flex items-start gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
          Can be re-enabled at any time
        </li>
      </ul>
    </OptModal>
  </div>
</template>
