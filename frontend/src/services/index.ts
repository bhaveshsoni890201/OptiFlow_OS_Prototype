export { isMockMode } from './config'

export {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from './employeeService'

export {
  getDelegationTasks,
  getChecklistTasks,
  getFMSTasks,
  getAllTasks,
  createTask,
  updateTaskStatus,
} from './taskService'

export {
  getAttendanceLogs,
  getAttendanceCorrections,
  checkInSvc,
  checkOutSvc,
  submitAttendanceCorrection,
} from './attendanceService'

export {
  getLeaveRequests,
  getBuddyTransfers,
  submitLeaveRequestSvc,
  approveLeaveRequestSvc,
  rejectLeaveRequestSvc,
  escalateLeaveSvc,
  archiveLeaveSvc,
} from './leaveService'

export {
  getHelpTickets,
  getHelpTicket,
  createHelpTicket,
  addTicketComment,
  closeTicket,
  reopenTicket,
  assignTicket,
  escalateTicket,
} from './ticketService'

export {
  getTrainingAssignments,
  getTrainingContent,
} from './trainingService'

export {
  getWorklists,
} from './worklistService'

export {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from './notificationService'

export {
  login,
  verifyOtp,
  getProfile,
  forgotPassword,
  resetPassword,
} from './authService'

export {
  getRescueRecords,
  sendReminder,
  reassignRescue,
  escalateRescue,
  resolveRescue,
} from './rescueService'

export {
  getDepartments,
  createDepartment,
  updateDepartment,
} from './departmentService'

export {
  subscribe,
  connectSSE,
  connectWebSocket,
  disconnect,
} from './realtimeService'
