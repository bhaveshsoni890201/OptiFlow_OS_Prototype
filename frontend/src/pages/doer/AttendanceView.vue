<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from '../../stores/useStore'
import { useLoadingTimeout } from '../../composables/useLoadingTimeout'
import { useAttendanceStore } from '../../stores/attendanceStore'
import type { AttendanceLog, AttendanceStatus } from '../../types'
import OptSkeleton from '../../components/common/OptSkeleton.vue'
import { formatDateWithWeekday, formatDateShort } from '../../utils/formatters'
import OptEmptyState from '../../components/common/OptEmptyState.vue'
import {
  CalendarDaysIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  DocumentArrowUpIcon,
  ChevronDownIcon,
} from '@heroicons/vue/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/vue/24/solid'

const { t } = useI18n()
const store = useStore()
const attendanceStore = useAttendanceStore()
const currentEmployee = computed(() => store.user.employee)

const loading = ref(false)
const error = ref('')
const now = ref(new Date())
const today = computed(() => now.value.toISOString().split('T')[0])

const viewMode = ref<'calendar' | 'list'>('list')
const calendarMonth = ref(5)
const calendarYear = ref(2026)
const showCorrectionForm = ref(false)
const correctionRecord = ref('')
const correctionCheckIn = ref('')
const correctionCheckOut = ref('')
const correctionReason = ref('')
const correctionAttachment = ref<File | null>(null)
const correctionErrors = ref<Record<string, string>>({})
const correctionSubmitted = ref(false)
const selectedDetailDay = ref<string | null>(null)
const showDetailPanel = ref(false)

const monthKeys = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
]

const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

const totalHoursToday = computed(() => {
  if (attendanceStore.checkInTime && attendanceStore.checkOutTime) {
    const [cih, cim] = attendanceStore.checkInTime.split(':').map(Number)
    const [coh, com] = attendanceStore.checkOutTime.split(':').map(Number)
    const diff = coh * 60 + com - (cih * 60 + cim)
    return `${Math.floor(diff / 60)}h ${diff % 60}m`
  }
  if (attendanceStore.checkInTime && attendanceStore.attendanceState === 'checked_in') {
    const [cih, cim] = attendanceStore.checkInTime.split(':').map(Number)
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
    const diff = nowMin - (cih * 60 + cim)
    if (diff > 0) return t('attendance.runningDuration', { hours: Math.floor(diff / 60), minutes: diff % 60 })
  }
  return '--'
})

function handleCheckInOut() {
  if (
    attendanceStore.attendanceState === 'not_checked_in' ||
    attendanceStore.attendanceState === 'checked_out'
  ) {
    attendanceStore.checkIn()
  } else {
    attendanceStore.checkOut()
  }
}

function toggleWorkMode() {
  attendanceStore.toggleWorkMode()
}

function prevMonth() {
  if (calendarMonth.value === 0) {
    calendarMonth.value = 11
    calendarYear.value--
  } else calendarMonth.value--
}

function nextMonth() {
  if (calendarMonth.value === 11) {
    calendarMonth.value = 0
    calendarYear.value++
  } else calendarMonth.value++
}

function getLogForDay(day: number): AttendanceLog | undefined {
  return attendanceStore.getLogForDay(calendarYear.value, calendarMonth.value, day)
}

function statusColor(status?: AttendanceStatus): string {
  switch (status) {
    case 'present':
      return 'bg-success-600'
    case 'late':
      return 'bg-warning-500'
    case 'absent':
      return 'bg-danger-500'
    case 'on_leave':
      return 'bg-info-600'
    default:
      return 'bg-neutral-200'
  }
}

function statusLabel(status?: AttendanceStatus): string {
  switch (status) {
    case 'present':
      return 'P'
    case 'late':
      return 'L'
    case 'absent':
      return 'A'
    case 'on_leave':
      return 'LV'
    default:
      return ''
  }
}

function statusText(status?: AttendanceStatus): string {
  switch (status) {
    case 'present':
      return t('attendance.statusLabels.present')
    case 'late':
      return t('attendance.statusLabels.late')
    case 'absent':
      return t('attendance.statusLabels.absent')
    case 'on_leave':
      return t('attendance.statusLabels.onLeave')
    default:
      return t('attendance.statusLabels.noRecord')
  }
}

function daysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function firstDayOfMonth(month: number, year: number): number {
  return new Date(year, month, 1).getDay()
}

function calendarDays(): (number | null)[] {
  const total = daysInMonth(calendarMonth.value, calendarYear.value)
  const start = firstDayOfMonth(calendarMonth.value, calendarYear.value)
  const days: (number | null)[] = []
  for (let i = 0; i < start; i++) days.push(null)
  for (let d = 1; d <= total; d++) days.push(d)
  return days
}

const monthLogs = computed(() => {
  const m = String(calendarMonth.value + 1).padStart(2, '0')
  const y = String(calendarYear.value)
  return attendanceStore.logs
    .filter((l) => l.date.startsWith(`${y}-${m}`))
    .sort((a, b) => b.date.localeCompare(a.date))
})

function selectDay(log: AttendanceLog) {
  selectedDetailDay.value = log.date
  showDetailPanel.value = true
}

function openCorrectionForm() {
  showCorrectionForm.value = true
  correctionSubmitted.value = false
  correctionErrors.value = {}
  correctionRecord.value = ''
  correctionCheckIn.value = ''
  correctionCheckOut.value = ''
  correctionReason.value = ''
  correctionAttachment.value = null
}

function submitCorrection() {
  correctionErrors.value = {}
  if (!correctionRecord.value) correctionErrors.value['record'] = t('attendance.correctionForm.validation.recordRequired')
  if (!correctionReason.value) correctionErrors.value['reason'] = t('attendance.correctionForm.validation.reasonRequired')
  if (Object.keys(correctionErrors.value).length > 0) return
  attendanceStore.submitCorrection({
    record: correctionRecord.value,
    checkIn: correctionCheckIn.value,
    checkOut: correctionCheckOut.value,
    reason: correctionReason.value,
  })
  correctionSubmitted.value = true
}

function handleFileUpload(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) correctionAttachment.value = input.files[0]
}

const { timedOut, startTimeout, clearTimeout: clearLoadTimeout } = useLoadingTimeout(8000)

async function fetchAttendance() {
  loading.value = true
  error.value = ''
  startTimeout()
  try {
    await Promise.all([
      attendanceStore.fetchLogs(),
      attendanceStore.fetchCorrections(),
    ])
    if (timedOut.value) throw new Error('Request timed out')
  } catch {
    error.value = timedOut.value ? 'Request timed out. Please try again.' : t('attendance.loadError')
  }
  clearLoadTimeout()
  loading.value = false
}

onMounted(() => {
  fetchAttendance()
})
</script>

<template>
  <div class="flex items-center justify-between">
      <h1 class="text-h2 text-neutral-900">{{ $t('attendance.title') }}</h1>
      <div class="flex items-center gap-2">
        <button
          class="p-2 rounded-lg transition-colors"
          :class="
            viewMode === 'list' ? 'bg-brand-50 text-brand-700' : 'text-neutral-400 hover:text-neutral-600'
          "
          @click="viewMode = 'list'"
          aria-label="List view"
        >
          <svg
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
        </button>
        <button
          class="p-2 rounded-lg transition-colors"
          :class="
            viewMode === 'calendar'
              ? 'bg-brand-50 text-brand-700'
              : 'text-neutral-400 hover:text-neutral-600'
          "
          @click="viewMode = 'calendar'"
          aria-label="Calendar view"
        >
          <CalendarDaysIcon class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Tablet summary (inline, between lg and xl) -->
    <div class="hidden lg:block xl:hidden space-y-4 mb-4 sm:mb-6">
      <div class="bg-white rounded-lg shadow-card p-4 sm:p-6">
        <h3 class="text-h3 text-neutral-900 mb-3">{{ $t('attendance.summary') }}</h3>
        <div class="space-y-3 text-caption">
          <div class="flex justify-between">
            <span class="text-neutral-500">{{ $t('attendance.thisMonth') }}</span
            ><span class="font-semibold text-neutral-900">18 days</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-500">{{ $t('attendance.statusLabels.present') }}</span
            ><span class="font-semibold text-success-600">15</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-500">{{ $t('attendance.statusLabels.late') }}</span
            ><span class="font-semibold text-warning-500">2</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-500">{{ $t('attendance.statusLabels.absent') }}</span
            ><span class="font-semibold text-danger-600">1</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-500">{{ $t('attendance.statusLabels.leave') }}</span
            ><span class="font-semibold text-info-600">1</span>
          </div>
          <div
            v-if="attendanceStore.pendingCorrectionCount > 0"
            class="flex justify-between pt-2 border-t border-neutral-100"
          >
            <span class="text-neutral-500">{{ $t('attendance.correctionStatus.pending') }}</span>
            <span class="font-semibold text-warning-500">{{ attendanceStore.pendingCorrectionCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
      <div class="xl:col-span-2 space-y-4 sm:space-y-6">
        <div class="bg-white rounded-lg shadow-card p-4 sm:p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-h3 text-neutral-900">{{ $t('attendance.today') }}</h2>
            <span class="text-caption text-neutral-500">{{ formatDateWithWeekday(now) }}</span>
          </div>

          <!-- Loading state -->
          <div v-if="loading" class="space-y-3 py-4" aria-live="polite">
            <OptSkeleton variant="rectangular" height="80px" />
            <OptSkeleton variant="rectangular" height="40px" />
          </div>

          <!-- Error state -->
          <div v-else-if="error" class="text-center py-6" role="alert" aria-live="polite">
            <ExclamationCircleIcon class="h-10 w-10 text-danger-400 mx-auto mb-2" />
            <p class="text-body-strong text-neutral-900 mb-1">{{ $t('attendance.failedToLoad') }}</p>
            <p class="text-caption text-neutral-500">{{ error }}</p>
            <button
              class="mt-3 px-4 py-2 bg-brand-600 text-white rounded-lg text-button hover:bg-brand-700 transition-colors"
              @click="fetchAttendance"
            >
              {{ $t('common.retry') }}
            </button>
          </div>

          <div v-else-if="attendanceStore.attendanceState === 'on_leave'" class="text-center py-6">
            <div
              class="inline-flex items-center justify-center h-14 w-14 rounded-full bg-info-50 text-info-600 mb-3"
            >
              <XCircleIcon class="h-7 w-7" />
            </div>
            <p class="text-body-strong text-neutral-900">{{ $t('attendance.onLeaveToday') }}</p>
            <p class="text-caption text-neutral-500">{{ $t('attendance.sickLeaveApproved', { name: 'Anjali Patel' }) }}</p>
          </div>

          <div v-else class="space-y-4">
            <div class="flex flex-col sm:flex-row items-center gap-4">
              <button
                class="h-20 w-20 sm:h-24 sm:w-24 rounded-full font-bold text-button transition-all active:scale-95 flex-shrink-0"
                :class="
                  attendanceStore.attendanceState === 'checked_in'
                    ? 'bg-danger-50 text-danger-600 hover:bg-danger-100 border-2 border-danger-500'
                    : 'bg-brand-50 text-brand-700 hover:bg-brand-100 border-2 border-brand-600'
                "
                @click="handleCheckInOut"
              >
                <div class="flex flex-col items-center">
                  <template
                    v-if="attendanceStore.attendanceState === 'not_checked_in' || attendanceStore.attendanceState === 'checked_out'"
                  >
                    <CheckCircleIcon class="h-6 w-6 mb-0.5" />
                    <span class="text-[11px]">{{ $t('attendance.checkIn') }}</span>
                  </template>
                  <template v-else>
                    <XCircleIcon class="h-6 w-6 mb-0.5" />
                    <span class="text-[11px]">{{ $t('attendance.checkOut') }}</span>
                  </template>
                </div>
              </button>

              <div class="flex-1 text-center sm:text-left">
                <div class="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <span class="text-body-strong text-neutral-900">
                    {{
                      attendanceStore.attendanceState === 'checked_in'
                        ? $t('attendance.checkedIn')
                        : attendanceStore.attendanceState === 'checked_out'
                          ? $t('attendance.checkedOut')
                          : $t('attendance.notCheckedIn')
                    }}
                  </span>
                  <span
                    v-if="attendanceStore.isLate"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-danger-50 text-danger-600 text-caption font-semibold"
                  >
                    <ExclamationCircleIcon class="h-3.5 w-3.5" />
                    {{ $t('attendance.lateBy', { minutes: attendanceStore.lateMinutes }) }}
                  </span>
                </div>
                <div
                  class="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-caption text-neutral-500"
                >
                  <span v-if="attendanceStore.checkInTime" class="flex items-center gap-1">
                    <ClockIcon class="h-3.5 w-3.5" /> {{ $t('attendance.inTime', { time: attendanceStore.checkInTime }) }}
                  </span>
                  <span v-if="attendanceStore.checkOutTime" class="flex items-center gap-1">
                    <ClockIcon class="h-3.5 w-3.5" /> {{ $t('attendance.outTime', { time: attendanceStore.checkOutTime }) }}
                  </span>
                  <span class="flex items-center gap-1 font-semibold text-neutral-700">
                    <ArrowPathIcon class="h-3.5 w-3.5" /> {{ totalHoursToday }}
                  </span>
                </div>
              </div>
            </div>

            <div
              class="flex items-center justify-center sm:justify-start gap-2 pt-2 border-t border-neutral-100"
            >
              <span class="text-caption text-neutral-500">{{ $t('attendance.workMode') }}</span>
              <button
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                :class="attendanceStore.workMode === 'wfo' ? 'bg-brand-600' : 'bg-neutral-300'"
                @click="toggleWorkMode"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="attendanceStore.workMode === 'wfo' ? 'translate-x-6' : 'translate-x-1'"
                />
              </button>
              <span class="text-body-strong text-neutral-700">{{
                attendanceStore.workMode === 'wfo' ? $t('attendance.workFromOffice') : $t('attendance.workFromHome')
              }}</span>
            </div>
          </div>
        </div>

        <div v-if="viewMode === 'calendar'" class="bg-white rounded-lg shadow-card p-4 sm:p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-h3 text-neutral-900">{{ $t('attendance.history') }}</h2>
            <div class="flex items-center gap-1">
              <button class="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500" @click="prevMonth" aria-label="Previous month">
                <ChevronLeftIcon class="h-4 w-4" />
              </button>
              <span class="text-body-strong text-neutral-700 w-32 text-center"
                >{{ $t('attendance.months.' + monthKeys[calendarMonth]) }} {{ calendarYear }}</span
              >
              <button class="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500" @click="nextMonth" aria-label="Next month">
                <ChevronRightIcon class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div class="grid grid-cols-7 gap-1 text-center">
            <div
              v-for="d in dayKeys"
              :key="d"
              class="text-caption text-neutral-400 py-1"
            >
              {{ $t('attendance.days.' + d) }}
            </div>
            <template v-for="(day, idx) in calendarDays()" :key="idx">
              <div v-if="day === null" class="p-1" />
              <div
                v-else
                class="relative p-1 sm:p-2 rounded-lg cursor-pointer transition-colors hover:bg-neutral-50"
                :class="{
                  'ring-2 ring-brand-600':
                    selectedDetailDay ===
                    `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                }"
                @click="
                  selectedDetailDay = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                "
              >
                <span class="text-caption font-medium text-neutral-700">{{ day }}</span>
                <div v-if="getLogForDay(day)" class="flex justify-center gap-0.5 mt-0.5">
                  <span
                    class="inline-block h-3 w-3 rounded-full ring-1 ring-white"
                    :class="statusColor(getLogForDay(day)?.status)"
                  />
                </div>
              </div>
            </template>
          </div>

          <div
            class="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-neutral-100 text-caption text-neutral-500"
          >
            <span class="flex items-center gap-1"
              ><span class="inline-block h-2 w-2 rounded-full bg-success-600" /> {{ $t('attendance.statusLabels.present') }}</span
            >
            <span class="flex items-center gap-1"
              ><span class="inline-block h-2 w-2 rounded-full bg-warning-500" /> {{ $t('attendance.statusLabels.late') }}</span
            >
            <span class="flex items-center gap-1"
              ><span class="inline-block h-2 w-2 rounded-full bg-danger-500" /> {{ $t('attendance.statusLabels.absent') }}</span
            >
            <span class="flex items-center gap-1"
              ><span class="inline-block h-2 w-2 rounded-full bg-info-600" /> {{ $t('attendance.statusLabels.leave') }}</span
            >
          </div>

          <div v-if="selectedDetailDay" class="mt-4 pt-4 border-t border-neutral-100">
            <div
              v-for="log in monthLogs.filter((l) => l.date === selectedDetailDay)"
              :key="log.id"
              class="flex items-center justify-between p-3 rounded-lg bg-neutral-50"
            >
              <div class="flex items-center gap-3">
                <span
                  class="inline-block h-2.5 w-2.5 rounded-full"
                  :class="statusColor(log.status)"
                />
                <div>
                  <p class="text-body-strong text-neutral-900">{{ statusText(log.status) }}</p>
                  <p class="text-caption text-neutral-500">
                    {{ $t('attendance.logDisplay', { checkIn: log.check_in || '--', checkOut: log.check_out || '--' }) }}
                    <span v-if="log.work_mode" class="ml-1"
                      >· {{ log.work_mode === 'wfo' ? $t('attendance.office') : $t('attendance.home') }}</span
                    >
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span
                  v-if="log.late_minutes > 0"
                  class="text-caption text-danger-600 font-semibold whitespace-nowrap"
                  >{{ $t('attendance.lateMinutes', { m: log.late_minutes }) }}</span
                >
                <template v-if="attendanceStore.getCorrectionStatus(log.id)">
                  <span
                    class="text-caption font-semibold whitespace-nowrap"
                    :class="
                      attendanceStore.getCorrectionStatus(log.id) === 'approved'
                        ? 'text-success-600'
                        : attendanceStore.getCorrectionStatus(log.id) === 'rejected'
                          ? 'text-danger-600'
                          : 'text-warning-500'
                    "
                  >
                    {{
                      attendanceStore.getCorrectionStatus(log.id) === 'pending'
                        ? $t('attendance.correctionStatus.correctionPending')
                        : attendanceStore.getCorrectionStatus(log.id) === 'approved'
                          ? $t('attendance.correctionStatus.corrected')
                          : $t('attendance.correctionStatus.rejected')
                    }}
                  </span>
                </template>
                <button
                  v-else-if="log.check_in || log.status === 'absent'"
                  class="text-caption text-brand-600 hover:text-brand-700 font-semibold whitespace-nowrap"
                  @click="openCorrectionForm"
                >
                  {{ $t('attendance.requestCorrection') }}
                </button>
              </div>
            </div>
            <div
              v-if="!monthLogs.filter((l) => l.date === selectedDetailDay).length"
              class="text-center py-4"
            >
              <p class="text-caption text-neutral-400">{{ $t('attendance.noRecordForDate') }}</p>
            </div>
          </div>
        </div>

        <div v-if="viewMode === 'list'" class="bg-white rounded-lg shadow-card p-4 sm:p-6">
          <h2 class="text-h3 text-neutral-900 mb-4">{{ $t('attendance.recentRecords') }}</h2>
          <OptEmptyState v-if="monthLogs.length === 0" type="attendance" :title="$t('attendance.noRecords')" :description="$t('attendance.noLogs')" />
          <div v-else class="space-y-2">
            <div
              v-for="log in monthLogs"
              :key="log.id"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
              @click="selectDay(log)"
            >
              <div class="flex items-center gap-3">
                <span
                  class="inline-block h-2.5 w-2.5 rounded-full"
                  :class="statusColor(log.status)"
                />
                <div>
                  <p class="text-body-strong text-neutral-900">
                    {{
                      formatDateWithWeekday(log.date)
                    }}
                  </p>
                  <p class="text-caption text-neutral-500">
                    {{ $t('attendance.logDisplay', { checkIn: log.check_in || '--', checkOut: log.check_out || '--' }) }}
                    <span v-if="log.work_mode" class="ml-1"
                      >· {{ log.work_mode === 'wfo' ? $t('attendance.office') : $t('attendance.home') }}</span
                    >
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span
                  class="text-caption font-semibold"
                  :class="
                    log.status === 'late'
                      ? 'text-warning-500'
                      : log.status === 'absent'
                        ? 'text-danger-600'
                        : log.status === 'on_leave'
                          ? 'text-info-600'
                          : 'text-success-600'
                  "
                >
                  {{ statusText(log.status) }}
                </span>
                <ChevronDownIcon class="h-4 w-4 text-neutral-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="hidden xl:block space-y-4">
        <div class="bg-white rounded-lg shadow-card p-4 sm:p-6">
          <h3 class="text-h3 text-neutral-900 mb-3">{{ $t('attendance.summary') }}</h3>
          <div class="space-y-3 text-caption">
            <div class="flex justify-between">
              <span class="text-neutral-500">{{ $t('attendance.thisMonth') }}</span
              ><span class="font-semibold text-neutral-900">18 days</span>
            </div>
            <div class="flex justify-between">
              <span class="text-neutral-500">{{ $t('attendance.statusLabels.present') }}</span
              ><span class="font-semibold text-success-600">15</span>
            </div>
            <div class="flex justify-between">
              <span class="text-neutral-500">{{ $t('attendance.statusLabels.late') }}</span
              ><span class="font-semibold text-warning-500">2</span>
            </div>
            <div class="flex justify-between">
              <span class="text-neutral-500">{{ $t('attendance.statusLabels.absent') }}</span
              ><span class="font-semibold text-danger-600">1</span>
            </div>
            <div class="flex justify-between">
              <span class="text-neutral-500">{{ $t('attendance.statusLabels.leave') }}</span
              ><span class="font-semibold text-info-600">1</span>
            </div>
            <div
              v-if="attendanceStore.pendingCorrectionCount > 0"
              class="flex justify-between pt-2 border-t border-neutral-100"
            >
              <span class="text-neutral-500">{{ $t('attendance.correctionStatus.pending') }}</span>
              <span class="font-semibold text-warning-500">{{ attendanceStore.pendingCorrectionCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <teleport to="body">
      <div
        v-if="showCorrectionForm"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 animate-fade-in"
        aria-hidden="true"
      >
        <div
          class="bg-white w-full sm:max-w-lg rounded-t-xl sm:rounded-lg shadow-modal max-h-[90vh] overflow-y-auto animate-slide-up"
          role="dialog" aria-modal="true" aria-label="Request Correction"
        >
          <div class="flex items-center justify-between p-4 border-b border-neutral-100">
            <h2 class="text-h3 text-neutral-900">{{ $t('attendance.correctionForm.title') }}</h2>
            <button
              class="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400"
              @click="showCorrectionForm = false"
              aria-label="Close"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>

          <div v-if="correctionSubmitted" class="p-6 text-center">
            <CheckCircleSolid class="h-12 w-12 text-success-600 mx-auto mb-3" />
            <p class="text-body-strong text-neutral-900 mb-1">{{ $t('attendance.correctionForm.submitted') }}</p>
            <p class="text-caption text-neutral-500">
              {{ $t('attendance.correctionForm.submittedMessage') }}
            </p>
            <button
              class="mt-4 w-full py-2.5 bg-brand-600 text-white rounded-lg text-button hover:bg-brand-700"
              @click="showCorrectionForm = false"
            >
              {{ $t('common.done') }}
            </button>
          </div>

          <form v-else class="p-4 space-y-4" @submit.prevent="submitCorrection">
            <div>
              <label class="block text-caption font-semibold text-neutral-700 mb-1"
                >{{ $t('attendance.correctionForm.selectRecord') }}</label
              >
              <select
                v-model="correctionRecord"
                class="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-body text-neutral-900 focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none"
                :class="correctionErrors['record'] ? 'border-danger-500' : ''"
                :id="'input-record'"
                :aria-describedby="correctionErrors['record'] ? 'error-record' : undefined"
              >
                <option value="">{{ $t('attendance.correctionForm.chooseDate') }}</option>
                <option v-for="log in monthLogs" :key="log.id" :value="log.id">
                  {{ log.date }} — {{ $t('attendance.logDisplay', { checkIn: log.check_in || '--', checkOut: log.check_out || '--' }) }} ({{
                    statusText(log.status)
                  }})
                </option>
              </select>
              <p v-if="correctionErrors['record']" class="text-caption text-danger-600 mt-1" :id="'error-record'">
                {{ correctionErrors['record'] }}
              </p>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-caption font-semibold text-neutral-700 mb-1"
                  >{{ $t('attendance.correctionForm.correctedCheckIn') }}</label
                >
                <input
                  v-model="correctionCheckIn"
                  type="time"
                  class="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-body text-neutral-900 focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none"
                />
              </div>
              <div>
                <label class="block text-caption font-semibold text-neutral-700 mb-1"
                  >{{ $t('attendance.correctionForm.correctedCheckOut') }}</label
                >
                <input
                  v-model="correctionCheckOut"
                  type="time"
                  class="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-body text-neutral-900 focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label class="block text-caption font-semibold text-neutral-700 mb-1"
                >{{ $t('attendance.correctionForm.reason') }} <span class="text-danger-500">*</span></label
              >
              <textarea
                v-model="correctionReason"
                rows="3"
                class="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-body text-neutral-900 focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none resize-none"
                :class="correctionErrors['reason'] ? 'border-danger-500' : ''"
                :placeholder="$t('attendance.correctionForm.reasonPlaceholder')"
                :id="'input-reason'"
                :aria-describedby="correctionErrors['reason'] ? 'error-reason' : undefined"
              />
              <p v-if="correctionErrors['reason']" class="text-caption text-danger-600 mt-1" :id="'error-reason'">
                {{ correctionErrors['reason'] }}
              </p>
            </div>

            <div>
              <label class="block text-caption font-semibold text-neutral-700 mb-1"
                >{{ $t('attendance.correctionForm.attachment') }}</label
              >
              <label
                class="flex items-center gap-2 px-3 py-2.5 border border-dashed border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50 text-body text-neutral-500"
              >
                <DocumentArrowUpIcon class="h-5 w-5" />
                <span>{{
                  correctionAttachment ? correctionAttachment.name : $t('attendance.correctionForm.uploadDocument')
                }}</span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  class="hidden"
                  @change="handleFileUpload"
                />
              </label>
            </div>

            <button
              type="submit"
              class="w-full py-2.5 bg-brand-600 text-white rounded-lg text-button hover:bg-brand-700 transition-colors"
            >
              {{ $t('attendance.correctionForm.submit') }}
            </button>
          </form>
        </div>
      </div>
    </teleport>
</template>
