<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  PaperAirplaneIcon,
  PlusCircleIcon,
  ChartBarIcon,
  ArrowPathIcon,
  NoSymbolIcon,
} from '@heroicons/vue/24/outline'
import { useAdminStore } from '../../stores/adminStore'
import { useStore } from '../../stores/useStore'
import { formatDateShort } from '../../utils/formatters'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()
const rootStore = useStore()

const loading = ref(true)
const error = ref<string | null>(null)
const transferModal = ref<{ employeeId: string; newCaptainId: string } | null>(null)

const memberId = computed(() => route.params.id as string)

const member = computed(() =>
  (adminStore.employees ?? []).find((e) => e.employee_id === memberId.value) || null,
)

const captains = computed(() =>
  (adminStore.employees ?? []).filter((e) => (e.roles.includes('captain') || e.roles.includes('admin')) && e.employee_id !== memberId.value),
)

const statusColors: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-600 border-slate-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  overdue: 'bg-red-50 text-red-700 border-red-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

function formatDate(iso?: string): string {
  if (!iso) return '—'
  return formatDateShort(iso)
}

function openTransfer() {
  if (!member.value) return
  transferModal.value = { employeeId: member.value.employee_id, newCaptainId: '' }
}

async function confirmTransfer() {
  if (!transferModal.value || !transferModal.value.newCaptainId) return
  await adminStore.updateEmployee(transferModal.value.employeeId, {
    reporting_captain: transferModal.value.newCaptainId,
  })
  const newCaptain = adminStore.employees.find((e) => e.employee_id === transferModal.value.newCaptainId)
  rootStore.addToast({
    type: 'success',
    message: `${member.value?.name} transferred to ${newCaptain?.name || transferModal.value.newCaptainId}`,
    duration: 4000,
  })
  transferModal.value = null
}

async function handleDeactivate() {
  if (!member.value) return
  await adminStore.updateEmployee(member.value.employee_id, { status: 'disabled' })
  rootStore.addToast({
    type: 'warning',
    message: `${member.value.name} has been deactivated`,
    duration: 4000,
  })
}

async function loadMember() {
  loading.value = true
  error.value = null
  try {
    await adminStore.fetchEmployees()
  } catch {
    error.value = 'Failed to load member data'
  } finally {
    loading.value = false
  }
}

onMounted(loadMember)
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
      <div class="flex flex-col items-center gap-3">
        <div class="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
        <span class="text-sm text-slate-500">Loading member...</span>
      </div>
    </div>

    <div v-else-if="error" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <ExclamationTriangleIcon class="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p class="text-sm text-red-600 font-medium">{{ error }}</p>
        <button class="mt-3 text-sm text-blue-600 hover:underline" @click="loadMember()">Retry</button>
      </div>
    </div>

    <div v-else-if="!member" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <ExclamationTriangleIcon class="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p class="text-sm text-slate-500">Member not found</p>
        <button class="mt-3 text-sm text-blue-600 hover:underline" @click="router.push('/captain/team')">Back to Team</button>
      </div>
    </div>

    <div v-else class="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-5">
      <!-- Back -->
      <button
        class="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
        @click="router.push('/captain/team')"
      >
        <ArrowLeftIcon class="w-4 h-4" /> Back to Team Roster
      </button>

      <!-- Profile Summary -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div
            class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-700 shrink-0"
          >
            {{ member.name.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase() }}
          </div>
          <div class="flex-1 text-center sm:text-left">
            <h1 class="text-xl font-bold text-slate-900">{{ member.name }}</h1>
            <p class="text-sm text-slate-500">
              {{ member.designation }} &middot; {{ member.department }}
            </p>
            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-xs text-slate-400">
              <span class="inline-flex items-center gap-1">
                <CalendarDaysIcon class="w-3.5 h-3.5" /> Joined {{ formatDate(member.created_on) }}
              </span>
              <span class="inline-flex items-center gap-1">
                <EnvelopeIcon class="w-3.5 h-3.5" /> {{ member.email || '—' }}
              </span>
              <span class="inline-flex items-center gap-1">
                ID: {{ member.employee_id }}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
              :class="member.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="member.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'" />
              {{ member.status === 'active' ? 'Active' : 'Disabled' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Captain Actions -->
      <div class="bg-white rounded-xl border border-slate-200 p-5">
        <h2 class="text-sm font-semibold text-slate-900 mb-4">Captain Actions</h2>
        <div class="flex flex-wrap gap-2">
          <button
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200 hover:bg-blue-100 transition-colors"
            @click="router.push('/captain/worklists')"
          >
            <PlusCircleIcon class="w-4 h-4" /> Assign Worklist
          </button>
          <button
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-50 text-violet-700 text-sm font-medium border border-violet-200 hover:bg-violet-100 transition-colors"
            @click="router.push('/captain/training')"
          >
            <AcademicCapIcon class="w-4 h-4" /> Assign Training
          </button>
          <button
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium border border-amber-200 hover:bg-amber-100 transition-colors"
          >
            <PaperAirplaneIcon class="w-4 h-4" /> Send Reminder
          </button>
          <button
            v-if="member.status === 'active'"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium border border-indigo-200 hover:bg-indigo-100 transition-colors"
            @click="openTransfer"
          >
            <ArrowPathIcon class="w-4 h-4" /> Transfer
          </button>
          <button
            v-if="member.status === 'active'"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-50 text-red-700 text-sm font-medium border border-red-200 hover:bg-red-100 transition-colors"
            @click="handleDeactivate"
          >
            <NoSymbolIcon class="w-4 h-4" /> Deactivate
          </button>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <p class="text-lg font-bold text-slate-900">{{ member.roles.join(', ') }}</p>
          <p class="text-xs text-slate-500">Role(s)</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <p class="text-lg font-bold text-slate-900">{{ member.department }}</p>
          <p class="text-xs text-slate-500">Department</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <p class="text-lg font-bold text-blue-600">{{ member.reporting_captain || '—' }}</p>
          <p class="text-xs text-slate-500">Reports To</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <p class="text-lg font-bold text-emerald-600">{{ member.status }}</p>
          <p class="text-xs text-slate-500">Status</p>
        </div>
      </div>
    </div>

    <!-- Transfer Modal -->
    <div v-if="transferModal" class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div class="fixed inset-0 bg-black/40" @click="transferModal = null" />
      <div class="relative bg-white rounded-2xl border border-slate-200 w-full max-w-md p-5 space-y-4 shadow-2xl">
        <h3 class="text-sm font-semibold text-slate-900">Transfer Member</h3>
        <p class="text-xs text-slate-500">Select a new captain for {{ member?.name }}.</p>
        <select
          v-model="transferModal.newCaptainId"
          class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
        >
          <option value="" disabled>Select captain...</option>
          <option v-for="c in captains" :key="c.employee_id" :value="c.employee_id">{{ c.name }} ({{ c.employee_id }})</option>
        </select>
        <div class="flex justify-end gap-2">
          <button class="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50" @click="transferModal = null">Cancel</button>
          <button class="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700" @click="confirmTransfer">Transfer</button>
        </div>
      </div>
    </div>
  </div>
</template>