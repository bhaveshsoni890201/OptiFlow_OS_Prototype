import type { Notification } from '../types'
import { endpoints } from '../api/endpoints'
import { BaseService } from './BaseService'

class NotificationService extends BaseService {
  protected entityName = 'Notification'

  async getNotifications(): Promise<Notification[]> {
    return this.fetchList<Notification>(
      endpoints.notifications.list,
      async () => {
        const { notifications } = await import('../mock/rescue')
        return notifications
      },
      'notification:list',
    )
  }

  async markNotificationRead(id: string): Promise<void> {
    await this.mutate('put', endpoints.notifications.markRead(id), undefined, ['notification:'])
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.mutate('post', endpoints.notifications.markAllRead, undefined, ['notification:'])
  }
}

const notificationService = new NotificationService()

export const getNotifications = () => notificationService.getNotifications()
export const markNotificationRead = (id: string) => notificationService.markNotificationRead(id)
export const markAllNotificationsRead = () => notificationService.markAllNotificationsRead()
