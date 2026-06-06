<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  AcademicCapIcon,
  PlusIcon,
  PencilSquareIcon,
  PlayIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/vue/24/outline'
import { getTrainingAssignments } from '../../services'
import { useAdminStore } from '../../stores/adminStore'
import OptEmptyState from '../../components/common/OptEmptyState.vue'

const adminStore = useAdminStore()

interface TrainingContent {
  id: string
  title: string
  type: 'sop' | 'video' | 'guide'
  description: string
  assigned: number
  completed: number
  deadline: string
  status: 'active' | 'archived'
  created_on: string
}

interface Assignment {
  id: string
  employee: string
  employeeId: string
  title: string
  deadline: string
  status: 'not_started' | 'in_progress' | 'completed'
  completed_on?: string
}

const contents = ref<TrainingContent[]>([])

const assignments = ref<Assignment[]>([])

const loading = ref(true)
const error = ref<string | null>(null)

const searchQuery = ref('')
const filterType = ref('')
const filterStatus = ref('')
const showFilters = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingContent = ref<TrainingContent | null>(null)
const activeTab = ref<'library' | 'analytics' | 'oversight'>('library')

const form = ref({
  title: '',
  type: 'sop' as 'sop' | 'video' | 'guide',
  description: '',
  deadline: '',
})
const formErrors = ref<Record<string, string>>({})

const filteredContents = computed(() => {
  return contents.value.filter((c) => {
    const q = searchQuery.value.toLowerCase()
    if (q && !c.title.toLowerCase().includes(q)) return false
    if (filterType.value && c.type !== filterType.value) return false
    if (filterStatus.value && c.status !== filterStatus.value) return false
    return true
  })
})

const overdueAssignments = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return assignments.value.filter((a) => a.status !== 'completed' && a.deadline < today)
})

const completionRate = computed(() => {
  const total = assignments.value.length
  const done = assignments.value.filter((a) => a.status === 'completed').length
  return total > 0 ? Math.round((done / total) * 100) : 0
})

const notStartedCount = computed(
  () => assignments.value.filter((a) => a.status === 'not_started').length,
)
const inProgressCount = computed(
  () => assignments.value.filter((a) => a.status === 'in_progress').length,
)

function openAdd() {
  form.value = { title: '', type: 'sop', description: '', deadline: '' }
  formErrors.value = {}
  showAddModal.value = true
}

function openEdit(content: TrainingContent) {
  editingContent.value = content
  form.value = {
    title: content.title,
    type: content.type,
    description: content.description,
    deadline: content.deadline,
  }
  formErrors.value = {}
  showEditModal.value = true
}

function validateForm(): boolean {
  const errors: Record<string, string> = {}
  if (!form.value.title.trim()) errors.title = 'Title is required'
  if (!form.value.deadline) errors.deadline = 'Deadline is required'
  formErrors.value = errors
  return Object.keys(errors).length === 0
}

function submitAdd() {
  if (!validateForm()) return
  const year = new Date().getFullYear().toString().slice(2)
  const newId = `SOP-${String(contents.value.length + 1).padStart(3, '0')}`
  contents.value.push({
    id: newId,
    title: form.value.title,
    type: form.value.type,
    description: form.value.description,
    assigned: 0,
    completed: 0,
    deadline: form.value.deadline,
    status: 'active',
    created_on: new Date().toISOString().slice(0, 10),
  })
  showAddModal.value = false
}

function submitEdit() {
  if (!validateForm() || !editingContent.value) return
  const idx = contents.value.findIndex((c) => c.id === editingContent.value!.id)
  if (idx !== -1) {
    contents.value[idx] = {
      ...contents.value[idx],
      title: form.value.title,
      type: form.value.type,
      description: form.value.description,
      deadline: form.value.deadline,
    }
  }
  showEditModal.value = false
  editingContent.value = null
}

function archiveContent(content: TrainingContent) {
  const idx = contents.value.findIndex((c) => c.id === content.id)
  if (idx !== -1) contents.value[idx].status = 'archived'
}

const typeIcons: Record<string, any> = {
  sop: AcademicCapIcon,
  video: PlayIcon,
  guide: AcademicCapIcon,
}
const typeColors: Record<string, string> = {
  sop: 'bg-blue-50 text-blue-700',
  video: 'bg-purple-50 text-purple-700',
  guide: 'bg-amber-50 text-amber-700',
}
const statusColors: Record<string, string> = {
  not_started: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-50 text-blue-700',
  completed: 'bg-emerald-50 text-emerald-700',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

async function loadTrainingData() {
  loading.value = true
  error.value = null
  try {
    await adminStore.fetchEmployees()
    const data = await getTrainingAssignments()
    assignments.value = data.map((a) => ({
      id: a.id,
      employee: adminStore.employees.find((e) => e.employee_id === a.employee_id)?.name || a.employee_id,
      employeeId: a.employee_id,
      title: a.title,
      deadline: a.deadline,
      status: a.status,
      completed_on: a.completed_on,
    }))

    const grouped = new Map<string, { assigned: number; completed: number; deadline: string; type: Assignment['status'] }>()
    for (const a of assignments.value) {
      const g = grouped.get(a.title) || { assigned: 0, completed: 0, deadline: a.deadline, type: 'not_started' as const }
      g.assigned++
      if (a.status === 'completed') g.completed++
      if (a.deadline < g.deadline) g.deadline = a.deadline
      grouped.set(a.title, g)
    }
    contents.value = Array.from(grouped.entries()).map(([title, g], i) => ({
      id: `CONT-${String(i + 1).padStart(3, '0')}`,
      title,
      type: (['sop', 'video', 'guide'] as const)[i % 3],
      description: '',
      assigned: g.assigned,
      completed: g.completed,
      deadline: g.deadline,
      status: 'active' as const,
      created_on: new Date().toISOString().split('T')[0],
    }))
  } catch (e) {
    error.value = 'Failed to load training data'
  } finally {
    loading.value = false
  }
}

onMounted(loadTrainingData)
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
        @click="loadTrainingData"
      >
        Retry
      </button>
    </div>

    <template v-else>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <h1 class="text-xl sm:text-2xl font-bold text-slate-900">Training</h1>
      <button
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        @click="openAdd"
      >
        <PlusIcon class="w-4 h-4" />
        Add Content
      </button>
    </div>

    <!-- Tabs -->
    <div class="border-b border-slate-200">
      <nav class="flex gap-1 -mb-px">
        <button
          class="px-4 py-2.5 text-sm font-medium border-b-2 transition-colors"
          :class="
            activeTab === 'library'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          "
          @click="activeTab = 'library'"
        >
          Library
        </button>
        <button
          class="px-4 py-2.5 text-sm font-medium border-b-2 transition-colors"
          :class="
            activeTab === 'analytics'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          "
          @click="activeTab = 'analytics'"
        >
          Completion Analytics
        </button>
        <button
          class="px-4 py-2.5 text-sm font-medium border-b-2 transition-colors"
          :class="
            activeTab === 'oversight'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          "
          @click="activeTab = 'oversight'"
        >
          Overdue Oversight
        </button>
      </nav>
    </div>

    <!-- Library Tab -->
    <div v-if="activeTab === 'library'" class="space-y-4">
      <div class="bg-white rounded-xl border border-slate-200 p-4">
        <div class="relative">
          <MagnifyingGlassIcon
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search training content..."
            class="w-full pl-9 pr-3 h-10 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div v-if="showFilters" class="flex gap-3 mt-3 pt-3 border-t border-slate-100">
          <select
            v-model="filterType"
            class="h-9 text-sm border border-slate-300 rounded-lg px-3 bg-white"
          >
            <option value="">All Types</option>
            <option value="sop">SOP</option>
            <option value="video">Video</option>
            <option value="guide">Guide</option>
          </select>
          <select
            v-model="filterStatus"
            class="h-9 text-sm border border-slate-300 rounded-lg px-3 bg-white"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <button
          class="mt-2 inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700"
          @click="showFilters = !showFilters"
        >
          <FunnelIcon class="w-3.5 h-3.5" />
          {{ showFilters ? 'Hide filters' : 'Show filters' }}
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="content in filteredContents"
          :key="content.id"
          class="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2">
              <component
                :is="typeIcons[content.type]"
                class="w-4 h-4"
                :class="typeColors[content.type].split(' ')[1]"
              />
              <span
                class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                :class="typeColors[content.type]"
                >{{ content.type.toUpperCase() }}</span
              >
            </div>
            <button
              class="p-1 text-slate-400 hover:text-blue-600 rounded-md"
              @click="openEdit(content)"
            >
              <PencilSquareIcon class="w-4 h-4" />
            </button>
          </div>
          <h3 class="text-sm font-semibold text-slate-900 mb-1 line-clamp-2">
            {{ content.title }}
          </h3>
          <p class="text-xs text-slate-500 mb-3 line-clamp-2">{{ content.description }}</p>
          <p class="text-xs text-slate-400 font-mono mb-3">{{ content.id }}</p>
          <div
            class="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100"
          >
            <span>{{ content.assigned }} assigned</span>
            <span>{{ content.completed }} completed</span>
            <span>Due: {{ formatDate(content.deadline) }}</span>
          </div>
          <div class="mt-2 flex gap-2">
            <button
              class="flex-1 px-2 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              @click="archiveContent(content)"
            >
              Archive
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Analytics Tab -->
    <div v-if="activeTab === 'analytics'" class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <p class="text-2xl font-bold text-slate-900">{{ assignments.length }}</p>
          <p class="text-xs text-slate-500 mt-0.5">Total Assignments</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <p class="text-2xl font-bold text-emerald-600">
            {{ assignments.filter((a) => a.status === 'completed').length }}
          </p>
          <p class="text-xs text-slate-500 mt-0.5">Completed</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <p class="text-2xl font-bold text-blue-600">{{ inProgressCount }}</p>
          <p class="text-xs text-slate-500 mt-0.5">In Progress</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <p class="text-2xl font-bold text-amber-600">{{ notStartedCount }}</p>
          <p class="text-xs text-slate-500 mt-0.5">Not Started</p>
        </div>
      </div>

      <!-- Completion Rate -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h2 class="text-sm font-semibold text-slate-900 mb-3">Org-Wide Completion Rate</h2>
        <div class="flex items-center gap-4">
          <div class="relative w-20 h-20">
            <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#F1F5F9" stroke-width="10" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#16A34A"
                stroke-width="10"
                stroke-linecap="round"
                :stroke-dasharray="2 * Math.PI * 40"
                :stroke-dashoffset="2 * Math.PI * 40 * (1 - completionRate / 100)"
              />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-lg font-bold text-slate-900">{{ completionRate }}%</span>
            </div>
          </div>
          <div class="text-sm text-slate-600">
            <p>
              {{ assignments.filter((a) => a.status === 'completed').length }} of
              {{ assignments.length }} assignments completed
            </p>
            <p class="text-xs text-slate-400 mt-1">
              {{ overdueAssignments.length }} assignments overdue
            </p>
          </div>
        </div>
      </div>

      <!-- Per-Content Breakdown -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h2 class="text-sm font-semibold text-slate-900 mb-3">Per-Content Completion</h2>
        <div class="space-y-3">
          <div v-for="content in contents.filter((c) => c.assigned > 0)" :key="content.id">
            <div class="flex items-center justify-between text-sm mb-1">
              <span class="text-slate-700 truncate">{{ content.title }}</span>
              <span class="text-slate-500 text-xs"
                >{{ content.completed }}/{{ content.assigned }}</span
              >
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2">
              <div
                class="bg-blue-500 h-2 rounded-full transition-all"
                :style="{
                  width: `${content.assigned > 0 ? (content.completed / content.assigned) * 100 : 0}%`,
                }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Oversight Tab -->
    <div v-if="activeTab === 'oversight'" class="space-y-4">
      <OptEmptyState v-if="overdueAssignments.length === 0" type="training" title="All caught up" description="No overdue training assignments" />

      <div v-else class="space-y-3">
        <div class="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <ExclamationTriangleIcon class="w-5 h-5 text-red-500" />
          <p class="text-sm text-red-700 font-medium">
            {{ overdueAssignments.length }} overdue assignment(s) requiring attention
          </p>
        </div>

        <div
          v-for="a in overdueAssignments"
          :key="a.id"
          class="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div class="flex items-start gap-3 min-w-0">
            <div class="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <ExclamationTriangleIcon class="w-4 h-4 text-red-500" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium text-slate-900">{{ a.employee }}</p>
              <p class="text-xs text-slate-500">{{ a.title }}</p>
              <p class="text-xs text-red-500 mt-0.5">Deadline was {{ formatDate(a.deadline) }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
              :class="statusColors[a.status]"
            >
              <ClockIcon class="w-3 h-3" />
              {{ a.status.replace('_', ' ') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Content Modal -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="showAddModal = false"
    >
      <div class="fixed inset-0 bg-black/50" />
      <div
        class="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col"
      >
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 class="text-lg font-semibold text-slate-900">Add Training Content</h2>
          <button
            class="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            @click="showAddModal = false"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
        <div class="px-6 py-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >Title <span class="text-red-500">*</span></label
            >
            <input
              v-model="form.title"
              class="w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="formErrors.title ? 'border-red-400' : 'border-slate-300'"
            />
            <p v-if="formErrors.title" class="text-xs text-red-500 mt-1">{{ formErrors.title }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <select
              v-model="form.type"
              class="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg bg-white"
            >
              <option value="sop">SOP</option>
              <option value="video">Video</option>
              <option value="guide">Guide</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >Deadline <span class="text-red-500">*</span></label
            >
            <input
              v-model="form.deadline"
              type="date"
              class="w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="formErrors.deadline ? 'border-red-400' : 'border-slate-300'"
            />
            <p v-if="formErrors.deadline" class="text-xs text-red-500 mt-1">
              {{ formErrors.deadline }}
            </p>
          </div>
        </div>
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
          <button
            class="px-4 h-10 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            @click="showAddModal = false"
          >
            Cancel
          </button>
          <button
            class="px-4 h-10 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            @click="submitAdd"
          >
            Add Content
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Content Modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="showEditModal = false"
    >
      <div class="fixed inset-0 bg-black/50" />
      <div
        class="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col"
      >
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 class="text-lg font-semibold text-slate-900">Edit Training Content</h2>
          <button
            class="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            @click="showEditModal = false"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
        <div class="px-6 py-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >Title <span class="text-red-500">*</span></label
            >
            <input
              v-model="form.title"
              class="w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="formErrors.title ? 'border-red-400' : 'border-slate-300'"
            />
            <p v-if="formErrors.title" class="text-xs text-red-500 mt-1">{{ formErrors.title }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <select
              v-model="form.type"
              class="w-full h-10 px-3 text-sm border border-slate-300 rounded-lg bg-white"
            >
              <option value="sop">SOP</option>
              <option value="video">Video</option>
              <option value="guide">Guide</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1"
              >Deadline <span class="text-red-500">*</span></label
            >
            <input
              v-model="form.deadline"
              type="date"
              class="w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              :class="formErrors.deadline ? 'border-red-400' : 'border-slate-300'"
            />
            <p v-if="formErrors.deadline" class="text-xs text-red-500 mt-1">
              {{ formErrors.deadline }}
            </p>
          </div>
        </div>
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
          <button
            class="px-4 h-10 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            @click="showEditModal = false"
          >
            Cancel
          </button>
          <button
            class="px-4 h-10 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            @click="submitEdit"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

