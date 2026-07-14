import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      console.error(`[StorageService] Error reading "${key}" from localStorage`);
      return null;
    }
  }

  set(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.error(`[StorageService] Error writing "${key}" to localStorage`);
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      console.error(`[StorageService] Error removing "${key}" from localStorage`);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch {
      console.error('[StorageService] Error clearing localStorage');
    }
  }
}
