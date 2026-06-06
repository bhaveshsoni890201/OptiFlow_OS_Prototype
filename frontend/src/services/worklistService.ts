import type { Worklist } from '../types'
import { endpoints } from '../api/endpoints'
import { BaseService } from './BaseService'

class WorklistService extends BaseService {
  protected entityName = 'Worklist'

  async getWorklists(): Promise<Worklist[]> {
    return this.fetchList<Worklist>(
      endpoints.worklists.list,
      async () => {
        const { worklists } = await import('../mock/tasks')
        return worklists
      },
      'worklist:list',
    )
  }

  async createWorklist(data: Partial<Worklist>): Promise<void> {
    await this.mutate('post', endpoints.worklists.create, data, ['worklist:'])
  }

  async updateWorklist(id: string, data: Partial<Worklist>): Promise<void> {
    await this.mutate('put', endpoints.worklists.update(id), data, ['worklist:'])
  }
}

const worklistService = new WorklistService()

export const getWorklists = () => worklistService.getWorklists()
export const createWorklist = (data: Partial<Worklist>) => worklistService.createWorklist(data)
export const updateWorklist = (id: string, data: Partial<Worklist>) => worklistService.updateWorklist(id, data)
