<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  PlusIcon,
  PencilSquareIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  ClockIcon,
  ArrowPathIcon,
} from '@heroicons/vue/24/outline'

interface Worklist {
  id: string
  title: string
  assignedTo: string
  frequency: 'daily' | 'weekly' | 'monthly'
  tasksGenerated: number
  linkedSOP: string
  lastGenerated: string
  active: boolean
}

interface WorklistForm {
  title: string
  description: string
  kpi: string
  frequency: 'daily' | 'weekly' | 'monthly'
  assignedTo: string
  sopLink: string
  estimatedEffort: string
  startDate: string
}

const loading = ref(true)
const error = ref<string | null>(null)
const showForm = ref(false)
const editingId = ref<string | null>(null)
const showPreview = ref(false)

const worklists = ref<Worklist[]>([
  {
    id: 'w1',
    title: 'Daily Inspections',
    assignedTo: 'Flight Technicians',
    frequency: 'daily',
    tasksGenerated: 42,
    linkedSOP: 'SOP-101 Pre-flight',
    lastGenerated: '2026-06-03',
    active: true,
  },
  {
    id: 'w2',
    title: 'Fuel Management Log',
    assignedTo: 'Line Technicians',
    frequency: 'daily',
    tasksGenerated: 28,
    linkedSOP: 'SOP-204 Fuel Handling',
    lastGenerated: '2026-06-03',
    active: true,
  },
  {
    id: 'w3',
    title: 'Tool Inventory Audit',
    assignedTo: 'All Technicians',
    frequency: 'weekly',
    tasksGenerated: 15,
    linkedSOP: 'SOP-307 Tool Control',
    lastGenerated: '2026-06-02',
    active: true,
  },
  {
    id: 'w4',
    title: 'Safety Drill Review',
    assignedTo: 'Crew Coordinators',
    frequency: 'monthly',
    tasksGenerated: 4,
    linkedSOP: 'SOP-501 Safety',
    lastGenerated: '2026-06-01',
    active: false,
  },
])

const form = ref<WorklistForm>({
  title: '',
  description: '',
  kpi: '',
  frequency: 'daily',
  assignedTo: '',
  sopLink: '',
  estimatedEffort: '',
  startDate: '',
})

const previewText = computed(() => {
  if (!form.value.title && !form.value.assignedTo) return ''
  return `This will generate a ${form.value.frequency} checklist for "${form.value.title}" assigned to ${form.value.assignedTo || '[unassigned]'} starting ${form.value.startDate || '[no date]'}.`
})

function openCreate() {
  editingId.value = null
  form.value = {
    title: '',
    description: '',
    kpi: '',
    frequency: 'daily',
    assignedTo: '',
    sopLink: '',
    estimatedEffort: '',
    startDate: '',
  }
  showForm.value = true
  showPreview.value = false
}

function openEdit(worklist: Worklist) {
  editingId.value = worklist.id
  form.value = {
    title: worklist.title,
    description: '',
    kpi: '',
    frequency: worklist.frequency,
    assignedTo: worklist.assignedTo,
    sopLink: worklist.linkedSOP,
    estimatedEffort: '',
    startDate: '',
  }
  showForm.value = true
  showPreview.value = false
}

function handleSave() {
  if (editingId.value) {
    const idx = worklists.value.findIndex((w) => w.id === editingId.value)
    if (idx !== -1) {
      worklists.value[idx] = {
        ...worklists.value[idx],
        title: form.value.title,
        assignedTo: form.value.assignedTo,
        frequency: form.value.frequency,
        linkedSOP: form.value.sopLink,
      }
    }
  } else {
    worklists.value.push({
      id: 'w' + Date.now(),
      title: form.value.title,
      assignedTo: form.value.assignedTo,
      frequency: form.value.frequency,
      tasksGenerated: 0,
      linkedSOP: form.value.sopLink,
      lastGenerated: '—',
      active: true,
    })
  }
  showForm.value = false
  editingId.value = null
}

function toggleActive(worklist: Worklist) {
  worklist.active = !worklist.active
}

const frequencyColors: Record<string, string> = {
  daily: 'bg-blue-50 text-blue-700 border-blue-200',
  weekly: 'bg-violet-50 text-violet-700 border-violet-200',
  monthly: 'bg-amber-50 text-amber-700 border-amber-200',
}

async function loadWorklists() {
  loading.value = true
  error.value = null
  try {
    await new Promise((r) => setTimeout(r, 400))
  } catch {
    error.value = 'Failed to load worklists'
  } finally {
    loading.value = false
  }
}

onMounted(loadWorklists)
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
      <div class="flex flex-col items-center gap-3">
        <div
          class="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"
        />
        <span class="text-sm text-slate-500">Loading worklists...</span>
      </div>
    </div>

    <div v-else-if="error" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <ExclamationTriangleIcon class="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p class="text-sm text-red-600 font-medium">{{ error }}</p>
        <button
          class="mt-3 text-sm text-blue-600 hover:underline"
          @click="loadWorklists()"
        >
          Retry
        </button>
      </div>
    </div>

    <div v-else class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">Worklist Management</h1>
          <p class="text-sm text-slate-500">
            {{ worklists.filter((w) => w.active).length }} active worklists
          </p>
        </div>
        <button
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          @click="openCreate"
        >
          <PlusIcon class="w-4 h-4" /> Create Worklist
        </button>
      </div>

      <!-- Worklist Table -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div class="hidden sm:block overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50">
                <th
                  class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Title
                </th>
                <th
                  class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Assigned To
                </th>
                <th
                  class="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Frequency
                </th>
                <th
                  class="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Tasks
                </th>
                <th
                  class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Linked SOP
                </th>
                <th
                  class="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Last Gen
                </th>
                <th
                  class="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Active
                </th>
                <th class="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="wl in worklists" :key="wl.id" class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3 text-sm font-medium text-slate-900">{{ wl.title }}</td>
                <td class="px-4 py-3 text-sm text-slate-600">{{ wl.assignedTo }}</td>
                <td class="px-4 py-3 text-center">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize"
                    :class="frequencyColors[wl.frequency]"
                    >{{ wl.frequency }}</span
                  >
                </td>
                <td class="px-4 py-3 text-center text-sm text-slate-900">
                  {{ wl.tasksGenerated }}
                </td>
                <td class="px-4 py-3 text-sm text-slate-600">{{ wl.linkedSOP }}</td>
                <td class="px-4 py-3 text-center text-sm text-slate-400">{{ wl.lastGenerated }}</td>
                <td class="px-4 py-3 text-center">
                  <button
                    class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                    :class="wl.active ? 'bg-blue-600' : 'bg-slate-300'"
                    @click="toggleActive(wl)"
                  >
                    <span
                      class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                      :class="wl.active ? 'translate-x-[18px]' : 'translate-x-[2px]'"
                    />
                  </button>
                </td>
                <td class="px-4 py-3">
                  <button
                    class="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                    @click="openEdit(wl)"
                  >
                    <PencilSquareIcon class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile cards -->
        <div class="sm:hidden divide-y divide-slate-100">
          <div v-for="wl in worklists" :key="wl.id" class="p-4 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-slate-900">{{ wl.title }}</span>
              <button
                class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                :class="wl.active ? 'bg-blue-600' : 'bg-slate-300'"
                @click="toggleActive(wl)"
              >
                <span
                  class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                  :class="wl.active ? 'translate-x-[18px]' : 'translate-x-[2px]'"
                />
              </button>
            </div>
            <div class="flex items-center gap-3 text-xs text-slate-500">
              <span class="capitalize">{{ wl.frequency }}</span>
              <span>{{ wl.assignedTo }}</span>
              <span>{{ wl.tasksGenerated }} tasks</span>
            </div>
            <button
              class="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
              @click="openEdit(wl)"
            >
              <PencilSquareIcon class="w-3 h-3" /> Edit
            </button>
          </div>
        </div>
      </div>

      <!-- Create/Edit Form Modal -->
      <div
        v-if="showForm"
        class="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-20 px-4 pb-10"
      >
        <div class="fixed inset-0 bg-black/40" @click="showForm = false" />
        <div
          class="relative bg-white rounded-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl p-6 space-y-5"
        >
          <h2 class="text-lg font-bold text-slate-900">
            {{ editingId ? 'Edit Worklist' : 'Create Worklist' }}
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-xs font-medium text-slate-500 mb-1">Title</label>
              <input
                v-model="form.title"
                type="text"
                placeholder="e.g. Daily Inspections"
                class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs font-medium text-slate-500 mb-1">Description</label>
              <textarea
                v-model="form.description"
                rows="2"
                placeholder="Describe the worklist purpose..."
                class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">KPI</label>
              <input
                v-model="form.kpi"
                type="text"
                placeholder="e.g. 100% completion rate"
                class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Frequency</label>
              <div class="relative">
                <select
                  v-model="form.frequency"
                  class="w-full appearance-none px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <ChevronDownIcon
                  class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                />
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Assigned To</label>
              <input
                v-model="form.assignedTo"
                type="text"
                placeholder="e.g. Flight Technicians"
                class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">SOP Link</label>
              <input
                v-model="form.sopLink"
                type="text"
                placeholder="e.g. SOP-101"
                class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Estimated Effort</label>
              <input
                v-model="form.estimatedEffort"
                type="text"
                placeholder="e.g. 30 min"
                class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 mb-1">Start Date</label>
              <input
                v-model="form.startDate"
                type="date"
                class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <!-- Preview toggle -->
          <button
            class="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
            @click="showPreview = !showPreview"
          >
            <DocumentTextIcon class="w-3.5 h-3.5" /> {{ showPreview ? 'Hide' : 'Show' }} preview
          </button>
          <div
            v-if="showPreview && previewText"
            class="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700"
          >
            {{ previewText }}
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              class="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              @click="showForm = false"
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              @click="handleSave"
            >
              {{ editingId ? 'Save Changes' : 'Create Worklist' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
