import type { AttendanceLog, AttendanceCorrection } from '../types'
import { endpoints } from '../api/endpoints'
import { BaseService } from './BaseService'

class AttendanceService extends BaseService {
  protected entityName = 'Attendance'

  async getAttendanceLogs(): Promise<AttendanceLog[]> {
    return this.fetchList<AttendanceLog>(
      endpoints.attendance.history,
      async () => {
        const { attendanceLogs } = await import('../mock/attendance')
        return attendanceLogs
      },
      'attendance:logs',
    )
  }

  async getAttendanceCorrections(): Promise<AttendanceCorrection[]> {
    return this.fetchList<AttendanceCorrection>(
      endpoints.attendance.correction,
      async () => {
        const { attendanceCorrections } = await import('../mock/attendance')
        return attendanceCorrections
      },
      'attendance:corrections',
    )
  }

  async checkInSvc(workMode: string): Promise<void> {
    await this.mutate('post', endpoints.attendance.checkIn, { work_mode: workMode }, ['attendance:'])
  }

  async checkOutSvc(): Promise<void> {
    await this.mutate('post', endpoints.attendance.checkOut, undefined, ['attendance:'])
  }

  async submitAttendanceCorrection(data: {
    original_record_id: string
    requested_check_in?: string
    requested_check_out?: string
    reason: string
  }): Promise<void> {
    await this.mutate('post', endpoints.attendance.submitCorrection, data, ['attendance:'])
  }
}

const attendanceService = new AttendanceService()

export const getAttendanceLogs = () => attendanceService.getAttendanceLogs()
export const getAttendanceCorrections = () => attendanceService.getAttendanceCorrections()
export const checkInSvc = (workMode: string) => attendanceService.checkInSvc(workMode)
export const checkOutSvc = () => attendanceService.checkOutSvc()
export const submitAttendanceCorrection = (data: Parameters<AttendanceService['submitAttendanceCorrection']>[0]) =>
  attendanceService.submitAttendanceCorrection(data)
