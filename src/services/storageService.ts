/**
 * Storage Abstraction & Implementations (SRP, LSP, DIP)
 */

export interface IStorageService {
  getItem<T>(key: string, fallback?: T): T | null;
  setItem<T>(key: string, value: T): boolean;
  removeItem(key: string): boolean;
}

export class LocalStorageService implements IStorageService {
  public getItem<T>(key: string, fallback?: T): T | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return fallback !== undefined ? fallback : null;
    }
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return fallback !== undefined ? fallback : null;
      return JSON.parse(raw) as T;
    } catch {
      // If it's a raw string rather than JSON
      try {
        const raw = window.localStorage.getItem(key);
        return (raw as unknown) as T;
      } catch {
        return fallback !== undefined ? fallback : null;
      }
    }
  }

  public setItem<T>(key: string, value: T): boolean {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      window.localStorage.setItem(key, serialized);
      return true;
    } catch (err) {
      console.warn(`LocalStorageService: Failed to save key "${key}"`, err);
      return false;
    }
  }

  public removeItem(key: string): boolean {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
}

export class MemoryStorageService implements IStorageService {
  private memory = new Map<string, string>();

  public getItem<T>(key: string, fallback?: T): T | null {
    const raw = this.memory.get(key);
    if (raw === undefined) return fallback !== undefined ? fallback : null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return (raw as unknown) as T;
    }
  }

  public setItem<T>(key: string, value: T): boolean {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    this.memory.set(key, serialized);
    return true;
  }

  public removeItem(key: string): boolean {
    return this.memory.delete(key);
  }
}

// Global default singleton instance
export const defaultStorage: IStorageService = new LocalStorageService();
