<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
} from '@heroicons/vue/24/outline'
import { getDepartments, createDepartment, updateDepartment } from '../../services'
import { useAdminStore } from '../../stores/adminStore'

const adminStore = useAdminStore()

interface Department {
  id: string
  name: string
  head: string
  headId: string
  description: string
  parent: string
  employeeCount: number
  status: 'active' | 'disabled'
}

const departments = ref<Department[]>([])

const employees = computed(() =>
  adminStore.employees.map((e) => ({ id: e.employee_id, name: e.name })),
)

const searchQuery = ref('')
const loading = ref(true)
const error = ref<string | null>(null)
const showModal = ref(false)
const editing = ref(false)
const editingDept = ref<Department | null>(null)
const showDeleteDialog = ref(false)
const deleteTarget = ref<Department | null>(null)

const form = ref({
  name: '',
  description: '',
  head: '',
  parent: '',
  status: 'active' as 'active' | 'disabled',
})
const formErrors = ref<Record<string, string>>({})

const filteredDepartments = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return departments.value.filter((d) => {
    if (q && !d.name.toLowerCase().includes(q) && !d.head.toLowerCase().includes(q)) return false
    return true
  })
})

function openAdd() {
  editing.value = false
  editingDept.value = null
  form.value = { name: '', description: '', head: '', parent: '', status: 'active' }
  formErrors.value = {}
  showModal.value = true
}

function openEdit(dept: Department) {
  editing.value = true
  editingDept.value = dept
  form.value = {
    name: dept.name,
    description: dept.description,
    head: dept.headId,
    parent: dept.parent,
    status: dept.status,
  }
  formErrors.value = {}
  showModal.value = true
}

function validate(): boolean {
  const errors: Record<string, string> = {}
  if (!form.value.name.trim()) errors.name = 'Department name is required'
  formErrors.value = errors
  return Object.keys(errors).length === 0
}

async function submit() {
  if (!validate()) return
  if (editing.value && editingDept.value) {
    const headEmp = employees.value.find((e) => e.id === form.value.head)
    const deptData: Partial<Department> = {
      name: form.value.name,
      description: form.value.description,
      head: headEmp?.name || '',
      headId: form.value.head,
      parent: form.value.parent,
      status: form.value.status,
    }
    await updateDepartment(editingDept.value.id, deptData)
    const idx = departments.value.findIndex((d) => d.id === editingDept.value!.id)
    if (idx !== -1) Object.assign(departments.value[idx], deptData)
  } else {
    const newId = `DEPT-${String(departments.value.length + 1).padStart(3, '0')}`
    const headEmp = employees.value.find((e) => e.id === form.value.head)
    const dept: Department = {
      id: newId,
      name: form.value.name,
      description: form.value.description,
      head: headEmp?.name || '',
      headId: form.value.head,
      parent: form.value.parent,
      employeeCount: 0,
      status: form.value.status,
    }
    await createDepartment(dept)
    departments.value.push(dept)
  }
  showModal.value = false
}

function confirmDelete(dept: Department) {
  deleteTarget.value = dept
  showDeleteDialog.value = true
}

function executeDelete() {
  if (!deleteTarget.value) return
  if (deleteTarget.value.employeeCount > 0) return
  departments.value = departments.value.filter((d) => d.id !== deleteTarget.value!.id)
  showDeleteDialog.value = false
  deleteTarget.value = null
}

function toggleStatus(dept: Department) {
  const idx = departments.value.findIndex((d) => d.id === dept.id)
  if (idx !== -1) {
    departments.value[idx].status =
      departments.value[idx].status === 'active' ? 'disabled' : 'active'
    updateDepartment(dept.id, { status: departments.value[idx].status })
  }
}

async function loadDepartments() {
  loading.value = true
  error.value = null
  try {
    await Promise.all([
      adminStore.fetchEmployees(),
      (async () => {
        const data = await getDepartments()
        departments.value = data.map((d) => ({
          id: d.id,
          name: d.name,
          head: d.head || '',
          headId: '',
          description: '',
          parent: '',
          employeeCount: d.employeeCount,
          status: 'active' as const,
        }))
      })(),
    ])
  } catch (e) {
    error.value = 'Failed to load departments'
  } finally {
    loading.value = false
  }
}

onMounted(loadDepartments)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900">Department Management</h1>
        <p class="text-sm text-slate-500 mt-0.5">{{ departments.length }} departments</p>
      </div>
      <button
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        @click="openAdd"
      >
        <PlusIcon class="w-4 h-4" />
        Add Department
      </button>
    </div>

    <!-- Search -->
    <div class="bg-white rounded-xl border border-slate-200 p-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search departments..."
        class="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
      <span class="text-sm text-red-600">{{ error }}</span>
      <button
        class="text-sm font-medium text-red-700 hover:text-red-800 underline"
        @click="loadDepartments"
      >
        Retry
      </button>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
    </div>

    <div
      v-else-if="!error && filteredDepartments.length === 0"
      class="bg-white rounded-xl border border-slate-200 p-12 text-center"
    >
      <BuildingOfficeIcon class="w-14 h-14 text-slate-300 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-slate-700 mb-1">No departments found</h3>
      <p class="text-sm text-slate-400 mb-4">Create your first department to organize employees.</p>
      <button
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        @click="openAdd"
      >
        <PlusIcon class="w-4 h-4" />
        Add Department
      </button>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="dept in filteredDepartments"
        :key="dept.id"
        class="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
        :class="dept.status === 'disabled' ? 'opacity-60' : ''"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="text-base font-semibold text-slate-900">{{ dept.name }}</h3>
            <p class="text-xs text-slate-400 mt-0.5">{{ dept.id }}</p>
          </div>
          <div class="flex items-center gap-1">
            <button
              class="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Edit"
              @click="openEdit(dept)"
            >
              <PencilSquareIcon class="w-4 h-4" />
            </button>
            <button
              v-if="dept.employeeCount === 0"
              class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete"
              @click="confirmDelete(dept)"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </div>

        <p v-if="dept.description" class="text-sm text-slate-500 mb-3 line-clamp-2">
          {{ dept.description }}
        </p>

        <div class="space-y-2 text-sm">
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Head</span>
            <span class="font-medium text-slate-700">{{ dept.head || '—' }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Employees</span>
            <span class="font-medium text-slate-700">{{ dept.employeeCount }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Parent</span>
            <span class="font-medium text-slate-700">{{ dept.parent || '—' }}</span>
          </div>
          <div class="flex items-center justify-between pt-2 border-t border-slate-100">
            <span class="text-slate-500">Status</span>
            <button
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
              :class="
                dept.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              "
              @click="toggleStatus(dept)"
            >
              <span
                class="w-1.5 h-1.5 rounded-full"
                :class="dept.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'"
              />
              {{ dept.status === 'active' ? 'Active' : 'Disabled' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="showModal = false"
    >
      <div class="fixed inset-0 bg-black/50" />
      <div
        class="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col"
      >
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 class="text-lg font-semibold text-slate-900">
            {{ editing ? 'Edit Department' : 'Add Department' }}
          </h2>
          <button
            class="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            @click="showModal = false"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
        <div class="px-6 py-4 overflow-y-auto flex-1 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >Name <span class="text-red-500">*</span></label
            >
            <input
              v-model="form.name"
              type="text"
              class="w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="formErrors.name ? 'border-red-400' : 'border-slate-300'"
            />
            <p v-if="formErrors.name" class="text-xs text-red-500 mt-1">{{ formErrors.name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Department Head</label>
            <select
              v-model="form.head"
              class="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Not assigned</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Parent Department</label>
            <select
              v-model="form.parent"
              class="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">None (Top level)</option>
              <option
                v-for="d in departments.filter((x) => x.id !== editingDept?.id)"
                :key="d.id"
                :value="d.name"
              >
                {{ d.name }}
              </option>
            </select>
          </div>
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
              class="text-sm font-medium"
              :class="form.status === 'active' ? 'text-emerald-600' : 'text-slate-400'"
              >{{ form.status === 'active' ? 'Active' : 'Disabled' }}</span
            >
          </div>
        </div>
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
          <button
            class="px-4 h-10 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            @click="showModal = false"
          >
            Cancel
          </button>
          <button
            class="px-4 h-10 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            @click="submit"
          >
            {{ editing ? 'Save Changes' : 'Add Department' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Dialog -->
    <div
      v-if="showDeleteDialog"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="showDeleteDialog = false"
    >
      <div class="fixed inset-0 bg-black/50" />
      <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <ExclamationTriangleIcon class="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-slate-900">Delete Department</h3>
            <p class="text-sm text-slate-500 mt-1">
              Are you sure you want to delete <strong>{{ deleteTarget?.name }}</strong
              >?
            </p>
            <div
              v-if="deleteTarget && deleteTarget.employeeCount > 0"
              class="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg"
            >
              <p class="text-sm text-amber-700 font-medium">
                Cannot delete. Reassign {{ deleteTarget.employeeCount }} employee(s) first.
              </p>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
          <button
            class="px-4 h-10 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            @click="showDeleteDialog = false"
          >
            Cancel
          </button>
          <button
            v-if="deleteTarget && deleteTarget.employeeCount === 0"
            class="px-4 h-10 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            @click="executeDelete"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

