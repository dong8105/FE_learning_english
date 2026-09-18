/**
 * LocalStorage Implementation of IStorageService
 * Safely handles SSR, JSON parsing, and quota exceptions
 */
import { IStorageService } from './IStorageService';

export class LocalStorageService implements IStorageService {
  getItem<T = any>(key: string): T | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return raw as unknown as T;
      }
    } catch (err) {
      console.warn(`[LocalStorageService] Error reading key "${key}":`, err);
      return null;
    }
  }

  setItem<T = any>(key: string, value: T): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    try {
      const stringified = typeof value === 'string' ? value : JSON.stringify(value);
      window.localStorage.setItem(key, stringified);
    } catch (err) {
      console.warn(`[LocalStorageService] Error writing key "${key}":`, err);
    }
  }

  removeItem(key: string): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    try {
      window.localStorage.removeItem(key);
    } catch (err) {
      console.warn(`[LocalStorageService] Error removing key "${key}":`, err);
    }
  }

  clear(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    try {
      window.localStorage.clear();
    } catch (err) {
      console.warn('[LocalStorageService] Error clearing storage:', err);
    }
  }
}

export const defaultStorageService = new LocalStorageService();
