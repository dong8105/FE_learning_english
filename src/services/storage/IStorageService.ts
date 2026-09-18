/**
 * Storage Service Abstraction (Dependency Inversion Principle)
 */

export interface IStorageService {
  getItem<T = any>(key: string): T | null;
  setItem<T = any>(key: string, value: T): void;
  removeItem(key: string): void;
  clear(): void;
}
