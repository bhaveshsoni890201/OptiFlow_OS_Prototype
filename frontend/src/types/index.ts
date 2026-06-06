// Enums
export type TaskType = 'delegation' | 'checklist' | 'fms'
export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'blocked'
  | 'escalated'
  | 'completed'
  | 'reviewed'
export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type TicketStatus = 'open' | 'in_review' | 'escalated' | 'resolved' | 'closed'
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'escalated' | 'archived'
export type AttendanceStatus = 'present' | 'late' | 'absent' | 'on_leave'
export type WorkMode = 'wfo' | 'wfh'
export type Frequency = 'daily' | 'weekly' | 'monthly'
export type TrainingStatus = 'not_started' | 'in_progress' | 'completed'
export type RescueSeverity = 'soft' | 'warning' | 'high_risk' | 'admin_escalation'
export type Role = 'doer' | 'captain' | 'admin'
export type Language = 'en' | 'hi' | 'hinglish'

// Core Entities
export interface Employee {
  employee_id: string
  name: string
  mobile: string
  email?: string
  department: string
  designation: string
  reporting_captain: string
  roles: Role[]
  status: 'active' | 'disabled' | 'offboarded'
  avatar?: string
  bank_details?: BankDetails
  created_on: string
  last_active?: string
}

export interface BankDetails {
  account_holder: string
  account_number: string
  ifsc: string
  bank_name: string
}

export interface DelegationTask {
  id: string
  title: string
  description?: string
  priority: Priority
  due_date: string
  next_follow_up?: string
  assigned_to: string
  assigned_by: string
  status: TaskStatus
  escalation_level: number
  last_activity: string
  reminder_count: number
  attachments?: Attachment[]
  created_on: string
  type: 'delegation'
}

export interface ChecklistItem {
  id: string
  worklist_item_id: string
  title: string
  description?: string
  frequency: Frequency
  due_date: string
  status: TaskStatus
  completed_on?: string
  next_due?: string
  assigned_to: string
  type: 'checklist'
}

export interface FMSTask {
  id: string
  title: string
  description?: string
  workflow: string
  stage: string
  action_required: string
  due_date: string
  assigned_to: string
  status: TaskStatus
  type: 'fms'
}

export type Task = DelegationTask | ChecklistItem | FMSTask

export interface Worklist {
  id: string
  title: string
  description?: string
  kpi?: string
  frequency: Frequency
  assigned_to: string
  assigned_by: string
  sop_link?: string
  estimated_effort?: string
  active: boolean
  start_date: string
  created_on: string
}

export interface RescueRecord {
  id: string
  task_id: string
  task_title: string
  task_type: TaskType
  employee_id: string
  employee_name: string
  delay_days: number
  priority: Priority
  last_activity: string
  reminder_count: number
  severity: RescueSeverity
  carry_forward_risk: boolean
  created_on: string
  resolved_on?: string
}

export interface AttendanceLog {
  id: string
  employee_id: string
  date: string
  check_in?: string
  check_out?: string
  work_mode: WorkMode
  late_minutes: number
  status: AttendanceStatus
}

export interface AttendanceCorrection {
  id: string
  employee_id: string
  original_record_id: string
  original_check_in?: string
  original_check_out?: string
  requested_check_in?: string
  requested_check_out?: string
  reason: string
  attachment?: Attachment
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by?: string
  reviewed_on?: string
}

export interface LeaveRequest {
  id: string
  employee_id: string
  employee_name: string
  leave_type: string
  start_date: string
  end_date: string
  total_days: number
  reason: string
  buddy_id: string
  buddy_name: string
  status: LeaveStatus
  reviewed_by?: string
  reviewed_on?: string
  rejection_reason?: string
  created_on: string
}

export interface BuddyTransfer {
  id: string
  leave_request_id: string
  original_owner: string
  buddy_owner: string
  task_reference: string
  transfer_start: string
  transfer_end: string
  reverted: boolean
}

export interface HelpTicket {
  id: string
  category: string
  subject: string
  description: string
  raised_by: string
  attachments?: Attachment[]
  status: TicketStatus
  priority: Priority
  assigned_to?: string
  comments: TicketComment[]
  resolution_notes?: string
  satisfaction_score?: number
  resolved_on?: string
  created_on: string
  updated_on: string
}

export interface TicketComment {
  id: string
  author: string
  text: string
  created_on: string
}

export interface TrainingAssignment {
  id: string
  employee_id: string
  training_content_id: string
  title: string
  type: 'sop' | 'video' | 'guide'
  source: 'standalone' | 'worklist'
  worklist_item_id?: string
  deadline: string
  status: TrainingStatus
  completed_on?: string
}

export interface TrainingContent {
  id: string
  type: 'sop' | 'video' | 'guide'
  title: string
  body?: string
  videoUrl?: string
}

export interface CaptainKPISnapshot {
  id: string
  captain_id: string
  week_start: string
  rescue_reduction: number
  recovery_speed: number
  team_efficiency: number
  composite_index: number
}

export interface Notification {
  id: string
  type: 'task' | 'rescue' | 'leave' | 'ticket' | 'system' | 'training'
  title: string
  context: string
  timestamp: string
  read: boolean
  link: string
}

export interface Attachment {
  id: string
  filename: string
  url: string
  size: number
  type: string
}

// Store / State types
export interface UserState {
  employee: Employee | null
  isAuthenticated: boolean
  currentRole: Role
  language: Language
  sessionTimeout: number
}

export interface UiState {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  theme: 'light' | 'dark' | 'high-contrast'
  modals: string[]
  toasts: Toast[]
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration: number
}

// Dashboard types
export interface KPIWidget {
  label: string
  value: number | string
  trend?: number
  target?: number
  unit?: string
  icon?: string
  color?: string
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    color?: string
  }[]
}

export interface Department {
  id: string
  name: string
  head: string
  employeeCount: number
}

export interface InsightsData {
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  avgCompletionTime: string
  captainPerformance: {
    captainId: string
    name: string
    teamEfficiency: number
    rescueReduction: number
    compositeIndex: number
  }[]
}

export interface AuditLog {
  id: string
  action: string
  entity: string
  entityId: string
  performedBy: string
  timestamp: string
  details: string
}

export interface AppSettings {
  allowSelfRegistration: boolean
  requireApprovalForLeave: boolean
  autoEscalateAfterHours: number
  maxRemindersPerTask: number
  enableTrainingModule: boolean
  enableAttendanceTracking: boolean
  enableFMSIntegration: boolean
}
