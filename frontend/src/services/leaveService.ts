import type { LeaveRequest, BuddyTransfer } from '../types'
import { endpoints } from '../api/endpoints'
import { BaseService } from './BaseService'

class LeaveService extends BaseService {
  protected entityName = 'Leave'

  async getLeaveRequests(): Promise<LeaveRequest[]> {
    return this.fetchList<LeaveRequest>(
      endpoints.leave.list,
      async () => {
        const { leaveRequests } = await import('../mock/leave')
        return leaveRequests
      },
      'leave:requests',
    )
  }

  async getBuddyTransfers(): Promise<BuddyTransfer[]> {
    return this.fetchList<BuddyTransfer>(
      endpoints.leave.buddyTransfers,
      async () => {
        const { buddyTransfers } = await import('../mock/leave')
        return buddyTransfers
      },
      'leave:buddy',
    )
  }

  async submitLeaveRequestSvc(data: {
    leave_type: string
    start_date: string
    end_date: string
    reason: string
    buddy_id: string
  }): Promise<void> {
    await this.mutate('post', endpoints.leave.submit, data, ['leave:'])
  }

  async approveLeaveRequestSvc(id: string): Promise<void> {
    await this.mutate('post', endpoints.leave.approve(id), undefined, ['leave:'])
  }

  async rejectLeaveRequestSvc(id: string, reason: string): Promise<void> {
    await this.mutate('post', endpoints.leave.reject(id), { reason }, ['leave:'])
  }

  async escalateLeaveSvc(id: string, reason: string): Promise<void> {
    await this.mutate('post', endpoints.leave.escalate(id), { reason }, ['leave:'])
  }

  async archiveLeaveSvc(id: string): Promise<void> {
    await this.mutate('post', endpoints.leave.archive(id), undefined, ['leave:'])
  }
}

const leaveService = new LeaveService()

export const getLeaveRequests = () => leaveService.getLeaveRequests()
export const getBuddyTransfers = () => leaveService.getBuddyTransfers()
export const submitLeaveRequestSvc = (data: Parameters<LeaveService['submitLeaveRequestSvc']>[0]) =>
  leaveService.submitLeaveRequestSvc(data)
export const approveLeaveRequestSvc = (id: string) => leaveService.approveLeaveRequestSvc(id)
export const rejectLeaveRequestSvc = (id: string, reason: string) => leaveService.rejectLeaveRequestSvc(id, reason)
export const escalateLeaveSvc = (id: string, reason: string) => leaveService.escalateLeaveSvc(id, reason)
export const archiveLeaveSvc = (id: string) => leaveService.archiveLeaveSvc(id)
