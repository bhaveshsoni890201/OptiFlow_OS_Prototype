
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Employee, Worklist, LeaveRequest, BuddyTransfer, DelegationTask } from '../types'
import { useAdminStore } from './adminStore'
import { useTaskStore } from './taskStore'
import { useOfflineStore } from './offlineStore'
import { useRescueStore } from './rescueStore'
import { useStore } from './useStore'
import { useNotificationStore } from './notificationStore'
import { getLeaveRequests, submitLeaveRequestSvc, approveLeaveRequestSvc, rejectLeaveRequestSvc, escalateLeaveSvc, archiveLeaveSvc } from '../services'
import { logger } from '../utils/logger'
export const useWorkflowStore = defineStore('workflow', () => {
const loading = ref(false)
const error = ref('')
const lastAction = ref('')
// W1: Onboarding
async function onboardEmployee(data: {
name: string
department: string
designation: string
mobile: string
reporting_captain: string
email?: string
}): Promise<Employee> {
loading.value = true
lastAction.value = 'onboard-employee'
try {
const adminStore = useAdminStore()
const rootStore = useStore()
const count = adminStore.employees.length
const id = `EMP-${String(count + 1).padStart(4, '0')}`
const employee: Employee = {
employee_id: id,
name: data.name,
mobile: data.mobile,
email: data.email,
department: data.department,
designation: data.designation,
reporting_captain: data.reporting_captain,
roles: ['doer'],
status: 'active',
created_on: new Date().toISOString()
}
await adminStore.createEmployee(employee)
rootStore.addToast({
type: 'success',
message: `${employee.name} (${id}) created`,
duration: 4000
})
const notifyStore = useNotificationStore()
notifyStore.notifications.unshift({
id: `n-${Date.now()}`,
type: 'system',
title: 'New Employee Onboarded',
context: `${employee.name} (${id}) has been added to ${data.department}.`,
timestamp: new Date().toISOString(),
read: false,
link: `/admin/employees/${id}`,
})
return employee
} catch (e) {
logger.error('WorkflowStore', 'Failed to onboard employee', e)
throw e
} finally {
loading.value = false
}
}
async function assignWorklistToEmployee(employeeId: string, worklistId: string): Promise<void> {
loading.value = true
lastAction.value = 'assign-worklist'
try {
await new Promise((r) => setTimeout(r, 300))
const rootStore = useStore()
rootStore.addToast({
type: 'info',
message: `Worklist assigned to ${employeeId}`,
duration: 3000
})
} catch (e) {
logger.error('WorkflowStore', 'Failed to assign worklist', e)
} finally {
loading.value = false
}
}
// W2: Execution & Rescue
async function checkAndGenerateRescues(): Promise<void> {
try {
const rescueStore = useRescueStore()
await rescueStore.generateFromOverdueTasks()
lastAction.value = 'generate-rescues'
} catch (e) {
logger.error('WorkflowStore', 'Failed to check and generate rescues', e)
}
}
async function actOnRescue(
rescueId: string,
action: 'remind' | 'reassign' | 'escalate' | 'resolve',
payload?: { newEmployeeId?: string },
): Promise<void> {
loading.value = true
lastAction.value = `rescue-${action}`
try {
const rescueStore = useRescueStore()
const rootStore = useStore()
switch (action) {
case 'remind':
await rescueStore.sendReminder(rescueId)
rootStore.addToast({ type: 'info', message: 'Reminder sent', duration: 3000 })
break
case 'reassign':
if (payload?.newEmployeeId) {
await rescueStore.reassign(rescueId, payload.newEmployeeId)
rootStore.addToast({
type: 'success',
message: `Reassigned to ${payload.newEmployeeId}`,
duration: 3000
})
}
break
case 'escalate':
await rescueStore.escalate(rescueId)
rootStore.addToast({
type: 'warning',
message: 'Escalated to next severity level',
duration: 3000
})
break
case 'resolve':
await rescueStore.resolve(rescueId)
rootStore.addToast({ type: 'success', message: 'Rescue resolved', duration: 3000 })
break
}
} catch (e) {
logger.error('WorkflowStore', 'Failed to act on rescue', e)
} finally {
loading.value = false
}
}
// W3: Leave & Buddy Transfer
const leaveRequests = ref<LeaveRequest[]>([])
const buddyTransfers = ref<BuddyTransfer[]>([])
async function fetchLeaveRequests(): Promise<void> {
error.value = ''
try {
leaveRequests.value = await getLeaveRequests()
await archiveOldLeaves()
} catch (e) {
error.value = 'Failed to fetch leave requests'
logger.error('WorkflowStore', 'Failed to fetch leave requests', e)
}
}
async function submitLeaveRequest(data: {
employee_id: string
employee_name: string
leave_type: string
start_date: string
end_date: string
reason: string
buddy_id: string
buddy_name: string
}): Promise<void> {
loading.value = true
error.value = ''
lastAction.value = 'submit-leave'
try {
      const days = Math.ceil(
        (new Date(data.end_date).getTime() - new Date(data.start_date).getTime()) / 86400000
      ) + 1
      const leaveId = `LR-${Date.now()}`
      leaveRequests.value.unshift({
        id: leaveId,
        ...data,
        total_days: days,
        status: 'pending',
        created_on: new Date().toISOString()
      })
      await submitLeaveRequestSvc(data)
const rootStore = useStore()
const offlineStore = useOfflineStore()
if (offlineStore.isOnline) {
rootStore.addToast({ type: 'success', message: 'Leave request submitted', duration: 4000 })
} else {
offlineStore.addToQueue({
entityType: 'leave',
entityId: leaveId,
action: 'create',
payload: data
})
rootStore.addToast({
type: 'warning',
message: 'Saved offline, will sync when connected',
duration: 5000
})
}
    } catch (e) {
      leaveRequests.value = leaveRequests.value.filter((l) => l.id !== leaveId)
      error.value = 'Failed to submit leave request'
      logger.error('WorkflowStore', 'Failed to submit leave request', e)
    }
}
async function approveLeave(leaveId: string, overrideBuddyId?: string): Promise<void> {
loading.value = true
error.value = ''
lastAction.value = 'approve-leave'
try {
await approveLeaveRequestSvc(leaveId, overrideBuddyId || '')
const leave = leaveRequests.value.find((l) => l.id === leaveId)
if (!leave) return
leave.status = 'approved'
leave.reviewed_on = new Date().toISOString()
const taskStore = useTaskStore()
const tasksToTransfer = taskStore.delegationTasks.filter(
(t) => t.assigned_to === leave.employee_id && t.status !== 'completed'
)
const actualBuddyId = overrideBuddyId || leave.buddy_id
const transferred: BuddyTransfer[] = tasksToTransfer.map((t) => ({
id: `BT-${Date.now()}-${t.id}`,
leave_request_id: leaveId,
original_owner: leave.employee_id,
buddy_owner: actualBuddyId,
task_reference: t.id,
transfer_start: leave.start_date,
transfer_end: leave.end_date,
reverted: false
}))
buddyTransfers.value.push(...transferred)
const rootStore = useStore()
rootStore.addToast({
type: 'success',
message: `${transferred.length} task(s) transferred to ${leave.buddy_name}`,
duration: 5000
})
} catch (e) {
error.value = 'Failed to approve leave'
logger.error('WorkflowStore', 'Failed to approve leave', e)
} finally {
loading.value = false
}
}
async function rejectLeave(leaveId: string, reason: string): Promise<void> {
loading.value = true
error.value = ''
lastAction.value = 'reject-leave'
try {
await rejectLeaveRequestSvc(leaveId, reason)
const leave = leaveRequests.value.find((l) => l.id === leaveId)
if (leave) {
leave.status = 'rejected'
leave.rejection_reason = reason
leave.reviewed_on = new Date().toISOString()
}
const rootStore = useStore()
rootStore.addToast({ type: 'info', message: 'Leave request rejected', duration: 3000 })
} catch (e) {
error.value = 'Failed to reject leave'
logger.error('WorkflowStore', 'Failed to reject leave', e)
} finally {
loading.value = false
}
}
async function escalateLeave(leaveId: string, reason: string): Promise<void> {
loading.value = true
error.value = ''
lastAction.value = 'escalate-leave'
try {
await escalateLeaveSvc(leaveId, reason)
const leave = leaveRequests.value.find((l) => l.id === leaveId)
if (leave) {
leave.status = 'escalated'
leave.reviewed_on = new Date().toISOString()
}
const rootStore = useStore()
rootStore.addToast({ type: 'warning', message: 'Leave escalated to admin', duration: 3000 })
} catch (e) {
error.value = 'Failed to escalate leave'
logger.error('WorkflowStore', 'Failed to escalate leave', e)
} finally {
loading.value = false
}
}
async function archiveLeave(leaveId: string): Promise<void> {
loading.value = true
error.value = ''
lastAction.value = 'archive-leave'
try {
await archiveLeaveSvc(leaveId)
leaveRequests.value = leaveRequests.value.filter((l) => l.id !== leaveId)
const rootStore = useStore()
rootStore.addToast({ type: 'info', message: 'Leave request archived', duration: 3000 })
} catch (e) {
error.value = 'Failed to archive leave'
logger.error('WorkflowStore', 'Failed to archive leave', e)
} finally {
loading.value = false
}
}
async function autoRevertTasks(): Promise<void> {
loading.value = true
lastAction.value = 'revert-tasks'
try {
await new Promise((r) => setTimeout(r, 400))
const now = new Date()
const toRevert = buddyTransfers.value.filter(
(bt) => !bt.reverted && new Date(bt.transfer_end) < now
)
for (const bt of toRevert) {
bt.reverted = true
}
if (toRevert.length > 0) {
const rootStore = useStore()
rootStore.addToast({
type: 'info',
message: `${toRevert.length} task(s) reverted to original owner`,
duration: 4000
})
}
} catch (e) {
logger.error('WorkflowStore', 'Failed to auto-revert tasks', e)
} finally {
loading.value = false
}
}
async function checkAutoRevert(): Promise<void> {
try {
const active = buddyTransfers.value.filter((bt) => !bt.reverted)
const now = new Date()
const expired = active.filter((bt) => new Date(bt.transfer_end) < now)
if (expired.length > 0) await autoRevertTasks()
} catch (e) {
logger.error('WorkflowStore', 'Failed to check auto revert', e)
}
}
// Auto-escalate pending leaves older than 48 hours
async function checkAutoEscalate(): Promise<void> {
try {
const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)
const toEscalate = leaveRequests.value.filter(
(r) => r.status === 'pending' && new Date(r.created_on) < fortyEightHoursAgo
)
for (const leave of toEscalate) {
leave.status = 'escalated'
leave.reviewed_on = new Date().toISOString()
await escalateLeaveSvc(leave.id, 'Auto-escalated: no action taken within 48 hours')
const notifyStore = useNotificationStore()
notifyStore.notifications.unshift({
id: `n-autoesc-${Date.now()}`,
type: 'leave',
title: 'Leave Auto-Escalated',
context: `${leave.employee_name}'s leave request (${leave.id}) auto-escalated after 48h without action.`,
timestamp: new Date().toISOString(),
read: false,
link: `/admin/leave`,
})
}
if (toEscalate.length > 0) {
const rootStore = useStore()
rootStore.addToast({
type: 'warning',
message: `${toEscalate.length} leave request(s) auto-escalated to admin`,
duration: 5000
})
}
} catch (e) {
logger.error('WorkflowStore', 'Failed to check auto escalate', e)
}
}
// Archive leave requests older than 6 months
async function archiveOldLeaves(): Promise<void> {
try {
const sixMonthsAgo = new Date()
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
const toArchive = leaveRequests.value.filter(
(r) => r.status !== 'archived' && new Date(r.created_on) < sixMonthsAgo
)
for (const leave of toArchive) {
leave.status = 'archived'
await archiveLeaveSvc(leave.id)
}
} catch (e) {
logger.error('WorkflowStore', 'Failed to archive old leaves', e)
}
}
return {
loading,
error,
lastAction,
leaveRequests,
buddyTransfers,
onboardEmployee,
assignWorklistToEmployee,
checkAndGenerateRescues,
actOnRescue,
fetchLeaveRequests,
submitLeaveRequest,
approveLeave,
rejectLeave,
escalateLeave,
archiveLeave,
autoRevertTasks,
checkAutoRevert,
checkAutoEscalate,
archiveOldLeaves,
}
})
