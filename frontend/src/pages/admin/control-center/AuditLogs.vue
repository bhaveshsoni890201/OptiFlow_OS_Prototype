<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  ChevronDownIcon,
} from '@heroicons/vue/24/outline'
import OptEmptyState from '../../../components/common/OptEmptyState.vue'

interface AuditEntry {
  id: string
  timestamp: string
  actor: string
  actorId: string
  action: string
  entity: string
  entityId: string
  summary: string
  ip: string
}

const logs = ref<AuditEntry[]>([
  {
    id: 'AUD-001',
    timestamp: '2026-06-03T10:15:00+05:30',
    actor: 'Ramesh Kumar',
    actorId: 'EMP-0001',
    action: 'UPDATE',
    entity: 'Employee',
    entityId: 'EMP-0004',
    summary: 'Changed role from doer to captain',
    ip: '192.168.1.100',
  },
  {
    id: 'AUD-002',
    timestamp: '2026-06-03T09:45:00+05:30',
    actor: 'Priya Sharma',
    actorId: 'EMP-0002',
    action: 'APPROVE',
    entity: 'Leave',
    entityId: 'LV-0001',
    summary: 'Approved sick leave for Meena Devi',
    ip: '192.168.1.102',
  },
  {
    id: 'AUD-003',
    timestamp: '2026-06-03T09:30:00+05:30',
    actor: 'System',
    actorId: 'SYSTEM',
    action: 'CREATE',
    entity: 'Task',
    entityId: 'DEL-0011',
    summary: 'Auto-generated daily checklist task',
    ip: '127.0.0.1',
  },
  {
    id: 'AUD-004',
    timestamp: '2026-06-03T08:20:00+05:30',
    actor: 'Deepika Singh',
    actorId: 'EMP-0006',
    action: 'UPDATE',
    entity: 'Attendance',
    entityId: 'ATT-0006',
    summary: 'Corrected check-in time',
    ip: '192.168.1.106',
  },
  {
    id: 'AUD-005',
    timestamp: '2026-06-02T18:00:00+05:30',
    actor: 'Anjali Patel',
    actorId: 'EMP-0003',
    action: 'DELETE',
    entity: 'Ticket',
    entityId: 'TKT-0006',
    summary: 'Deleted duplicate ticket',
    ip: '192.168.1.103',
  },
  {
    id: 'AUD-006',
    timestamp: '2026-06-02T17:30:00+05:30',
    actor: 'Ramesh Kumar',
    actorId: 'EMP-0001',
    action: 'CREATE',
    entity: 'Department',
    entityId: 'DEPT-006',
    summary: 'Created Maintenance department',
    ip: '192.168.1.100',
  },
  {
    id: 'AUD-007',
    timestamp: '2026-06-02T16:15:00+05:30',
    actor: 'Vikram Joshi',
    actorId: 'EMP-0007',
    action: 'UPDATE',
    entity: 'Worklist',
    entityId: 'WL-0003',
    summary: 'Updated FIFO compliance checklist',
    ip: '192.168.1.107',
  },
  {
    id: 'AUD-008',
    timestamp: '2026-06-02T15:00:00+05:30',
    actor: 'System',
    actorId: 'SYSTEM',
    action: 'ESCALATE',
    entity: 'Task',
    entityId: 'DEL-0001',
    summary: 'Auto-escalated overdue inspection task',
    ip: '127.0.0.1',
  },
  {
    id: 'AUD-009',
    timestamp: '2026-06-02T14:00:00+05:30',
    actor: 'Priya Sharma',
    actorId: 'EMP-0002',
    action: 'REJECT',
    entity: 'Leave',
    entityId: 'LV-0003',
    summary: 'Rejected casual leave for Suresh Reddy',
    ip: '192.168.1.102',
  },
  {
    id: 'AUD-010',
    timestamp: '2026-06-02T12:30:00+05:30',
    actor: 'Ramesh Kumar',
    actorId: 'EMP-0001',
    action: 'UPDATE',
    entity: 'Settings',
    entityId: 'GLOBAL',
    summary: 'Changed session timeout from 15 to 30 min',
    ip: '192.168.1.100',
  },
])

const actionTypes = ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'ESCALATE', 'LOGIN']
const entities = [
  'Employee',
  'Task',
  'Leave',
  'Attendance',
  'Ticket',
  'Department',
  'Worklist',
  'Settings',
]

const searchQuery = ref('')
const filterAction = ref('')
const filterEntity = ref('')
const filterActor = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const showFilters = ref(false)

const filteredLogs = computed(() => {
  return logs.value.filter((log) => {
    const q = searchQuery.value.toLowerCase()
    if (
      q &&
      !log.actor.toLowerCase().includes(q) &&
      !log.entity.toLowerCase().includes(q) &&
      !log.action.toLowerCase().includes(q) &&
      !log.summary.toLowerCase().includes(q)
    )
      return false
    if (filterAction.value && log.action !== filterAction.value) return false
    if (filterEntity.value && log.entity !== filterEntity.value) return false
    if (filterActor.value && log.actor !== filterActor.value && log.actorId !== filterActor.value)
      return false
    if (dateFrom.value && log.timestamp < dateFrom.value) return false
    if (dateTo.value && log.timestamp > dateTo.value + 'T23:59:59') return false
    return true
  })
})

function clearFilters() {
  searchQuery.value = ''
  filterAction.value = ''
  filterEntity.value = ''
  filterActor.value = ''
  dateFrom.value = ''
  dateTo.value = ''
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function exportLogs() {
  const csv = [
    ['Timestamp', 'Actor', 'Action', 'Entity', 'Entity ID', 'Summary', 'IP'].join(','),
    ...filteredLogs.value.map((l) =>
      [l.timestamp, l.actor, l.action, l.entity, l.entityId, `"${l.summary}"`, l.ip].join(','),
    ),
  ].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const uniqueActors = computed(() => [...new Set(logs.value.map((l) => l.actor))])

const actionColors: Record<string, string> = {
  CREATE: 'bg-emerald-50 text-emerald-700',
  UPDATE: 'bg-blue-50 text-blue-700',
  DELETE: 'bg-red-50 text-red-600',
  APPROVE: 'bg-emerald-50 text-emerald-700',
  REJECT: 'bg-red-50 text-red-600',
  ESCALATE: 'bg-amber-50 text-amber-700',
  LOGIN: 'bg-slate-50 text-slate-600',
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <h2 class="text-sm font-semibold text-slate-900 flex items-center gap-2">
        <ClipboardDocumentListIcon class="w-4 h-4 text-slate-400" />
        Audit Trail
      </h2>
      <button
        class="inline-flex items-center gap-2 px-3 h-9 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        @click="exportLogs"
      >
        <ArrowDownTrayIcon class="w-4 h-4" />
        Export CSV
      </button>
    </div>

    <!-- Search & Filters -->
    <div class="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <MagnifyingGlassIcon
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search logs..."
            class="w-full pl-9 pr-3 h-10 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          class="inline-flex items-center gap-2 px-3 h-10 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          @click="showFilters = !showFilters"
        >
          <FunnelIcon class="w-4 h-4" />
          Filters
        </button>
      </div>

      <div
        v-if="showFilters"
        class="flex flex-col sm:flex-row flex-wrap gap-3 pt-2 border-t border-slate-100"
      >
        <select
          v-model="filterAction"
          class="h-10 text-sm border border-slate-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All Actions</option>
          <option v-for="a in actionTypes" :key="a" :value="a">{{ a }}</option>
        </select>
        <select
          v-model="filterEntity"
          class="h-10 text-sm border border-slate-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All Entities</option>
          <option v-for="e in entities" :key="e" :value="e">{{ e }}</option>
        </select>
        <select
          v-model="filterActor"
          class="h-10 text-sm border border-slate-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All Actors</option>
          <option v-for="a in uniqueActors" :key="a" :value="a">{{ a }}</option>
        </select>
        <input
          v-model="dateFrom"
          type="date"
          class="h-10 text-sm border border-slate-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          v-model="dateTo"
          type="date"
          class="h-10 text-sm border border-slate-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          class="inline-flex items-center gap-1 px-3 h-10 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          @click="clearFilters"
        >
          <XMarkIcon class="w-4 h-4" /> Clear
        </button>
      </div>
    </div>

    <!-- Table (Read-only) -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-slate-50 text-left">
              <th class="px-4 py-3 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th class="px-4 py-3 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                Actor
              </th>
              <th class="px-4 py-3 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                Action
              </th>
              <th class="px-4 py-3 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                Entity
              </th>
              <th
                class="px-4 py-3 font-semibold text-xs text-slate-500 uppercase tracking-wider hidden md:table-cell"
              >
                Summary
              </th>
              <th
                class="px-4 py-3 font-semibold text-xs text-slate-500 uppercase tracking-wider hidden lg:table-cell"
              >
                IP
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="log in filteredLogs"
              :key="log.id"
              class="hover:bg-slate-50 transition-colors"
            >
              <td class="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                {{ formatDateTime(log.timestamp) }}
              </td>
              <td class="px-4 py-3">
                <span class="font-medium text-slate-800">{{ log.actor }}</span>
                <span class="text-xs text-slate-400 ml-1">{{ log.actorId }}</span>
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="actionColors[log.action] || 'bg-slate-100 text-slate-600'"
                >
                  {{ log.action }}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-700">
                {{ log.entity }} <span class="text-slate-400">#{{ log.entityId }}</span>
              </td>
              <td
                class="px-4 py-3 text-slate-500 text-xs hidden md:table-cell max-w-[250px] truncate"
              >
                {{ log.summary }}
              </td>
              <td class="px-4 py-3 text-xs font-mono text-slate-400 hidden lg:table-cell">
                {{ log.ip }}
              </td>
            </tr>
            <tr v-if="filteredLogs.length === 0">
              <td colspan="6" class="px-4 py-12 text-center">
                <OptEmptyState type="search" title="No audit logs found matching your filters" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-4 py-3 border-t border-slate-100 text-xs text-slate-400 text-right">
        Showing {{ filteredLogs.length }} of {{ logs.length }} entries
      </div>
    </div>
  </div>
</template>
