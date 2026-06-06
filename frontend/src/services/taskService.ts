import type { DelegationTask, ChecklistItem, FMSTask, Task, TaskStatus, TaskType } from '../types'
import { endpoints } from '../api/endpoints'
import { BaseService } from './BaseService'

class TaskService extends BaseService {
  protected entityName = 'Task'

  async getDelegationTasks(): Promise<DelegationTask[]> {
    return this.fetchList<DelegationTask>(
      endpoints.tasks.list + '?type=delegation',
      async () => {
        const { delegationTasks } = await import('../mock/tasks')
        return delegationTasks
      },
      'task:delegation',
    )
  }

  async getChecklistTasks(): Promise<ChecklistItem[]> {
    return this.fetchList<ChecklistItem>(
      endpoints.tasks.list + '?type=checklist',
      async () => {
        const { checklistItems } = await import('../mock/tasks')
        return checklistItems
      },
      'task:checklist',
    )
  }

  async getFMSTasks(): Promise<FMSTask[]> {
    return this.fetchList<FMSTask>(
      endpoints.tasks.list + '?type=fms',
      async () => {
        const { fmsTasks } = await import('../mock/tasks')
        return fmsTasks
      },
      'task:fms',
    )
  }

  async getAllTasks(): Promise<{ delegation: DelegationTask[]; checklist: ChecklistItem[]; fms: FMSTask[] }> {
    const [delegation, checklist, fms] = await Promise.all([
      this.getDelegationTasks(),
      this.getChecklistTasks(),
      this.getFMSTasks(),
    ])
    return { delegation, checklist, fms }
  }

  async createTask(task: Task): Promise<void> {
    await this.mutate('post', endpoints.tasks.create, task, ['task:'])
  }

  async updateTaskStatus(taskId: string, type: TaskType, status: TaskStatus): Promise<void> {
    await this.mutate('put', endpoints.tasks.update(taskId), { type, status }, ['task:'])
  }
}

const taskService = new TaskService()

export const getDelegationTasks = () => taskService.getDelegationTasks()
export const getChecklistTasks = () => taskService.getChecklistTasks()
export const getFMSTasks = () => taskService.getFMSTasks()
export const getAllTasks = () => taskService.getAllTasks()
export const createTask = (task: Task) => taskService.createTask(task)
export const updateTaskStatus = (taskId: string, type: TaskType, status: TaskStatus) => taskService.updateTaskStatus(taskId, type, status)
