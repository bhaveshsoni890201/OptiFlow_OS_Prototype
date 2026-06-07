<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  TicketIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  PaperClipIcon,
  ShieldExclamationIcon,
  ChevronDownIcon,
  XCircleIcon,
  UserCircleIcon,
} from '@heroicons/vue/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/vue/24/solid'
import { useDebouncedSearch } from '../../composables/useDebouncedSearch'
import { useTicketStore } from '../../stores/ticketStore'
import { useAdminStore } from '../../stores/adminStore'
import { useStore } from '../../stores/useStore'
import type { HelpTicket } from '../../types'
import { usePagination } from '../../composables/usePagination'
import OptPagination from '../../components/common/OptPagination.vue'
import OptEmptyState from '../../components/common/OptEmptyState.vue'
import { formatDateShort, formatDateTime } from '../../utils/formatters'

const ticketStore = useTicketStore()
const adminStore = useAdminStore()
const rootStore = useStore()

const loading = ref(true)
const error = ref<string | null>(null)
const statusFilter = ref<string>('open')
const categoryFilter = ref<string>('all')
const { immediate: employeeInput, debounced: employeeSearch, clear: clearSearch } = useDebouncedSearch(300)
const expandedTicket = ref<string | null>(null)
const newCommentText = ref('')
const selectedCategory = ref<string>('all')

const closeModal = ref<{ ticket: HelpTicket; notes: string } | null>(null)
const assignModal = ref<{ ticket: HelpTicket; assignee: string } | null>(null)
const escalateModal = ref<{ ticket: HelpTicket; reason: string } | null>(null)

const categoryColors: Record<string, string> = {
  ops: 'bg-slate-100 text-slate-700 border-slate-200',
  safety: 'bg-amber-50 text-amber-700 border-amber-200',
  maintenance: 'bg-blue-50 text-blue-700 border-blue-200',
  hr: 'bg-violet-50 text-violet-700 border-violet-200',
  other: 'bg-slate-100 text-slate-700 border-slate-200',
}

const statusColors: Record<string, string> = {
  open: 'text-red-600 bg-red-50',
  in_review: 'text-blue-600 bg-blue-50',
  escalated: 'text-amber-600 bg-amber-50',
  resolved: 'text-emerald-600 bg-emerald-50',
  closed: 'text-slate-400 bg-slate-50',
}

const priorityColors: Record<string, string> = {
  low: 'text-slate-400',
  medium: 'text-amber-600',
  high: 'text-orange-600',
  critical: 'text-red-600',
}

const filteredTickets = computed(() => {
  let result = ticketStore.tickets
  if (statusFilter.value !== 'all') {
    result = result.filter((t) => t.status === statusFilter.value)
  }
  if (categoryFilter.value !== 'all') {
    result = result.filter((t) => t.category === categoryFilter.value)
  }
  if (employeeSearch.value.trim()) {
    const q = employeeSearch.value.toLowerCase()
    const employees = adminStore.employees
    result = result.filter((t) => {
      const emp = employees.find((e) => e.employee_id === t.raised_by)
      const name = emp?.name.toLowerCase() || ''
      return t.subject.toLowerCase().includes(q) || name.includes(q) || t.id.toLowerCase().includes(q)
    })
  }
  return result
})

const {
  paginated: paginatedTickets,
  totalPages: ticketsTotalPages,
  currentPage: ticketsCurrentPage,
  totalItems: ticketsTotalItems,
  goTo: ticketsGoTo,
} = usePagination(filteredTickets, 20)

watch(filteredTickets, () => ticketsGoTo(1))

const openCount = computed(() => ticketStore.tickets.filter((t) => t.status === 'open').length)
const doerOptions = computed(() => adminStore.employees.filter((e) => e.roles.includes('doer') && e.status === 'active'))

function getEmployeeName(employeeId: string): string {
  const emp = adminStore.employees.find((e) => e.employee_id === employeeId)
  return emp?.name || employeeId
}

function getEmployeeInitials(employeeId: string): string {
  const name = getEmployeeName(employeeId)
  return name.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase()
}

function toggleExpand(id: string) {
  expandedTicket.value = expandedTicket.value === id ? null : id
}

function handleAddComment(ticket: HelpTicket) {
  if (!newCommentText.value.trim()) return
  const captain = adminStore.employees.find((e) => e.employee_id === rootStore.user?.employee?.employee_id)
  const captainName = captain?.name || 'Captain'
  ticketStore.addComment(ticket.id, captainName, newCommentText.value.trim())
  newCommentText.value = ''
}

function openCloseModal(ticket: HelpTicket) {
  closeModal.value = { ticket, notes: '' }
}

function confirmClose() {
  if (!closeModal.value) return
  ticketStore.resolveTicket(closeModal.value.ticket.id, closeModal.value.notes)
  rootStore.addToast({ type: 'success', message: 'Ticket resolved — pending admin review', duration: 3000 })
  closeModal.value = null
}

function handleReopen(ticket: HelpTicket) {
  ticketStore.reopenTicket(ticket.id)
  rootStore.addToast({ type: 'info', message: 'Ticket reopened', duration: 3000 })
}

function openAssignModal(ticket: HelpTicket) {
  assignModal.value = { ticket, assignee: '' }
}

function confirmAssign() {
  if (!assignModal.value || !assignModal.value.assignee) return
  ticketStore.assignTicket(assignModal.value.ticket.id, assignModal.value.assignee)
  rootStore.addToast({ type: 'success', message: 'Ticket assigned for review', duration: 3000 })
  assignModal.value = null
}

function openEscalateModal(ticket: HelpTicket) {
  escalateModal.value = { ticket, reason: '' }
}

function confirmEscalate() {
  if (!escalateModal.value || !escalateModal.value.reason) return
  ticketStore.escalateTicket(escalateModal.value.ticket.id, escalateModal.value.reason)
  rootStore.addToast({ type: 'warning', message: 'Ticket escalated to admin', duration: 3000 })
  escalateModal.value = null
}

async function loadTickets() {
  loading.value = true
  error.value = null
  try {
    await Promise.all([
      ticketStore.fetchTickets(),
      adminStore.fetchEmployees(),
    ])
  } catch {
    error.value = 'Failed to load tickets'
  } finally {
    loading.value = false
  }
}

onMounted(loadTickets)
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
      <div class="flex flex-col items-center gap-3">
        <div
          class="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"
        />
        <span class="text-sm text-slate-500">Loading tickets...</span>
      </div>
    </div>

    <div v-else-if="error" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <ExclamationTriangleIcon class="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p class="text-sm text-red-600 font-medium">{{ error }}</p>
        <button
          class="mt-3 text-sm text-blue-600 hover:underline"
          @click="loadTickets()"
        >
          Retry
        </button>
      </div>
    </div>

    <div v-else class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">Tickets</h1>
          <p class="text-sm text-slate-500">
            {{ openCount }} open ticket{{ openCount !== 1 ? 's' : '' }}
          </p>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto flex-1">
          <button
            v-for="status in ['open', 'in_review', 'resolved', 'escalated', 'closed']"
            :key="status"
            class="px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all"
            :class="
              statusFilter === status
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            "
            @click="statusFilter = status"
          >
            {{ status.replace('_', ' ') }}
          </button>
        </div>
        <div class="relative">
          <select
            v-model="categoryFilter"
            class="appearance-none px-3 py-2 pr-8 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="Software Bug">Software Bug</option>
            <option value="Network Issue">Network Issue</option>
            <option value="Equipment">Equipment</option>
            <option value="Training">Training</option>
            <option value="HR">HR</option>
            <option value="Safety">Safety</option>
            <option value="Other">Other</option>
          </select>
          <ChevronDownIcon
            class="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none"
          />
        </div>
        <input
          v-model="employeeInput"
          type="text"
          placeholder="Search tickets..."
          class="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      <!-- Ticket List -->
      <div class="space-y-3">
        <div
          v-for="ticket in paginatedTickets"
          :key="ticket.id"
          class="bg-white rounded-xl border border-slate-200 overflow-hidden transition-all"
          :class="ticket.status === 'escalated' ? 'border-amber-300 ring-1 ring-amber-200' : ''"
        >
          <!-- Ticket summary -->
          <div
            class="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
            @click="toggleExpand(ticket.id)"
          >
            <div class="flex items-start gap-3">
              <div
                class="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0"
              >
                {{ getEmployeeInitials(ticket.raised_by) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="text-sm font-semibold text-slate-900 truncate">{{ ticket.subject }}</h3>
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize"
                    :class="categoryColors[ticket.category.toLowerCase()] || categoryColors.other"
                  >{{ ticket.category }}</span>
                </div>
                <div class="flex items-center gap-3 text-xs text-slate-400">
                  <span>{{ getEmployeeName(ticket.raised_by) }}</span>
                  <span>{{ formatDateShort(ticket.created_on) }}</span>
                    <span :class="priorityColors[ticket.priority]" class="font-medium capitalize">{{ ticket.priority }}</span>
                  <span v-if="ticket.attachments?.length" class="inline-flex items-center gap-0.5">
                    <PaperClipIcon class="w-3 h-3" /> {{ ticket.attachments.length }}
                  </span>
                  <span v-if="ticket.assigned_to" class="text-blue-500">
                    Assigned: {{ getEmployeeName(ticket.assigned_to) }}
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="statusColors[ticket.status]"
                >
                  {{ ticket.status.replace('_', ' ') }}
                </span>
                <ChevronDownIcon
                  class="w-4 h-4 text-slate-300 transition-transform"
                  :class="expandedTicket === ticket.id ? 'rotate-180' : ''"
                />
              </div>
            </div>
          </div>

          <!-- Expanded detail -->
          <div v-if="expandedTicket === ticket.id" class="border-t border-slate-100 p-4 space-y-4">
            <p class="text-sm text-slate-600">{{ ticket.description }}</p>

            <!-- Status tracker -->
            <div class="flex items-center gap-2 text-xs">
              <span
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium"
                :class="statusColors[ticket.status]"
              >
                {{ ticket.status.replace('_', ' ') }}
              </span>
              <span class="text-slate-400">|</span>
              <span :class="priorityColors[ticket.priority]" class="font-medium capitalize">{{ ticket.priority }} priority</span>
            </div>

            <!-- Comment thread -->
            <div class="space-y-3">
              <h4 class="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Comments ({{ ticket.comments.length }})
              </h4>
              <div v-for="c in ticket.comments" :key="c.id" class="flex gap-2">
                <div
                  class="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700 shrink-0"
                >
                  {{ c.author.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase() }}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-medium text-slate-900">{{ c.author }}</span>
                    <span class="text-[10px] text-slate-400">{{ formatDateTime(c.created_on) }}</span>
                  </div>
                  <p class="text-xs text-slate-600 mt-0.5">{{ c.text }}</p>
                </div>
              </div>
            </div>

            <!-- Add comment -->
            <div class="flex gap-2">
              <input
                v-model="newCommentText"
                type="text"
                placeholder="Add a comment..."
                class="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                @keyup.enter="handleAddComment(ticket)"
              />
              <button
                class="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
                @click="handleAddComment(ticket)"
              >
                <ChatBubbleLeftRightIcon class="w-4 h-4" />
              </button>
            </div>

            <!-- Resolution notes -->
            <div
              v-if="ticket.resolution_notes"
              class="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700"
            >
              <p class="text-xs font-medium mb-1">Resolution Notes</p>
              {{ ticket.resolution_notes }}
              <p v-if="ticket.resolved_on" class="text-xs text-emerald-500 mt-1">
                Resolved {{ formatDateTime(ticket.resolved_on) }}
                <span v-if="ticket.created_on">
                  ({{ Math.round((new Date(ticket.resolved_on).getTime() - new Date(ticket.created_on).getTime()) / 3600000) }}h to resolve)
                </span>
              </p>
            </div>

            <!-- Actions -->
            <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              <button
                v-if="ticket.status === 'open' && doerOptions.length"
                class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200 hover:bg-blue-100 transition-colors"
                @click="openAssignModal(ticket)"
              >
                <UserCircleIcon class="w-3.5 h-3.5" /> Assign
              </button>
              <button
                v-if="ticket.status !== 'escalated' && ticket.status !== 'closed'"
                class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200 hover:bg-amber-100 transition-colors"
                @click="openEscalateModal(ticket)"
              >
                <ShieldExclamationIcon class="w-3.5 h-3.5" /> Escalate
              </button>
              <button
                v-if="ticket.status === 'closed'"
                class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200 hover:bg-blue-100 transition-colors"
                @click="handleReopen(ticket)"
              >
                <ArrowPathIcon class="w-3.5 h-3.5" /> Reopen
              </button>
              <button
                v-if="ticket.status !== 'closed' && ticket.status !== 'resolved'"
                class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200 hover:bg-emerald-100 transition-colors ml-auto"
                @click="openCloseModal(ticket)"
              >
                <CheckCircleIcon class="w-3.5 h-3.5" /> Resolve
              </button>
            </div>
          </div>
        </div>

        <OptEmptyState v-if="filteredTickets.length === 0" type="search" title="No tickets match your filters" />

      <OptPagination
        :current-page="ticketsCurrentPage"
        :total-pages="ticketsTotalPages"
        :total-items="ticketsTotalItems"
        :page-size="20"
        @page-change="ticketsCurrentPage = $event"
      />
    </div>
  </div>

    <!-- Resolve Modal -->
    <div v-if="closeModal" class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div class="fixed inset-0 bg-black/40" @click="closeModal = null" />
      <div class="relative bg-white rounded-2xl border border-slate-200 w-full max-w-md p-5 space-y-4 shadow-2xl">
        <h3 class="text-sm font-semibold text-slate-900">Resolve Ticket</h3>
        <p class="text-xs text-slate-500">Add resolution notes. Admin will review and close.</p>
        <textarea
          v-model="closeModal.notes"
          rows="3"
          placeholder="Resolution notes..."
          class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
        />
        <div class="flex justify-end gap-2">
          <button class="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50" @click="closeModal = null">Cancel</button>
          <button class="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700" @click="confirmClose">Resolve</button>
        </div>
      </div>
    </div>

    <!-- Assign Modal -->
    <div v-if="assignModal" class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div class="fixed inset-0 bg-black/40" @click="assignModal = null" />
      <div class="relative bg-white rounded-2xl border border-slate-200 w-full max-w-md p-5 space-y-4 shadow-2xl">
        <h3 class="text-sm font-semibold text-slate-900">Assign Ticket</h3>
        <p class="text-xs text-slate-500">Select a team member to assign this ticket.</p>
        <select
          v-model="assignModal.assignee"
          class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
        >
          <option value="" disabled>Select doer...</option>
          <option v-for="d in doerOptions" :key="d.employee_id" :value="d.employee_id">{{ d.name }} ({{ d.employee_id }})</option>
        </select>
        <div class="flex justify-end gap-2">
          <button class="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50" @click="assignModal = null">Cancel</button>
          <button class="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700" @click="confirmAssign">Assign</button>
        </div>
      </div>
    </div>

    <!-- Escalate Modal -->
    <div v-if="escalateModal" class="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div class="fixed inset-0 bg-black/40" @click="escalateModal = null" />
      <div class="relative bg-white rounded-2xl border border-slate-200 w-full max-w-md p-5 space-y-4 shadow-2xl">
        <h3 class="text-sm font-semibold text-slate-900">Escalate to Admin</h3>
        <p class="text-xs text-slate-500">Provide a reason for escalation.</p>
        <textarea
          v-model="escalateModal.reason"
          rows="3"
          placeholder="Reason for escalation..."
          class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
        />
        <div class="flex justify-end gap-2">
          <button class="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50" @click="escalateModal = null">Cancel</button>
          <button class="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700" @click="confirmEscalate">Escalate</button>
        </div>
      </div>
    </div>
  </div>
</template>