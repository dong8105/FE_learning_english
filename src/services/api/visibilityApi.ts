/**
 * Visibility Settings API Client
 */
import { defaultHttpClient, HttpClient } from './httpClient';
import { IVisibilitySettings } from '../../types/visibility.types';

export class VisibilityApi {
  constructor(private client: HttpClient = defaultHttpClient) {}

  async getSettings(): Promise<IVisibilitySettings> {
    return this.client.get<IVisibilitySettings>('/api/settings/visibility');
  }

  async updateGlobalSettings(settings: Partial<IVisibilitySettings>): Promise<{ success: boolean; settings: IVisibilitySettings }> {
    return this.client.post('/api/settings/visibility', settings);
  }

  async getCustomUserIds(): Promise<{ success: boolean; customUserIds: string[] }> {
    return this.client.get('/api/admin/visibility/custom-users');
  }

  async getUserSettings(userId: string): Promise<{ success: boolean; isCustom: boolean; settings: IVisibilitySettings }> {
    return this.client.get(`/api/admin/users/${userId}/visibility`);
  }

  async saveUserSettings(userId: string, settings: Partial<IVisibilitySettings>): Promise<{ success: boolean; settings: IVisibilitySettings }> {
    return this.client.post(`/api/admin/users/${userId}/visibility`, settings);
  }

  async deleteUserSettings(userId: string): Promise<{ success: boolean }> {
    return this.client.delete(`/api/admin/users/${userId}/visibility`);
  }
}

export const defaultVisibilityApi = new VisibilityApi();
