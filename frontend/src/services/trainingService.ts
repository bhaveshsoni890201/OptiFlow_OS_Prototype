import type { TrainingAssignment, TrainingContent } from '../types'
import { endpoints } from '../api/endpoints'
import { BaseService } from './BaseService'

class TrainingService extends BaseService {
  protected entityName = 'Training'

  async getTrainingAssignments(): Promise<TrainingAssignment[]> {
    return this.fetchList<TrainingAssignment>(
      endpoints.training.list,
      async () => {
        const { trainingAssignments } = await import('../mock/training')
        return trainingAssignments
      },
      'training:assignments',
    )
  }

  async getTrainingContent(contentId: string): Promise<TrainingContent | undefined> {
    return this.fetchOne<TrainingContent>(
      endpoints.training.content(contentId),
      async () => {
        const { trainingContents } = await import('../mock/trainingContent')
        return trainingContents[contentId]
      },
      `training:content:${contentId}`,
      60_000,
    )
  }

  async updateTrainingProgress(id: string, status: 'in_progress' | 'completed'): Promise<void> {
    await this.mutate('post', endpoints.training.progress(id), { status }, ['training:'])
  }

  async markTrainingComplete(id: string): Promise<void> {
    await this.mutate('post', endpoints.training.markComplete(id), undefined, ['training:'])
  }
}

const trainingService = new TrainingService()

export const getTrainingAssignments = () => trainingService.getTrainingAssignments()
export const getTrainingContent = (contentId: string) => trainingService.getTrainingContent(contentId)
export const updateTrainingProgress = (id: string, status: 'in_progress' | 'completed') =>
  trainingService.updateTrainingProgress(id, status)
export const markTrainingComplete = (id: string) => trainingService.markTrainingComplete(id)
