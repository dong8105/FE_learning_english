import { IVisibilitySettings, IVisibilityService } from '../types/visibility.types';
import { IStorageService, defaultStorage } from './storageService';

export const DEFAULT_VISIBILITY_SETTINGS: IVisibilitySettings = {
  hiddenTopics: [],
  sidebarHiddenTopics: [],
  showGrammar: true,
  showGames: true,
  showVocabPractice: true,
  hiddenPracticeItems: [],
  adminBypassHidden: true,
  lockAi: false,
  showEnglishVoiceSettings: true,
  showJapaneseVoiceSettings: true,
  showWordCount: true,
  showChuyendeVocab: true,
  showDailyVocab: true,
  showMasterVocab: true,
};

const STORAGE_KEY = 'engmaster_visibility_settings';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export class VisibilityService implements IVisibilityService {
  private storage: IStorageService;
  private baseUrl: string;

  constructor(storage: IStorageService = defaultStorage, baseUrl: string = API_BASE_URL) {
    this.storage = storage;
    this.baseUrl = baseUrl;
  }

  public getCachedSettings(): IVisibilitySettings {
    const cached = this.storage.getItem<IVisibilitySettings>(STORAGE_KEY);
    return cached || DEFAULT_VISIBILITY_SETTINGS;
  }

  public async fetchSettings(token?: string | null): Promise<IVisibilitySettings> {
    try {
      const headers: Record<string, string> = {};
      const effectiveToken = token || this.storage.getItem<string>('engmaster_token');
      if (effectiveToken) {
        headers['Authorization'] = `Bearer ${effectiveToken}`;
      }

      const res = await fetch(`${this.baseUrl}/api/settings/visibility`, {
        credentials: 'include',
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        const merged: IVisibilitySettings = {
          hiddenTopics: Array.isArray(data.hiddenTopics) ? data.hiddenTopics : [],
          sidebarHiddenTopics: Array.isArray(data.sidebarHiddenTopics) ? data.sidebarHiddenTopics : [],
          showGrammar: data.showGrammar !== false,
          showGames: data.showGames !== false,
          showVocabPractice: data.showVocabPractice !== false,
          hiddenPracticeItems: Array.isArray(data.hiddenPracticeItems) ? data.hiddenPracticeItems : [],
          adminBypassHidden: data.adminBypassHidden !== false,
          lockAi: data.lockAi === true,
          showEnglishVoiceSettings: data.showEnglishVoiceSettings !== false,
          showJapaneseVoiceSettings: data.showJapaneseVoiceSettings !== false,
          showWordCount: data.showWordCount !== false,
          showChuyendeVocab: data.showChuyendeVocab !== false,
          showDailyVocab: data.showDailyVocab !== false,
          showMasterVocab: data.showMasterVocab !== false,
        };
        this.storage.setItem(STORAGE_KEY, merged);
        return merged;
      }
    } catch (err) {
      console.log('VisibilityService: API unavailable, using cached settings');
    }
    return this.getCachedSettings();
  }

  public async saveSettings(settings: IVisibilitySettings, token?: string | null): Promise<boolean> {
    this.storage.setItem(STORAGE_KEY, settings);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const effectiveToken = token || this.storage.getItem<string>('engmaster_token');
      if (effectiveToken) {
        headers['Authorization'] = `Bearer ${effectiveToken}`;
      }

      const res = await fetch(`${this.baseUrl}/api/settings/visibility`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(settings),
      });
      return res.ok;
    } catch (err) {
      console.warn('VisibilityService: Failed to save to server', err);
      return false;
    }
  }

  public async fetchUserSettings(userId: string, token?: string | null): Promise<{ hasCustom: boolean; settings: IVisibilitySettings }> {
    const headers: Record<string, string> = {};
    const effectiveToken = token || this.storage.getItem<string>('engmaster_token');
    if (effectiveToken) {
      headers['Authorization'] = `Bearer ${effectiveToken}`;
    }

    const res = await fetch(`${this.baseUrl}/api/admin/users/${userId}/visibility`, {
      credentials: 'include',
      headers,
    });
    if (!res.ok) throw new Error('Failed to fetch user visibility');
    const data = await res.json();
    return {
      hasCustom: Boolean(data.hasCustom),
      settings: {
        hiddenTopics: Array.isArray(data.settings?.hiddenTopics) ? data.settings.hiddenTopics : [],
        sidebarHiddenTopics: Array.isArray(data.settings?.sidebarHiddenTopics) ? data.settings.sidebarHiddenTopics : [],
        showGrammar: data.settings?.showGrammar !== false,
        showGames: data.settings?.showGames !== false,
        showVocabPractice: data.settings?.showVocabPractice !== false,
        hiddenPracticeItems: Array.isArray(data.settings?.hiddenPracticeItems) ? data.settings.hiddenPracticeItems : [],
        adminBypassHidden: data.settings?.adminBypassHidden !== false,
        lockAi: data.settings?.lockAi === true,
        showEnglishVoiceSettings: data.settings?.showEnglishVoiceSettings !== false,
        showJapaneseVoiceSettings: data.settings?.showJapaneseVoiceSettings !== false,
        showWordCount: data.settings?.showWordCount !== false,
        showChuyendeVocab: data.settings?.showChuyendeVocab !== false,
        showDailyVocab: data.settings?.showDailyVocab !== false,
        showMasterVocab: data.settings?.showMasterVocab !== false,
      },
    };
  }

  public async saveUserSettings(userId: string, settings: IVisibilitySettings, token?: string | null): Promise<boolean> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const effectiveToken = token || this.storage.getItem<string>('engmaster_token');
    if (effectiveToken) {
      headers['Authorization'] = `Bearer ${effectiveToken}`;
    }

    const res = await fetch(`${this.baseUrl}/api/admin/users/${userId}/visibility`, {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify(settings),
    });
    return res.ok;
  }

  public async resetUserSettings(userId: string, token?: string | null): Promise<boolean> {
    const headers: Record<string, string> = {};
    const effectiveToken = token || this.storage.getItem<string>('engmaster_token');
    if (effectiveToken) {
      headers['Authorization'] = `Bearer ${effectiveToken}`;
    }

    const res = await fetch(`${this.baseUrl}/api/admin/users/${userId}/visibility`, {
      method: 'DELETE',
      credentials: 'include',
      headers,
    });
    return res.ok;
  }
}

export const defaultVisibilityService = new VisibilityService();
