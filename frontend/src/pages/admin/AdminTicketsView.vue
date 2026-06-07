<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  TicketIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/vue/24/outline'
import { useDebouncedSearch } from '../../composables/useDebouncedSearch'
import { useTicketStore } from '../../stores/ticketStore'
import type { HelpTicket } from '../../types'
import { usePagination } from '../../composables/usePagination'
import OptPagination from '../../components/common/OptPagination.vue'
import { formatDateShort, formatDateTime } from '../../utils/formatters'

const ticketStore = useTicketStore()

const loading = ref(true)
const error = ref('')

const { immediate: searchInput, debounced: searchQuery, clear: clearSearch } = useDebouncedSearch(300)
const filterStatus = ref('')
const filterCategory = ref('')
const expandedTickets = ref<Set<string>>(new Set())
const showFilters = ref(false)

const categories = [
  'Software Bug',
  'Network Issue',
  'Equipment',
  'Training',
  'HR',
  'Safety',
  'Other',
]

const filteredTickets = computed(() => {
  return ticketStore.tickets.filter((t) => {
    const q = searchQuery.value.toLowerCase()
    if (
      q &&
      !t.subject.toLowerCase().includes(q) &&
      !t.raised_by.toLowerCase().includes(q) &&
      !t.id.toLowerCase().includes(q)
    )
      return false
    if (filterStatus.value && t.status !== filterStatus.value) return false
    if (filterCategory.value && t.category !== filterCategory.value) return false
    return true
  })
})

const {
  paginated: paginatedTickets,
  totalPages: ticketsTotalPages,
  currentPage: ticketsCurrentPage,
  totalItems: ticketsTotalItems,
  goTo: ticketsGoTo,
} = usePagination(filteredTickets, 20)

watch(filteredTickets, () => ticketsGoTo(1))

function toggleExpand(id: string) {
  if (expandedTickets.value.has(id)) expandedTickets.value.delete(id)
  else expandedTickets.value.add(id)
}

function changeStatus(ticket: HelpTicket, newStatus: HelpTicket['status']) {
  ticket.status = newStatus
  ticket.updated_on = new Date().toISOString()
}

const totalTickets = computed(() => ticketStore.tickets.length)
const openCount = computed(
  () => ticketStore.tickets.filter((t) => t.status === 'open' || t.status === 'in_review').length,
)
const resolvedCount = computed(
  () => ticketStore.tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length,
)
const escalatedCount = computed(() => ticketStore.tickets.filter((t) => t.status === 'escalated').length)

const avgResolutionDays = computed(() => {
  const resolved = ticketStore.tickets.filter((t) => t.status === 'resolved' || t.status === 'closed')
  if (resolved.length === 0) return 0
  const totalDays = resolved.reduce((sum, t) => {
    const created = new Date(t.created_on)
    const updated = new Date(t.updated_on)
    return sum + (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  }, 0)
  return Math.round((totalDays / resolved.length) * 10) / 10
})

const statusColors: Record<string, string> = {
  open: 'bg-slate-100 text-slate-600',
  in_review: 'bg-blue-50 text-blue-700',
  escalated: 'bg-red-50 text-red-600',
  resolved: 'bg-emerald-50 text-emerald-700',
  closed: 'bg-slate-50 text-slate-500',
}

function formatDateTime(iso: string) {
  return formatDateShort(iso)
}

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    await ticketStore.fetchTickets()
  } catch {
    error.value = 'Failed to load tickets'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl sm:text-2xl font-bold text-slate-900">Tickets</h1>

    <div v-if="loading" class="flex items-center justify-center py-16">
      <div class="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
    </div>

    <div v-else-if="error" class="card p-8 text-center">
      <ExclamationTriangleIcon class="h-12 w-12 text-red-400 mx-auto mb-3" />
      <p class="text-sm text-red-600 font-medium">{{ error }}</p>
      <button class="mt-3 text-sm text-blue-600 hover:underline" @click="loading = true; error = ''; ticketStore.fetchTickets().then(() => { loading = false }).catch(() => { error = 'Failed to load tickets'; loading = false })">Retry</button>
    </div>

    <template v-else>

    <!-- Analytics Bar -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-white rounded-xl border border-slate-200 p-4">
        <p class="text-2xl font-bold text-slate-900">{{ totalTickets }}</p>
        <p class="text-xs text-slate-500 mt-0.5">Total Tickets</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-4">
        <p class="text-2xl font-bold text-amber-600">{{ openCount }}</p>
        <p class="text-xs text-slate-500 mt-0.5">Open / In Review</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-4">
        <p class="text-2xl font-bold text-red-600">{{ escalatedCount }}</p>
        <p class="text-xs text-slate-500 mt-0.5">Escalated</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-4">
        <p class="text-2xl font-bold text-slate-900">{{ resolvedCount }}</p>
        <p class="text-xs text-slate-500 mt-0.5">Resolved</p>
      </div>
    </div>

    <!-- Avg Resolution Time -->
    <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
      <ClockIcon class="w-5 h-5 text-blue-500" />
      <p class="text-sm text-blue-800">
        Average resolution time: <strong>{{ avgResolutionDays }} days</strong>
      </p>
    </div>

    <!-- Search & Filters -->
    <div class="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <MagnifyingGlassIcon
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          />
          <input
            v-model="searchInput"
            type="text"
            placeholder="Search tickets..."
            class="w-full pl-9 pr-3 h-10 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          class="inline-flex items-center gap-2 px-3 h-10 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          @click="showFilters = !showFilters"
        >
          <FunnelIcon class="w-4 h-4" /> Filters
        </button>
      </div>
      <div v-if="showFilters" class="flex gap-3 pt-2 border-t border-slate-100">
        <select
          v-model="filterStatus"
          class="h-10 text-sm border border-slate-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_review">In Review</option>
          <option value="escalated">Escalated</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          v-model="filterCategory"
          class="h-10 text-sm border border-slate-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All Categories</option>
          <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
    </div>

    <!-- Ticket List -->
    <div class="space-y-3">
      <div
        v-for="ticket in paginatedTickets"
        :key="ticket.id"
        class="bg-white rounded-xl border overflow-hidden transition-all"
        :class="
          ticket.status === 'escalated' ? 'border-red-300 ring-1 ring-red-200' : 'border-slate-200'
        "
      >
        <!-- Header -->
        <div class="p-4 cursor-pointer" @click="toggleExpand(ticket.id)">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="flex items-start gap-3 min-w-0 flex-1">
              <div v-if="ticket.status === 'escalated'" class="mt-0.5">
                <ExclamationTriangleIcon class="w-5 h-5 text-red-500" />
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-xs font-mono text-slate-400">{{ ticket.id }}</span>
                  <span
                    class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="statusColors[ticket.status]"
                  >
                    {{ ticket.status.replace('_', ' ') }}
                  </span>
                  <span class="text-xs text-slate-400">{{ ticket.category }}</span>
                </div>
                <h3 class="text-sm font-semibold text-slate-900 mt-1">{{ ticket.subject }}</h3>
                <p class="text-xs text-slate-500 mt-0.5">
                  {{ ticket.raised_by }} &middot;
                  {{ formatDateTime(ticket.created_on) }}
                </p>
              </div>
            </div>
            <span class="text-xs text-slate-400 shrink-0">
              {{ (ticket.comments?.length ?? 0) }} comments
            </span>
          </div>
        </div>

        <!-- Expanded Detail -->
        <div
          v-if="expandedTickets.has(ticket.id)"
          class="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3"
        >
          <p class="text-sm text-slate-600">{{ ticket.description }}</p>

          <!-- Comments -->
          <div v-if="(ticket.comments?.length ?? 0) > 0" class="space-y-2">
            <h4 class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Comments</h4>
            <div
              v-for="c in ticket.comments ?? []"
              :key="c.id"
              class="flex gap-2.5 p-2.5 bg-slate-50 rounded-lg"
            >
              <div
                class="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0"
              >
                {{
                  c.author
                    .split(' ')
                    .map((s) => s[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                }}
              </div>
              <div class="min-w-0">
                <p class="text-xs font-medium text-slate-700">
                  {{ c.author }}
                  <span class="text-slate-400 font-normal"
                    >&middot; {{ formatDateTime(c.created_on) }}</span
                  >
                </p>
                <p class="text-sm text-slate-600 mt-0.5">{{ c.text }}</p>
              </div>
            </div>
          </div>

          <!-- Resolution Notes -->
          <div
            v-if="ticket.resolution_notes"
            class="p-3 bg-emerald-50 rounded-lg border border-emerald-200"
          >
            <p class="text-xs font-semibold text-emerald-700">Resolution Notes</p>
            <p class="text-sm text-emerald-800 mt-0.5">{{ ticket.resolution_notes }}</p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 pt-2 border-t border-slate-100">
            <select
              v-model="ticket.status"
              class="h-8 text-xs border border-slate-300 rounded-lg px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              @change="changeStatus(ticket, ticket.status)"
            >
              <option value="open">Open</option>
              <option value="in_review">In Review</option>
              <option value="escalated">Escalated</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <button
              v-if="ticket.status === 'resolved'"
              class="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200 hover:bg-emerald-100 transition-colors"
              @click="changeStatus(ticket, 'closed')"
            >
              <CheckCircleIcon class="w-3.5 h-3.5" /> Close
            </button>
            <span class="text-xs text-slate-400"
              >Updated: {{ formatDateTime(ticket.updated_on) }}</span
            >
          </div>
        </div>
      </div>

      <OptPagination
        :current-page="ticketsCurrentPage"
        :total-pages="ticketsTotalPages"
        :total-items="ticketsTotalItems"
        :page-size="20"
        @page-change="ticketsCurrentPage = $event"
      />

      <div
        v-if="filteredTickets.length === 0"
        class="bg-white rounded-xl border border-slate-200 p-12 text-center"
      >
        <TicketIcon class="w-14 h-14 text-slate-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-slate-700">No tickets found</h3>
        <p class="text-sm text-slate-400">No tickets match your search criteria</p>
      </div>
    </div>
    </template>
  </div>
</template>
