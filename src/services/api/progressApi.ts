/**
 * User Progress & Streak API Client
 */
import { defaultHttpClient, HttpClient } from './httpClient';

export interface IProgressResponse<T = any> {
  success: boolean;
  progressType: string;
  data: T | null;
  updatedAt?: string;
}

export class ProgressApi {
  constructor(private client: HttpClient = defaultHttpClient) {}

  async getProgress<T = any>(type: string): Promise<IProgressResponse<T>> {
    return this.client.get<IProgressResponse<T>>(`/api/progress/${type}`);
  }

  async saveProgress<T = any>(type: string, data: T): Promise<{ success: boolean; progressType: string }> {
    return this.client.post(`/api/progress/${type}`, { data });
  }

  async getAdminMetrics(): Promise<any> {
    return this.client.get('/api/admin/metrics');
  }

  async getAdminUsers(): Promise<any[]> {
    return this.client.get('/api/admin/users');
  }

  async updateAdminStreak(userId: string, streakCount: number, lastActiveDate?: string): Promise<any> {
    return this.client.put(`/api/admin/users/${userId}/streak`, { streakCount, lastActiveDate });
  }
}

export const defaultProgressApi = new ProgressApi();
