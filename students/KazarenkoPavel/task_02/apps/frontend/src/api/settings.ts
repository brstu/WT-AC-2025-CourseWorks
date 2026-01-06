import { apiClient, extractData } from './client';
import { NotificationSettings, UpdateNotificationSettingsInput } from '../types';

export const settingsApi = {
  async getNotifications(): Promise<NotificationSettings> {
    const response = await apiClient.get('/settings/notifications');
    return extractData(response);
  },

  async updateNotifications(data: UpdateNotificationSettingsInput): Promise<NotificationSettings> {
    const response = await apiClient.put('/settings/notifications', data);
    return extractData(response);
  },
};
