import type { AttendanceLog, AttendanceCorrection } from '../types'

function dateStr(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().split('T')[0]
}

const employees = [
  { id: 'EMP-0001', name: 'Ramesh Kumar' },
  { id: 'EMP-0002', name: 'Priya Sharma' },
  { id: 'EMP-0003', name: 'Anjali Patel' },
  { id: 'EMP-0004', name: 'Raj Mehta' },
  { id: 'EMP-0005', name: 'Suresh Reddy' },
  { id: 'EMP-0006', name: 'Deepika Singh' },
  { id: 'EMP-0007', name: 'Vikram Joshi' },
  { id: 'EMP-0008', name: 'Meena Devi' },
]

const checkInTimes = ['07:00', '07:05', '07:10', '07:15', '07:30', '08:30', '08:45', '08:55', '09:00', '09:15']
const checkOutTimes = ['15:00', '15:15', '15:25', '15:30', '15:45', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30']

export const attendanceLogs: AttendanceLog[] = (() => {
  const logs: AttendanceLog[] = []
  let idCounter = 0

  for (const emp of employees) {
    for (let offset = 0; offset >= -30; offset--) {
      idCounter++
      const d = dateStr(offset)
      if (offset === -6) {
        logs.push({
          id: `ATT-${String(idCounter).padStart(4, '0')}`,
          employee_id: emp.id,
          date: d,
          work_mode: 'wfo',
          late_minutes: 0,
          status: 'absent',
        })
      } else if (offset === -8 || offset === -15) {
        logs.push({
          id: `ATT-${String(idCounter).padStart(4, '0')}`,
          employee_id: emp.id,
          date: d,
          work_mode: 'wfo',
          late_minutes: 0,
          status: 'on_leave',
        })
      } else {
        const isWfh = offset % 10 === 0
        const ci = isWfh && emp.id === 'EMP-0003' ? '08:55' : checkInTimes[idCounter % checkInTimes.length]
        const co = checkOutTimes[idCounter % checkOutTimes.length]
        const isLate = idCounter % 7 === 0
        logs.push({
          id: `ATT-${String(idCounter).padStart(4, '0')}`,
          employee_id: emp.id,
          date: d,
          check_in: ci,
          check_out: co,
          work_mode: isWfh ? 'wfh' : 'wfo',
          late_minutes: isLate ? 10 : 0,
          status: isLate ? 'late' : 'present',
        })
      }
    }
  }

  return logs
})()

export const attendanceCorrections: AttendanceCorrection[] = [
  {
    id: 'CORR-0001',
    employee_id: 'EMP-0008',
    original_record_id: 'ATT-0001',
    original_check_in: '09:05',
    original_check_out: '17:30',
    requested_check_in: '09:00',
    requested_check_out: '18:00',
    reason: 'Punched in late because biometric machine was not working. Was on the floor since 8:50 AM.',
    status: 'pending',
  },
  {
    id: 'CORR-0002',
    employee_id: 'EMP-0001',
    original_record_id: 'ATT-0002',
    original_check_in: '09:15',
    requested_check_in: '08:55',
    reason: 'Was in the factory since 8:30 AM but had a visitor meeting at the gate. Forgot to punch in immediately.',
    status: 'pending',
  },
  {
    id: 'CORR-0003',
    employee_id: 'EMP-0003',
    original_record_id: 'ATT-0003',
    original_check_in: '09:10',
    original_check_out: '17:20',
    requested_check_in: '08:55',
    requested_check_out: '17:30',
    reason: 'Arrived at 8:45 but biometric server was down. Clocked in after restart.',
    status: 'approved',
    reviewed_by: 'EMP-0001',
    reviewed_on: new Date().toISOString(),
  },
]
