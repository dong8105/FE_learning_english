/**
 * Authentication API Client
 */
import { defaultHttpClient, HttpClient } from './httpClient';

export interface IUserProfile {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'user';
  created_at?: string;
}

export interface IAuthResponse {
  success: boolean;
  user: IUserProfile;
  token: string;
}

export class AuthApi {
  constructor(private client: HttpClient = defaultHttpClient) {}

  async login(username: string, password: string): Promise<IAuthResponse> {
    return this.client.post<IAuthResponse>('/api/auth/login', { username, password });
  }

  async register(username: string, password: string, name: string): Promise<IAuthResponse> {
    return this.client.post<IAuthResponse>('/api/auth/register', { username, password, name });
  }
}

export const defaultAuthApi = new AuthApi();
