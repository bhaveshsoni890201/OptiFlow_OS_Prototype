import type { RescueRecord } from '../types'
import { endpoints } from '../api/endpoints'
import { BaseService } from './BaseService'

class RescueService extends BaseService {
  protected entityName = 'Rescue'

  async getRescueRecords(): Promise<RescueRecord[]> {
    return this.fetchList<RescueRecord>(
      endpoints.rescue.list,
      async () => {
        const { rescueRecords } = await import('../mock/rescue')
        return rescueRecords
      },
      'rescue:list',
    )
  }

  async getRescueDetail(id: string): Promise<RescueRecord> {
    const result = await this.fetchOne<RescueRecord>(
      endpoints.rescue.detail(id),
      async () => {
        const { rescueRecords } = await import('../mock/rescue')
        return rescueRecords.find((r) => r.id === id)
      },
      `rescue:${id}`,
      60_000,
    )
    if (!result) throw new Error(`Rescue record ${id} not found`)
    return result
  }

  async sendReminder(id: string): Promise<void> {
    await this.mutate('post', endpoints.rescue.remind(id), undefined, ['rescue:'])
  }

  async reassignRescue(id: string, newEmployeeId: string): Promise<void> {
    await this.mutate('post', endpoints.rescue.reassign(id), { employee_id: newEmployeeId }, ['rescue:'])
  }

  async escalateRescue(id: string): Promise<void> {
    await this.mutate('post', endpoints.rescue.escalate(id), undefined, ['rescue:'])
  }

  async resolveRescue(id: string): Promise<void> {
    await this.mutate('post', endpoints.rescue.resolve(id), undefined, ['rescue:'])
  }
}

const rescueService = new RescueService()

export const getRescueRecords = () => rescueService.getRescueRecords()
export const getRescueDetail = (id: string) => rescueService.getRescueDetail(id)
export const sendReminder = (id: string) => rescueService.sendReminder(id)
export const reassignRescue = (id: string, newEmployeeId: string) => rescueService.reassignRescue(id, newEmployeeId)
export const escalateRescue = (id: string) => rescueService.escalateRescue(id)
export const resolveRescue = (id: string) => rescueService.resolveRescue(id)
