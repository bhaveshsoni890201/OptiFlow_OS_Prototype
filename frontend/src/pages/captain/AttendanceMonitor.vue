<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ArrowPathIcon,
} from '@heroicons/vue/24/outline'

interface AttendanceRecord {
  id: string
  employeeName: string
  employeeAvatar: string
  checkIn: string
  checkOut: string
  workMode: 'on_site' | 'remote' | 'field'
  lateMinutes: number
  status: 'ontime' | 'late' | 'absent'
}

interface CorrectionRequest {
  id: string
  employeeName: string
  employeeAvatar: string
  date: string
  originalCheckIn: string
  originalCheckOut: string
  requestedCheckIn: string
  requestedCheckOut: string
  reason: string
}

const loading = ref(true)
const error = ref<string | null>(null)
const selectedDate = ref(new Date().toISOString().split('T')[0])
const showCorrections = ref(true)

const records = ref<AttendanceRecord[]>([
  {
    id: 'a1',
    employeeName: 'Alex Rivera',
    employeeAvatar: 'AR',
    checkIn: '06:55',
    checkOut: '15:10',
    workMode: 'on_site',
    lateMinutes: 0,
    status: 'ontime',
  },
  {
    id: 'a2',
    employeeName: 'Sarah Chen',
    employeeAvatar: 'SC',
    checkIn: '07:00',
    checkOut: '15:05',
    workMode: 'on_site',
    lateMinutes: 0,
    status: 'ontime',
  },
  {
    id: 'a3',
    employeeName: 'Marcus Johnson',
    employeeAvatar: 'MJ',
    checkIn: '08:20',
    checkOut: '15:30',
    workMode: 'on_site',
    lateMinutes: 50,
    status: 'late',
  },
  {
    id: 'a4',
    employeeName: 'Priya Patel',
    employeeAvatar: 'PP',
    checkIn: '06:50',
    checkOut: '15:00',
    workMode: 'on_site',
    lateMinutes: 0,
    status: 'ontime',
  },
  {
    id: 'a5',
    employeeName: 'Lisa Park',
    employeeAvatar: 'LP',
    checkIn: '07:10',
    checkOut: '15:20',
    workMode: 'remote',
    lateMinutes: 10,
    status: 'late',
  },
  {
    id: 'a6',
    employeeName: 'David Kim',
    employeeAvatar: 'DK',
    checkIn: '—',
    checkOut: '—',
    workMode: 'field',
    lateMinutes: 0,
    status: 'absent',
  },
  {
    id: 'a7',
    employeeName: 'Rosa Martinez',
    employeeAvatar: 'RM',
    checkIn: '06:45',
    checkOut: '14:55',
    workMode: 'on_site',
    lateMinutes: 0,
    status: 'ontime',
  },
  {
    id: 'a8',
    employeeName: 'Tom Baker',
    employeeAvatar: 'TB',
    checkIn: '09:05',
    checkOut: '15:45',
    workMode: 'field',
    lateMinutes: 65,
    status: 'late',
  },
])

const corrections = ref<CorrectionRequest[]>([
  {
    id: 'c1',
    employeeName: 'Marcus Johnson',
    employeeAvatar: 'MJ',
    date: '2026-06-03',
    originalCheckIn: '08:20',
    originalCheckOut: '15:30',
    requestedCheckIn: '07:55',
    requestedCheckOut: '15:30',
    reason: 'Traffic — have proof of 7:55 arrival at gate',
  },
  {
    id: 'c2',
    employeeName: 'Lisa Park',
    employeeAvatar: 'LP',
    date: '2026-06-02',
    originalCheckIn: '08:15',
    originalCheckOut: '15:10',
    requestedCheckIn: '07:50',
    requestedCheckOut: '15:10',
    reason: 'Badge reader malfunction at remote site',
  },
])

const workModeColors: Record<string, string> = {
  on_site: 'bg-blue-50 text-blue-700 border-blue-200',
  remote: 'bg-violet-50 text-violet-700 border-violet-200',
  field: 'bg-amber-50 text-amber-700 border-amber-200',
}

const lateCount = computed(() => records.value.filter((r) => r.lateMinutes > 0).length)
const absentCount = computed(() => records.value.filter((r) => r.status === 'absent').length)

function handleApproveCorrection(c: CorrectionRequest) {
  const idx = corrections.value.findIndex((cr) => cr.id === c.id)
  if (idx !== -1) corrections.value.splice(idx, 1)
}

function handleRejectCorrection(c: CorrectionRequest) {
  const idx = corrections.value.findIndex((cr) => cr.id === c.id)
  if (idx !== -1) corrections.value.splice(idx, 1)
}

async function loadAttendance() {
  loading.value = true
  error.value = null
  try {
    await new Promise((r) => setTimeout(r, 400))
  } catch {
    error.value = 'Failed to load attendance data'
  } finally {
    loading.value = false
  }
}

onMounted(loadAttendance)
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
      <div class="flex flex-col items-center gap-3">
        <div
          class="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"
        />
        <span class="text-sm text-slate-500">Loading attendance...</span>
      </div>
    </div>

    <div v-else-if="error" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <ExclamationTriangleIcon class="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p class="text-sm text-red-600 font-medium">{{ error }}</p>
        <button
          class="mt-3 text-sm text-blue-600 hover:underline"
          @click="loadAttendance()"
        >
          Retry
        </button>
      </div>
    </div>

    <div v-else class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">Attendance Monitor</h1>
          <p class="text-sm text-slate-500">
            {{ records.length }} members &middot; {{ lateCount }} late &middot;
            {{ absentCount }} absent
          </p>
        </div>
        <div class="relative">
          <CalendarDaysIcon
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          />
          <input
            v-model="selectedDate"
            type="date"
            class="pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      <!-- Attendance Table -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div class="hidden sm:block overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50">
                <th
                  class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Member
                </th>
                <th
                  class="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Check-in
                </th>
                <th
                  class="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Check-out
                </th>
                <th
                  class="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Mode
                </th>
                <th
                  class="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Late
                </th>
                <th
                  class="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="r in records"
                :key="r.id"
                class="hover:bg-slate-50 transition-colors"
                :class="r.lateMinutes > 0 ? 'bg-red-50/40' : ''"
              >
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700"
                    >
                      {{ r.employeeAvatar }}
                    </div>
                    <span class="text-sm font-medium text-slate-900">{{ r.employeeName }}</span>
                  </div>
                </td>
                <td
                  class="px-4 py-3 text-center text-sm font-medium"
                  :class="r.checkIn === '—' ? 'text-slate-300' : 'text-slate-900'"
                >
                  {{ r.checkIn }}
                </td>
                <td
                  class="px-4 py-3 text-center text-sm font-medium"
                  :class="r.checkOut === '—' ? 'text-slate-300' : 'text-slate-900'"
                >
                  {{ r.checkOut }}
                </td>
                <td class="px-4 py-3 text-center">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize"
                    :class="workModeColors[r.workMode]"
                  >
                    {{ r.workMode.replace('_', ' ') }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span v-if="r.lateMinutes > 0" class="text-sm font-bold text-red-600"
                    >{{ r.lateMinutes }}m</span
                  >
                  <span v-else class="text-sm text-slate-300">—</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="
                      r.status === 'ontime'
                        ? 'text-emerald-700 bg-emerald-50'
                        : r.status === 'late'
                          ? 'text-amber-700 bg-amber-50'
                          : 'text-red-700 bg-red-50'
                    "
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full"
                      :class="
                        r.status === 'ontime'
                          ? 'bg-emerald-500'
                          : r.status === 'late'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                      "
                    />
                    {{
                      r.status === 'ontime' ? 'On Time' : r.status === 'late' ? 'Late' : 'Absent'
                    }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile cards -->
        <div class="sm:hidden divide-y divide-slate-100">
          <div
            v-for="r in records"
            :key="r.id"
            class="p-4 space-y-2"
            :class="r.lateMinutes > 0 ? 'bg-red-50/40' : ''"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div
                  class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700"
                >
                  {{ r.employeeAvatar }}
                </div>
                <span class="text-sm font-medium text-slate-900">{{ r.employeeName }}</span>
              </div>
              <span
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                :class="
                  r.status === 'ontime'
                    ? 'text-emerald-700 bg-emerald-50'
                    : r.status === 'late'
                      ? 'text-amber-700 bg-amber-50'
                      : 'text-red-700 bg-red-50'
                "
              >
                {{ r.status === 'ontime' ? 'On Time' : r.status === 'late' ? 'Late' : 'Absent' }}
              </span>
            </div>
            <div class="flex items-center gap-3 text-xs text-slate-500">
              <span>In: {{ r.checkIn }}</span>
              <span>Out: {{ r.checkOut }}</span>
              <span class="capitalize">{{ r.workMode.replace('_', ' ') }}</span>
              <span v-if="r.lateMinutes > 0" class="text-red-600 font-medium"
                >{{ r.lateMinutes }}m late</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Correction Requests -->
      <div
        v-if="corrections.length > 0 && showCorrections"
        class="bg-white rounded-xl border border-slate-200 p-5 space-y-4"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold text-slate-900">
            Correction Requests ({{ corrections.length }})
          </h2>
          <button
            class="text-xs text-slate-400 hover:text-slate-600"
            @click="showCorrections = false"
          >
            Dismiss
          </button>
        </div>
        <div
          v-for="c in corrections"
          :key="c.id"
          class="p-4 rounded-lg bg-amber-50 border border-amber-200 space-y-2"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div
                class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700"
              >
                {{ c.employeeAvatar }}
              </div>
              <div>
                <p class="text-sm font-medium text-slate-900">{{ c.employeeName }}</p>
                <p class="text-xs text-slate-400">{{ c.date }}</p>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p class="text-xs text-slate-400">Original</p>
              <p class="text-slate-600">{{ c.originalCheckIn }} - {{ c.originalCheckOut }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-400">Requested</p>
              <p class="text-slate-800 font-medium">
                {{ c.requestedCheckIn }} - {{ c.requestedCheckOut }}
              </p>
            </div>
          </div>
          <p class="text-xs text-slate-500">Reason: {{ c.reason }}</p>
          <div class="flex gap-2 pt-1">
            <button
              class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200 hover:bg-emerald-100"
              @click="handleApproveCorrection(c)"
            >
              <CheckCircleIcon class="w-3.5 h-3.5" /> Approve
            </button>
            <button
              class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-200 hover:bg-red-100"
              @click="handleRejectCorrection(c)"
            >
              <XCircleIcon class="w-3.5 h-3.5" /> Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
