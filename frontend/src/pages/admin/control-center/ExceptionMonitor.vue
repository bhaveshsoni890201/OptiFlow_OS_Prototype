<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  BellAlertIcon,
  UserGroupIcon,
  ClockIcon,
  ShieldExclamationIcon,
  CheckCircleIcon,
} from '@heroicons/vue/24/outline'

interface Exception {
  id: string
  type:
    | 'repeated_escalation'
    | 'failed_notification'
    | 'buddy_transfer_failure'
    | 'sla_breach'
    | 'no_activity'
  title: string
  entityRef: string
  entityLink: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  firstSeen: string
  lastSeen: string
  count: number
  status: 'open' | 'acknowledged' | 'resolved'
}

const exceptions = ref<Exception[]>([])
const filterStatus = ref('')
const filterSeverity = ref('')
const filterType = ref('')
const loading = ref(true)
const error = ref('')

async function loadExceptions() {
  loading.value = true
  error.value = ''
  try {
    // Simulated API call — replace with real fetch
    await new Promise((resolve) => setTimeout(resolve, 300))
    exceptions.value = [
      {
        id: 'EXC-001',
        type: 'repeated_escalation',
        title: 'Fabric inspection task escalated 3 times',
        entityRef: 'DEL-0001',
        entityLink: '#',
        severity: 'critical',
        firstSeen: '2026-05-28T10:00:00+05:30',
        lastSeen: '2026-06-03T09:00:00+05:30',
        count: 3,
        status: 'open',
      },
      {
        id: 'EXC-002',
        type: 'failed_notification',
        title: 'WhatsApp API send failure for leave approval',
        entityRef: 'LV-0001',
        entityLink: '#',
        severity: 'high',
        firstSeen: '2026-06-02T14:00:00+05:30',
        lastSeen: '2026-06-02T14:00:00+05:30',
        count: 1,
        status: 'open',
      },
      {
        id: 'EXC-003',
        type: 'buddy_transfer_failure',
        title: 'Task transfer to Deepika Singh not acknowledged',
        entityRef: 'BT-0001',
        entityLink: '#',
        severity: 'high',
        firstSeen: '2026-06-03T06:00:00+05:30',
        lastSeen: '2026-06-03T10:00:00+05:30',
        count: 2,
        status: 'acknowledged',
      },
      {
        id: 'EXC-004',
        type: 'sla_breach',
        title: 'SLA breach — machine maintenance overdue 3 days',
        entityRef: 'DEL-0003',
        entityLink: '#',
        severity: 'critical',
        firstSeen: '2026-06-02T10:00:00+05:30',
        lastSeen: '2026-06-03T07:45:00+05:30',
        count: 1,
        status: 'open',
      },
      {
        id: 'EXC-005',
        type: 'no_activity',
        title: 'Suresh Reddy — no activity for 2 days',
        entityRef: 'EMP-0005',
        entityLink: '#',
        severity: 'medium',
        firstSeen: '2026-06-01T17:00:00+05:30',
        lastSeen: '2026-06-03T07:00:00+05:30',
        count: 2,
        status: 'open',
      },
      {
        id: 'EXC-006',
        type: 'repeated_escalation',
        title: 'Quality check FMS task escalated to admin',
        entityRef: 'FMS-0002',
        entityLink: '#',
        severity: 'critical',
        firstSeen: '2026-05-29T09:00:00+05:30',
        lastSeen: '2026-06-03T08:00:00+05:30',
        count: 6,
        status: 'acknowledged',
      },
      {
        id: 'EXC-007',
        type: 'failed_notification',
        title: 'SMS gateway timeout for OTP delivery',
        entityRef: 'N/A',
        entityLink: '#',
        severity: 'low',
        firstSeen: '2026-06-01T11:30:00+05:30',
        lastSeen: '2026-06-01T11:30:00+05:30',
        count: 1,
        status: 'resolved',
      },
      {
        id: 'EXC-008',
        type: 'no_activity',
        title: 'Vikram Joshi — no activity for 1 day',
        entityRef: 'EMP-0007',
        entityLink: '#',
        severity: 'medium',
        firstSeen: '2026-06-02T17:00:00+05:30',
        lastSeen: '2026-06-03T10:00:00+05:30',
        count: 1,
        status: 'open',
      },
    ]
  } catch {
    error.value = 'Failed to load exceptions. Please try again.'
  } finally {
    loading.value = false
  }
}

loadExceptions()

const filteredExceptions = computed(() => {
  return exceptions.value.filter((ex) => {
    if (filterStatus.value && ex.status !== filterStatus.value) return false
    if (filterSeverity.value && ex.severity !== filterSeverity.value) return false
    if (filterType.value && ex.type !== filterType.value) return false
    return true
  })
})

function changeStatus(ex: Exception, newStatus: 'open' | 'acknowledged' | 'resolved') {
  ex.status = newStatus
}

const openCount = computed(() => exceptions.value.filter((e) => e.status === 'open').length)

const typeLabels: Record<string, string> = {
  repeated_escalation: 'Repeated Escalation',
  failed_notification: 'Failed Notification',
  buddy_transfer_failure: 'Buddy Transfer Failure',
  sla_breach: 'SLA Breach',
  no_activity: 'No Activity',
}

const typeIcons: Record<string, any> = {
  repeated_escalation: ArrowPathIcon,
  failed_notification: BellAlertIcon,
  buddy_transfer_failure: UserGroupIcon,
  sla_breach: ClockIcon,
  no_activity: ShieldExclamationIcon,
}

const severityColors: Record<string, string> = {
  critical: 'bg-red-50 border-red-200 text-red-700',
  high: 'bg-amber-50 border-amber-200 text-amber-700',
  medium: 'bg-blue-50 border-blue-200 text-blue-700',
  low: 'bg-slate-50 border-slate-200 text-slate-600',
}

const statusColors: Record<string, string> = {
  open: 'bg-red-50 text-red-600',
  acknowledged: 'bg-amber-50 text-amber-600',
  resolved: 'bg-emerald-50 text-emerald-600',
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="space-y-4">
    <!-- Summary -->
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
      <div class="bg-white rounded-xl border border-slate-200 p-4 text-center">
        <p class="text-2xl font-bold text-slate-900">{{ exceptions.length }}</p>
        <p class="text-xs text-slate-500 mt-0.5">Total</p>
      </div>
      <div class="bg-red-50 rounded-xl border border-red-200 p-4 text-center">
        <p class="text-2xl font-bold text-red-600">{{ openCount }}</p>
        <p class="text-xs text-red-500 mt-0.5">Open</p>
      </div>
      <div class="bg-amber-50 rounded-xl border border-amber-200 p-4 text-center">
        <p class="text-2xl font-bold text-amber-600">
          {{ exceptions.filter((e) => e.status === 'acknowledged').length }}
        </p>
        <p class="text-xs text-amber-500 mt-0.5">Acknowledged</p>
      </div>
      <div class="bg-emerald-50 rounded-xl border border-emerald-200 p-4 text-center">
        <p class="text-2xl font-bold text-emerald-600">
          {{ exceptions.filter((e) => e.status === 'resolved').length }}
        </p>
        <p class="text-xs text-emerald-500 mt-0.5">Resolved</p>
      </div>
      <div class="bg-slate-50 rounded-xl border border-slate-200 p-4 text-center">
        <p class="text-2xl font-bold text-slate-600">
          {{ exceptions.filter((e) => e.severity === 'critical').length }}
        </p>
        <p class="text-xs text-slate-500 mt-0.5">Critical</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3">
      <select
        v-model="filterStatus"
        class="h-10 text-sm border border-slate-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">All Status</option>
        <option value="open">Open</option>
        <option value="acknowledged">Acknowledged</option>
        <option value="resolved">Resolved</option>
      </select>
      <select
        v-model="filterSeverity"
        class="h-10 text-sm border border-slate-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">All Severity</option>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <select
        v-model="filterType"
        class="h-10 text-sm border border-slate-300 rounded-lg px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">All Types</option>
        <option value="repeated_escalation">Repeated Escalation</option>
        <option value="failed_notification">Failed Notification</option>
        <option value="buddy_transfer_failure">Buddy Transfer Failure</option>
        <option value="sla_breach">SLA Breach</option>
        <option value="no_activity">No Activity</option>
      </select>
    </div>

    <div
      v-if="error"
      class="bg-white rounded-xl border border-red-200 p-8 text-center"
    >
      <ExclamationTriangleIcon class="w-14 h-14 text-red-300 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-red-700">Failed to load exceptions</h3>
      <p class="text-sm text-red-500 mt-1">{{ error }}</p>
      <button
        class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
        @click="loadExceptions"
      >
        <ArrowPathIcon class="w-4 h-4" />
        Retry
      </button>
    </div>

    <div v-else-if="loading" class="flex items-center justify-center py-16">
      <div class="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
    </div>

    <div
      v-else-if="filteredExceptions.length === 0"
      class="bg-white rounded-xl border border-slate-200 p-12 text-center"
    >
      <CheckCircleIcon class="w-14 h-14 text-emerald-300 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-slate-700">No exceptions</h3>
      <p class="text-sm text-slate-400">All systems operating normally</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="ex in filteredExceptions"
        :key="ex.id"
        class="bg-white rounded-xl border p-4 transition-all hover:shadow-sm"
        :class="severityColors[ex.severity] + ' ' + (ex.status === 'resolved' ? 'opacity-60' : '')"
      >
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-start gap-3 flex-1 min-w-0">
            <component :is="typeIcons[ex.type]" class="w-5 h-5 mt-0.5 shrink-0" />
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-sm font-semibold text-slate-900">{{ ex.title }}</h3>
                <span
                  class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="statusColors[ex.status]"
                >
                  {{ ex.status.charAt(0).toUpperCase() + ex.status.slice(1) }}
                </span>
              </div>
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                <span><strong>Ref:</strong> {{ ex.entityRef }}</span>
                <span><strong>Type:</strong> {{ typeLabels[ex.type] }}</span>
                <span><strong>Count:</strong> {{ ex.count }}</span>
                <span><strong>First:</strong> {{ formatDateTime(ex.firstSeen) }}</span>
                <span><strong>Last:</strong> {{ formatDateTime(ex.lastSeen) }}</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button
              v-if="ex.status === 'open'"
              class="px-3 h-8 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
              @click="changeStatus(ex, 'acknowledged')"
            >
              Acknowledge
            </button>
            <button
              v-if="ex.status !== 'resolved'"
              class="px-3 h-8 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
              @click="changeStatus(ex, 'resolved')"
            >
              <CheckCircleIcon class="w-3.5 h-3.5 inline mr-1" />
              Resolve
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

