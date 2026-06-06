
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AttendanceLog, AttendanceCorrection, WorkMode } from '../types'
import { getAttendanceLogs, getAttendanceCorrections } from '../services'
import { checkInSvc, checkOutSvc, submitAttendanceCorrection } from '../services/attendanceService'
import { logger } from '../utils/logger'
type AttendanceCheckState = 'not_checked_in' | 'checked_in' | 'checked_out' | 'on_leave'
function persistState(data: { checkInTime?: string; checkOutTime?: string; state?: string; workMode?: string; date?: string }): void {
try {
const existing = JSON.parse(sessionStorage.getItem('optiflow-attendance') || '{}')
sessionStorage.setItem('optiflow-attendance', JSON.stringify({ ...existing, ...data, _date: new Date().toISOString().split('T')[0] }))
} catch {
// sessionStorage unavailable (incognito, storage blocked)
}
}
function loadPersistedState(): { checkInTime?: string; checkOutTime?: string; state?: string; workMode?: string } | null {
try {
const data = JSON.parse(sessionStorage.getItem('optiflow-attendance') || 'null')
if (!data) return null
if (data._date !== new Date().toISOString().split('T')[0]) {
try { sessionStorage.removeItem('optiflow-attendance') } catch { /* ignore */ }
return null
}
return data
} catch { return null }
}
export const useAttendanceStore = defineStore('attendance', () => {
const logs = ref<AttendanceLog[]>([])
const corrections = ref<AttendanceCorrection[]>([])
const loading = ref(false)
const error = ref('')
const checkInTime = ref('')
const checkOutTime = ref('')
const attendanceState = ref<AttendanceCheckState>('not_checked_in')
const workMode = ref<WorkMode>('wfo')
const todayLog = computed(() => {
const today = new Date().toISOString().split('T')[0]
return logs.value.find((l) => l.date === today)
})
const isLate = computed(() => (todayLog.value?.late_minutes ?? 0) > 0)
const lateMinutes = computed(() => todayLog.value?.late_minutes ?? 0)
const pendingCorrectionCount = computed(
  () => corrections.value.filter((c) => c.status === 'pending').length,
)
function syncTodayState(): void {
const today = new Date().toISOString().split('T')[0]
const log = logs.value.find((l) => l.date === today)
  if (log) {
    checkInTime.value = log.check_in || ''
    checkOutTime.value = log.check_out || ''
    workMode.value = log.work_mode || 'wfo'
    if (log.status === 'on_leave') {
      attendanceState.value = 'on_leave'
    } else if (log.check_in && log.check_out) {
      attendanceState.value = 'checked_out'
    } else if (log.check_in) {
      attendanceState.value = 'checked_in'
    } else {
      attendanceState.value = 'not_checked_in'
    }
  } else {
    checkInTime.value = ''
    checkOutTime.value = ''
    attendanceState.value = 'not_checked_in'
  }

  // Apply persisted state overrides (from manual check-in/out/work-mode changes)
  const persisted = loadPersistedState()
  if (persisted) {
    if (persisted.checkInTime) checkInTime.value = persisted.checkInTime
    if (persisted.checkOutTime) checkOutTime.value = persisted.checkOutTime
    if (persisted.state) attendanceState.value = persisted.state as AttendanceCheckState
    if (persisted.workMode) workMode.value = persisted.workMode as WorkMode
  }
}
async function fetchLogs(): Promise<void> {
loading.value = true
error.value = ''
try {
logs.value = await getAttendanceLogs()
  syncTodayState()
} catch (e) {
error.value = 'Failed to load attendance logs'
logger.error('AttendanceStore', 'Failed to fetch attendance logs', e)
} finally {
loading.value = false
}
}
async function fetchCorrections(): Promise<void> {
error.value = ''
try {
corrections.value = await getAttendanceCorrections()
} catch (e) {
error.value = 'Failed to load corrections'
logger.error('AttendanceStore', 'Failed to fetch corrections', e)
}
}
  async function checkIn() {
      const now = new Date()
      const time = now.toTimeString().slice(0, 5)
      const today = now.toISOString().split('T')[0]
      const prevCheckInTime = checkInTime.value
      const prevCheckOutTime = checkOutTime.value
      const prevState = attendanceState.value
      const prevLogIdx = logs.value.findIndex((l) => l.date === today)
      const prevLogBackup = prevLogIdx >= 0 ? { ...logs.value[prevLogIdx] } : null
      checkInTime.value = time
      checkOutTime.value = ''
      attendanceState.value = 'checked_in'
      const existing = logs.value.findIndex((l) => l.date === today)
      if (existing >= 0) {
        logs.value[existing].check_in = time
        logs.value[existing].check_out = undefined
        if (logs.value[existing].status !== 'on_leave') {
          logs.value[existing].status = 'present'
        }
      } else {
        logs.value.unshift({
          id: `ATT-${Date.now()}`,
          employee_id: '',
          date: today,
          check_in: time,
          work_mode: workMode.value,
          late_minutes: 0,
          status: 'present',
        })
      }
      try {
        await checkInSvc(workMode.value)
      } catch {
        checkInTime.value = prevCheckInTime
        checkOutTime.value = prevCheckOutTime
        attendanceState.value = prevState
        if (prevLogBackup) {
          const idx = logs.value.findIndex((l) => l.date === today)
          if (idx >= 0) Object.assign(logs.value[idx], prevLogBackup)
        } else {
          logs.value = logs.value.filter((l) => l.date !== today)
        }
      }
      persistState({ checkInTime: checkInTime.value, state: attendanceState.value, workMode: workMode.value })
    }
  async function checkOut() {
      const now = new Date()
      const time = now.toTimeString().slice(0, 5)
      const today = now.toISOString().split('T')[0]
      const prevCheckOutTime = checkOutTime.value
      const prevState = attendanceState.value
      const prevLogIdx = logs.value.findIndex((l) => l.date === today)
      const prevLogBackup = prevLogIdx >= 0 ? { ...logs.value[prevLogIdx] } : null
      checkOutTime.value = time
      attendanceState.value = 'checked_out'
      const existing = logs.value.findIndex((l) => l.date === today)
      if (existing >= 0) {
        logs.value[existing].check_out = time
      }
      try {
        await checkOutSvc()
      } catch {
        checkOutTime.value = prevCheckOutTime
        attendanceState.value = prevState
        if (prevLogBackup) {
          const idx = logs.value.findIndex((l) => l.date === today)
          if (idx >= 0) Object.assign(logs.value[idx], prevLogBackup)
        }
      }
      persistState({ checkOutTime: checkOutTime.value, state: attendanceState.value })
    }
function toggleWorkMode() {
workMode.value = workMode.value === 'wfo' ? 'wfh' : 'wfo'
const today = new Date().toISOString().split('T')[0]
const existing = logs.value.find((l) => l.date === today)
if (existing) {
existing.work_mode = workMode.value
}
persistState({ workMode: workMode.value })
}
async function submitCorrection(data: {
record: string,
checkIn: string,
checkOut: string,
reason: string,
}): Promise<void> {
error.value = ''
try {
const originalLog = logs.value.find((l) => l.id === data.record)
await submitAttendanceCorrection({
original_record_id: data.record,
requested_check_in: data.checkIn || undefined,
requested_check_out: data.checkOut || undefined,
reason: data.reason,
})
corrections.value.push({
id: `CORR-${Date.now()}`,
employee_id: originalLog?.employee_id ?? '',
original_record_id: data.record,
original_check_in: originalLog?.check_in,
original_check_out: originalLog?.check_out,
requested_check_in: data.checkIn || undefined,
requested_check_out: data.checkOut || undefined,
reason: data.reason,
status: 'pending',
})
} catch (e) {
error.value = 'Failed to submit correction'
logger.error('AttendanceStore', 'Failed to submit correction', e)
}
}
function getCorrectionStatus(
recordId: string,
): 'pending' | 'approved' | 'rejected' | undefined {
return corrections.value.find((c) => c.original_record_id === recordId)?.status
}
function getLogForDay(year: number, month: number, day: number): AttendanceLog | undefined {
const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
return logs.value.find((l) => l.date === dateStr)
}

syncTodayState()

return {
logs,
corrections,
loading,
error,
checkInTime,
checkOutTime,
attendanceState,
workMode,
todayLog,
isLate,
lateMinutes,
pendingCorrectionCount,
fetchLogs,
fetchCorrections,
checkIn,
checkOut,
toggleWorkMode,
submitCorrection,
getCorrectionStatus,
getLogForDay,
}
})
