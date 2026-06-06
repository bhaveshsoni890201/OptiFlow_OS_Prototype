<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ArchiveBoxIcon,
  ChevronUpIcon,
} from '@heroicons/vue/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/vue/24/solid'
import { useWorkflowStore } from '../../stores/workflowStore'
import type { LeaveRequest } from '../../types'
import { usePagination } from '../../composables/usePagination'
import OptPagination from '../../components/common/OptPagination.vue'

const workflowStore = useWorkflowStore()

const loading = ref(true)
const error = ref<string | null>(null)
const activeTab = ref<string>('pending')
const rejectModal = ref<{ id: string; reason: string } | null>(null)
const escalateModal = ref<{ id: string; reason: string } | null>(null)
const approveSuccess = ref<string | null>(null)
const overrideBuddyId = ref('')

const filteredRequests = computed(() => {
  const all = workflowStore.leaveRequests
  if (activeTab.value === 'all') return all
  if (activeTab.value === 'pending') return all.filter((r) => r.status === 'pending')
  if (activeTab.value === 'archived') return all.filter((r) => r.status === 'archived')
  if (activeTab.value === 'escalated') return all.filter((r) => r.status === 'escalated')
  return all.filter((r) => r.status === activeTab.value)
})

const pendingCount = computed(() => workflowStore.leaveRequests.filter((r) => r.status === 'pending').length)

const leaveTypeColors: Record<string, string> = {
  annual: 'bg-blue-50 text-blue-700 border-blue-200',
  sick: 'bg-red-50 text-red-700 border-red-200',
  personal: 'bg-violet-50 text-violet-700 border-violet-200',
  other: 'bg-slate-100 text-slate-700 border-slate-200',
}

const leaveTypeLabels: Record<string, string> = {
  annual: 'Annual',
  sick: 'Sick',
  personal: 'Personal',
  other: 'Other',
}

const {
  paginated: paginatedApprovals,
  totalPages: approvalsTotalPages,
  currentPage: approvalsCurrentPage,
  totalItems: approvalsTotalItems,
  goTo: approvalsGoTo,
} = usePagination(filteredRequests, 20)

watch(filteredRequests, () => approvalsGoTo(1))

const statusColors: Record<string, string> = {
  pending: 'text-amber-600 bg-amber-50',
  approved: 'text-emerald-600 bg-emerald-50',
  rejected: 'text-red-600 bg-red-50',
  escalated: 'text-orange-600 bg-orange-50',
  archived: 'text-slate-400 bg-slate-100',
}

function initials(name: string): string {
  return name.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase()
}

async function handleApprove(request: LeaveRequest) {
  await workflowStore.approveLeave(request.id, overrideBuddyId.value || undefined)
  approveSuccess.value = `Approved — tasks transferred to ${request.buddy_name}`
  overrideBuddyId.value = ''
  setTimeout(() => { approveSuccess.value = null }, 4000)
}

function openReject(id: string) {
  rejectModal.value = { id, reason: '' }
}

async function confirmReject() {
  if (!rejectModal.value) return
  await workflowStore.rejectLeave(rejectModal.value.id, rejectModal.value.reason)
  rejectModal.value = null
}

function openEscalate(id: string) {
  escalateModal.value = { id, reason: '' }
}

async function confirmEscalate() {
  if (!escalateModal.value) return
  await workflowStore.escalateLeave(escalateModal.value.id, escalateModal.value.reason)
  escalateModal.value = null
}

async function handleArchive(id: string) {
  await workflowStore.archiveLeave(id)
}

async function loadApprovals() {
  loading.value = true
  error.value = null
  try {
    await workflowStore.fetchLeaveRequests()
    await workflowStore.checkAutoEscalate()
  } catch {
    error.value = 'Failed to load leave approvals'
  } finally {
    loading.value = false
  }
}

onMounted(loadApprovals)
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
      <div class="flex flex-col items-center gap-3">
        <div
          class="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"
        />
        <span class="text-sm text-slate-500">Loading approvals...</span>
      </div>
    </div>

    <div v-else-if="error" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <ExclamationTriangleIcon class="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p class="text-sm text-red-600 font-medium">{{ error }}</p>
        <button
          class="mt-3 text-sm text-blue-600 hover:underline"
          @click="loadApprovals()"
        >
          Retry
        </button>
      </div>
    </div>

    <div v-else class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">Leave Approvals</h1>
          <p class="text-sm text-slate-500">
            {{ pendingCount }} pending request{{ pendingCount !== 1 ? 's' : '' }}
          </p>
        </div>
      </div>

      <!-- Success toast -->
      <div
        v-if="approveSuccess"
        class="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 font-medium flex items-center gap-2"
      >
        <CheckCircleSolid class="w-4 h-4 text-emerald-500" /> {{ approveSuccess }}
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
        <button
          v-for="tab in ['pending', 'all', 'approved', 'rejected', 'escalated', 'archived']"
          :key="tab"
          class="px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-all"
          :class="
            activeTab === tab
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          "
          @click="activeTab = tab"
        >
          {{ tab }}
          <span v-if="tab === 'pending'" class="ml-1 text-xs text-red-500"
            >({{ pendingCount }})</span
          >
        </button>
      </div>

      <!-- Leave request cards -->
      <div class="space-y-3">
        <div
          v-for="req in paginatedApprovals"
          :key="req.id"
          class="bg-white rounded-xl border p-4 transition-all"
          :class="
            req.status === 'pending'
              ? 'border-slate-200 hover:shadow-md'
              : req.status === 'approved'
                ? 'border-emerald-200 bg-emerald-50/30'
                : req.status === 'rejected'
                  ? 'border-red-200 bg-red-50/30'
                  : req.status === 'escalated'
                    ? 'border-orange-200 bg-orange-50/30'
                    : 'border-slate-200 bg-slate-50/30'
          "
        >
          <div class="flex flex-col sm:flex-row sm:items-start gap-4">
            <!-- Avatar + Info -->
            <div class="flex items-start gap-3 flex-1 min-w-0">
              <div
                class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700 shrink-0"
              >
                {{ initials(req.employee_name) }}
              </div>
              <div class="flex-1 min-w-0 space-y-1">
                <div class="flex items-center gap-2">
                  <p class="text-sm font-semibold text-slate-900">{{ req.employee_name }}</p>
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize"
                    :class="leaveTypeColors[req.leave_type] || leaveTypeColors.other"
                    >{{ leaveTypeLabels[req.leave_type] || req.leave_type }}</span
                  >
                </div>
                <p class="text-sm text-slate-600">
                  <CalendarDaysIcon class="w-3.5 h-3.5 inline mr-1" />
                  {{ req.start_date }} → {{ req.end_date }} ({{ req.total_days }} day{{
                    req.total_days > 1 ? 's' : ''
                  }})
                </p>
                <p class="text-xs text-slate-400">Reason: {{ req.reason }}</p>
                <div class="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span
                    ><UserGroupIcon class="w-3 h-3 inline mr-0.5" /> Buddy: {{ req.buddy_name || 'Unassigned' }}</span
                  >
                </div>
                <p
                  v-if="req.status === 'rejected' && req.rejection_reason"
                  class="text-xs text-red-500 mt-1"
                >
                  Reason: {{ req.rejection_reason }}
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div
              v-if="req.status === 'pending'"
              class="flex sm:flex-col items-center gap-2 shrink-0"
            >
              <div class="flex items-center gap-2">
                <button
                  class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  @click="handleApprove(req)"
                >
                  <CheckCircleIcon class="w-4 h-4" /> Approve
                </button>
                <button
                  class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-200 hover:bg-red-100 transition-colors"
                  @click="openReject(req.id)"
                >
                  <XCircleIcon class="w-4 h-4" /> Reject
                </button>
              </div>
              <div class="flex items-center gap-2">
                <button
                  class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 text-xs font-medium border border-orange-200 hover:bg-orange-100 transition-colors"
                  @click="openEscalate(req.id)"
                >
                  <ChevronUpIcon class="w-3.5 h-3.5" /> Escalate
                </button>
              </div>
              <input
                v-model="overrideBuddyId"
                placeholder="Override buddy ID (optional)"
                class="w-full mt-1 px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div v-else-if="req.status === 'approved'" class="flex flex-col items-end gap-1 shrink-0">
              <span
                class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-medium"
                ><CheckCircleSolid class="w-4 h-4" /> Approved</span
              >
              <button
                class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                @click="handleArchive(req.id)"
              >
                <ArchiveBoxIcon class="w-3.5 h-3.5" /> Archive
              </button>
            </div>
            <div v-else-if="req.status === 'rejected'" class="flex flex-col items-end gap-1 shrink-0">
              <span
                class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-medium"
                ><XCircleIcon class="w-4 h-4" /> Rejected</span
              >
              <button
                class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                @click="handleArchive(req.id)"
              >
                <ArchiveBoxIcon class="w-3.5 h-3.5" /> Archive
              </button>
            </div>
            <div v-else-if="req.status === 'escalated'" class="shrink-0">
              <span
                class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-100 text-orange-700 text-xs font-medium"
                ><ChevronUpIcon class="w-3.5 h-3.5" /> Escalated</span
              >
            </div>
            <div v-else class="shrink-0">
              <span
                class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-xs font-medium"
                ><ArchiveBoxIcon class="w-3.5 h-3.5" /> Archived</span
              >
            </div>
          </div>
        </div>
      </div>

      <OptPagination
        :current-page="approvalsCurrentPage"
        :total-pages="approvalsTotalPages"
        :total-items="approvalsTotalItems"
        :page-size="20"
        @page-change="approvalsCurrentPage = $event"
      />

      <!-- Reject Modal -->
      <div v-if="rejectModal" class="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div class="fixed inset-0 bg-black/40" @click="rejectModal = null" />
        <div
          class="relative bg-white rounded-2xl border border-slate-200 w-full max-w-md p-5 space-y-4 shadow-2xl"
        >
          <h3 class="text-sm font-semibold text-slate-900">Reject Leave Request</h3>
          <textarea
            v-model="rejectModal.reason"
            rows="3"
            placeholder="Reason for rejection..."
            class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
          />
          <div class="flex justify-end gap-2">
            <button
              class="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
              @click="rejectModal = null"
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
              @click="confirmReject"
            >
              Reject
            </button>
          </div>
        </div>
      </div>

      <!-- Escalate Modal -->
      <div v-if="escalateModal" class="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div class="fixed inset-0 bg-black/40" @click="escalateModal = null" />
        <div
          class="relative bg-white rounded-2xl border border-slate-200 w-full max-w-md p-5 space-y-4 shadow-2xl"
        >
          <h3 class="text-sm font-semibold text-slate-900">Escalate Leave Request</h3>
          <p class="text-xs text-slate-500">This will send the request to admin for review.</p>
          <textarea
            v-model="escalateModal.reason"
            rows="3"
            placeholder="Reason for escalation..."
            class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
          />
          <div class="flex justify-end gap-2">
            <button
              class="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
              @click="escalateModal = null"
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700"
              @click="confirmEscalate"
            >
              Escalate
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
