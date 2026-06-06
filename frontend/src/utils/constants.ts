export const TASK_STATES = [
  'pending',
  'in_progress',
  'blocked',
  'escalated',
  'completed',
  'reviewed',
] as const
export type TaskState = (typeof TASK_STATES)[number]

export const TICKET_STATES = ['open', 'in_review', 'escalated', 'resolved', 'closed'] as const
export type TicketState = (typeof TICKET_STATES)[number]

export const RESCUE_SEVERITIES = ['soft', 'warning', 'high_risk', 'admin_escalation'] as const
export type RescueSeverity = (typeof RESCUE_SEVERITIES)[number]

export const TASK_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const
export type TaskPriority = (typeof TASK_PRIORITIES)[number]

export const FREQUENCIES = ['daily', 'weekly', 'monthly'] as const
export type Frequency = (typeof FREQUENCIES)[number]

export const WORK_MODES = ['wfo', 'wfh'] as const
export type WorkMode = (typeof WORK_MODES)[number]

export const ATTENDANCE_STATUSES = ['present', 'late', 'absent', 'on_leave'] as const
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number]

export const LEAVE_TYPES = ['Sick Leave', 'Casual Leave', 'Annual Leave', 'Other'] as const
export type LeaveType = (typeof LEAVE_TYPES)[number]

export const LANGUAGES = ['en', 'hi', 'hinglish'] as const
export type Language = (typeof LANGUAGES)[number]
