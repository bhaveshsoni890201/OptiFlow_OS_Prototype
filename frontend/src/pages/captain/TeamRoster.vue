<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'
import { useAdminStore } from '../../stores/adminStore'
import type { Employee } from '../../types'
import OptEmptyState from '../../components/common/OptEmptyState.vue'

interface TeamMemberDisplay {
  id: string
  name: string
  initials: string
  designation: string
  department: string
  status: 'active' | 'inactive'
  activeTasks: number
  delays: number
  trainingCompletion: number
}

const router = useRouter()
const adminStore = useAdminStore()

const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const statusFilter = ref<string>('all')

const members = ref<TeamMemberDisplay[]>([])

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  active: {
    label: 'Active',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  inactive: { label: 'Inactive', color: 'text-red-700 bg-red-50 border-red-200', dot: 'bg-red-500' },
}

const filteredMembers = computed(() => {
  let result = members.value
  if (statusFilter.value !== 'all') {
    result = result.filter((m) => m.status === statusFilter.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(
      (m) => m.name.toLowerCase().includes(q) || m.designation.toLowerCase().includes(q) || m.department.toLowerCase().includes(q),
    )
  }
  return result
})

const totalActiveTasks = computed(() => members.value.reduce((s, m) => s + m.activeTasks, 0))
const totalDelays = computed(() => members.value.reduce((s, m) => s + m.delays, 0))

function buildMembers(employees: Employee[]): TeamMemberDisplay[] {
  return employees.filter((e) => e.roles.includes('doer')).map((e) => {
    const nameParts = e.name.split(' ')
    const initials = nameParts.map((s) => s[0]).join('').slice(0, 2).toUpperCase()
    return {
      id: e.employee_id,
      name: e.name,
      initials,
      designation: e.designation,
      department: e.department,
      status: e.status,
      activeTasks: 0,
      delays: 0,
      trainingCompletion: 0,
    }
  })
}

async function loadRoster() {
  loading.value = true
  error.value = null
  try {
    await adminStore.fetchEmployees()
    members.value = buildMembers(adminStore.employees)
  } catch {
    error.value = 'Failed to load team roster'
  } finally {
    loading.value = false
  }
}

onMounted(loadRoster)
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
      <div class="flex flex-col items-center gap-3">
        <div
          class="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"
        />
        <span class="text-sm text-slate-500">Loading team...</span>
      </div>
    </div>

    <div v-else-if="error" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <ExclamationTriangleIcon class="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p class="text-sm text-red-600 font-medium">{{ error }}</p>
        <button
          class="mt-3 text-sm text-blue-600 hover:underline"
          @click="loadRoster()"
        >
          Retry
        </button>
      </div>
    </div>

    <div v-else class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">Team Roster</h1>
          <p class="text-sm text-slate-500">
            {{ members.length }} members &middot; {{ totalActiveTasks }} active tasks &middot;
            {{ totalDelays }} delays
          </p>
        </div>
      </div>

      <!-- Stats mini bar -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <p class="text-2xl font-bold text-emerald-600">{{ members.length }}</p>
          <p class="text-xs text-slate-500">Total Members</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <p class="text-2xl font-bold text-amber-600">{{ members.filter((m) => m.status === 'active').length }}</p>
          <p class="text-xs text-slate-500">Active</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <p class="text-2xl font-bold text-red-600">{{ members.filter((m) => m.status === 'inactive').length }}</p>
          <p class="text-xs text-slate-500">Inactive</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <p class="text-2xl font-bold text-blue-600">{{ totalActiveTasks }}</p>
          <p class="text-xs text-slate-500">Active Tasks</p>
        </div>
      </div>

      <!-- Search & Filter -->
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <MagnifyingGlassIcon
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name or designation..."
            class="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <select
          v-model="statusFilter"
          class="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <!-- Table (desktop) -->
      <div class="hidden sm:block bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-100 bg-slate-50">
              <th
                class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Member
              </th>
              <th
                class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Designation
              </th>
              <th
                class="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                class="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Tasks
              </th>
              <th
                class="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Delays
              </th>
              <th
                class="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Training
              </th>
              <th
                class="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Department
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="member in filteredMembers"
              :key="member.id"
              class="hover:bg-slate-50 transition-colors cursor-pointer"
              @click="router.push('/captain/team/' + member.id)"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div
                    class="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700"
                  >
                    {{ member.initials }}
                  </div>
                  <span class="text-sm font-medium text-slate-900">{{ member.name }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-slate-600">{{ member.designation }}</td>
              <td class="px-4 py-3 text-center">
                <span
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
                  :class="statusConfig[member.status]?.color || 'bg-slate-100 text-slate-700 border-slate-200'"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="statusConfig[member.status]?.dot || 'bg-slate-400'"
                  />
                  {{ statusConfig[member.status]?.label || member.status }}
                </span>
              </td>
              <td
                class="px-4 py-3 text-center text-sm font-medium"
                :class="member.activeTasks > 5 ? 'text-red-600' : 'text-slate-900'"
              >
                {{ member.activeTasks }}
              </td>
              <td
                class="px-4 py-3 text-center text-sm font-medium"
                :class="member.delays > 0 ? 'text-red-600' : 'text-slate-400'"
              >
                {{ member.delays }}
              </td>
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-2">
                  <div class="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all"
                      :class="
                        member.trainingCompletion >= 80
                          ? 'bg-emerald-500'
                          : member.trainingCompletion >= 50
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                      "
                      :style="{ width: member.trainingCompletion + '%' }"
                    />
                  </div>
                  <span
                    class="text-xs font-medium"
                    :class="member.trainingCompletion >= 80 ? 'text-emerald-600' : 'text-amber-600'"
                    >{{ member.trainingCompletion }}%</span
                  >
                </div>
              </td>
              <td class="px-4 py-3 text-right text-sm text-slate-400">{{ member.department }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Cards (mobile) -->
      <div class="sm:hidden space-y-3">
        <div
          v-for="member in filteredMembers"
          :key="member.id"
          class="bg-white rounded-xl border border-slate-200 p-4 space-y-3"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700"
              >
                {{ member.initials }}
              </div>
              <div>
                <p class="text-sm font-medium text-slate-900">{{ member.name }}</p>
                <p class="text-xs text-slate-400">{{ member.designation }}</p>
              </div>
            </div>
            <span
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
              :class="statusConfig[member.status]?.color || 'bg-slate-100 text-slate-700 border-slate-200'"
            >
              <span
                class="w-1.5 h-1.5 rounded-full"
                :class="statusConfig[member.status]?.dot || 'bg-slate-400'"
              />
              {{ statusConfig[member.status]?.label || member.status }}
            </span>
          </div>
          <div class="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span class="font-medium text-slate-900">{{ member.activeTasks }}</span>
              <span class="text-slate-400">tasks</span>
            </div>
            <div>
              <span
                class="font-medium"
                :class="member.delays > 0 ? 'text-red-600' : 'text-slate-400'"
                >{{ member.delays }}</span
              >
              <span class="text-slate-400">delays</span>
            </div>
            <div>
              <span
                class="font-medium"
                :class="member.trainingCompletion >= 80 ? 'text-emerald-600' : 'text-amber-600'"
                >{{ member.trainingCompletion }}%</span
              >
              <span class="text-slate-400">trained</span>
            </div>
          </div>
        </div>
      </div>

      <OptEmptyState v-if="filteredMembers.length === 0" type="team" title="No members match your filters" />
    </div>
  </div>
</template>
